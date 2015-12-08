# Introduction #

The latest OMAR svn code will have a geodata plugin project under "plugins" directory and a geodata-test project under "apps" directory.  These are sample code projects put in the repository to help you get started developing with OMAR.  The plugin displays a dot for every city in the world. In the lesson we will walk through the creation of each one.


# Details #

To re-create the geodata plugin, we will create a plugin called mygeodata, so that we don't modify anything in the geodata project.

  1. Create your plugin project structure.
    * Change directory to $OMAR\_DEV\_HOME/plugins (see OMAR\_Installation)
    * Run the following command
```
grails create-plugin mygeodata
```
  1. Open plugin project with Netbeans
    * From file menu, select "Open project" and navigate to $OMAR\_DEV\_HOME/plugins/mygeodata
  1. Add plugin dependencies for your plugin
    * Expand project, Click the "Configuration" folder and select the BuildConfig.groovy file.  Add the following at the end of the file
```
grails.plugin.location.postgis = '../../plugins/postgis'
grails.plugin.location.openlayers = '../../plugins/openlayers'
grails.plugin.location.geoscript = '../../plugins/geoscript'
```
  1. Create a City Domain class
    * Expand project, right click on Domain Classes and select "New" -> "Grails Domain Class"
    * Enter "City" for the Artifact Name and "geodata" for Package. Click on the Finish button.
  1. Edit the Domain Class to the following:
```
package geodata

import com.vividsolutions.jts.geom.Point

class City
{
// CITY_NAME,COUNTRY,POP,CAP,LONGITUDE,LATITUDE

  String name
  String country
  Integer population
  Boolean capital
  Double longitude
  Double latitude

  Point groundGeom

  static constraints = {
    name()
    country()
    population()
    capital()
    longitude()
    latitude()
  }

  static mapping = {
    columns {
      groundGeom type: org.hibernatespatial.GeometryUserType //Insures that hibernate will work with JTS Geonetry type (IE: jts.geom.Point)
    }
  }
}
```
  1. Generate Controllers and Views. (Since we are going to need to edit the controllers and views, we can't use scaffolding)
    * Right Click on your "City.groovy" domain class and select "Generate All"
  1. Create function to Populate our Plugin with data.
    * Right Click "Groovy Source Packages" and select "New" -> "Groovy Class"
    * For Class Name put "CityData" and for Package use "geodata".  Select the "Finish" button.
    * Edit the CityData.groovy file that was just created to look like this:
```
package geodata

import com.vividsolutions.jts.geom.Coordinate
import com.vividsolutions.jts.geom.GeometryFactory
import com.vividsolutions.jts.geom.PrecisionModel

class CityData
{
  static def load()
  {
    def geometryFactory = new GeometryFactory(new PrecisionModel(), 4326)

    City.withTransaction {
      def istream = CityData.class.getResourceAsStream('cities.csv')

      istream?.toCsvReader([skipLines: 1]).eachLine {  tokens ->

        def city = new City()

        // CITY_NAME,COUNTRY,POP,CAP,LONGITUDE,LATITUDE

        city.with {
          name = tokens[0]
          country = tokens[1]
          population = tokens[2] as Integer
          capital = tokens[3] == 'Y' ? true : false
          longitude = tokens[4] as Double
          latitude = tokens[5] as Double
          groundGeom = geometryFactory.createPoint(new Coordinate(longitude, latitude))
        }

        city.save()
      }

      istream?.close()
    }
  }
}
```
    * Place the [cities.csv](https://icode-mda.googlecode.com/svn/wiki/scripts/cities.csv) file in the same directory as the "CityData.groovy" file.
  1. Create Service to display City Map
    * Right click on Services and select "New" -> "Grails Service".
    * For Artifact name put "CityMap" and for package put "geodata".  Select the "Finish" button.
    * Edit the CityMapService.groovy file just created to look like the following:
```
package geodata

import org.apache.commons.collections.map.CaseInsensitiveMap

import java.awt.image.BufferedImage
import javax.imageio.ImageIO

import geoscript.geom.Bounds
import geoscript.proj.Projection
import geoscript.proj.Projection
import geoscript.render.Draw
import geoscript.style.Shape
import geoscript.style.Stroke
import geoscript.style.Fill
import geoscript.style.Label
import geoscript.workspace.Database
import geoscript.workspace.PostGIS

import org.geotools.factory.Hints
import org.geotools.data.postgis.PostgisNGDataStoreFactory

import grails.converters.JSON

class CityMapService {

  //Roll back database writes
  static transactional = false

  def grailsApplication
  def dataSource

  //////////////
  // getMap  
  //////////////
  def getMap(def params, def response)
  {
    def wmsParams = new CaseInsensitiveMap(params) //key value maps (wms input parameters)
    def mode = 'geoscript'
    def image

    def width = wmsParams['width']?.toInteger()
    def height = wmsParams['height']?.toInteger()
    def format = wmsParams['format']
    def bbox = wmsParams['bbox']?.split(',').collect { it?.toDouble() }
    def layers = wmsParams['layers']
    def srs = wmsParams['srs']   //Projections
    def imageType = format?.split('/')[-1]
    def styles = wmsParams['styles']

    //Tells factory should be forece to long, lat axis order.
    Hints.putSystemDefault(Hints.FORCE_LONGITUDE_FIRST_AXIS_ORDER, Boolean.TRUE);

    switch ( mode )
    {
    case 'geoscript':
      def workspace = createWorkspace()  //Create GeoScript workspace
      def layer = workspace[layers]
      def proj = new Projection(srs)
      def bounds = new Bounds(bbox[0], bbox[1], bbox[2], bbox[3], proj)

      layer.style = createStyle(styles) //get collection of geoScript style Objects: fills, labels, stokes, etc.
      image = Draw.drawToImage(layer, bounds, [width, height],) //Object, bounds, size
      break
      
    default:
      image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB)
    }

    def ostream = response.outputStream

    response.contentType = format
    ImageIO.write(image, imageType, ostream)
    ostream.close()
  }//getMap



  //////////////////
  // Create Style
  //////////////////
  def createStyle(def styleJSON)
  {
    //Converters aim to give you the ability to quickly transform any kind of Java/Groovy object to JSON
    def jsonObject = JSON.parse(styleJSON) //Get JsonObject
    def styleMap = jsonObject.entrySet().inject([:]) { result, i -> result[i.key] = i.value; return result} //load Result object
    def style

    //For each key Value pair
    styleMap.each { k, v ->
      def tmp
      switch ( k )
      {
      case "fill":
        tmp = new Fill(v)
        break
      case "shape":
        tmp = new Shape(v)
        break
      case "stroke":
        tmp = new Stroke(v)
        break
      case "label":
        tmp = new Label(v)
        break
      }

      style = (!style) ? tmp : style + tmp
    }

    return style
  }


  ///////////////////////
  //createWorkspace
  //  Creates a GeoScript workspace 
  //  www.geoscript.workspace.PostGIS
  //////////////////////
  def createWorkspace(def flag = true)
  {
    def workspace = null

    if ( flag )
    {
      //Get info about grails app data source from Config DataSource.groovy
      def jdbcParams = grailsApplication.config.dataSource

      def dbParams = [
              dbtype: "postgis",           //must be postgis
              user: jdbcParams.username,   //the user to connect with
              passwd: jdbcParams.password, //the password of the user.
              schema: "public"
      ]

      //URL patterns used for matching
      def pattern1 = "jdbc:(.*)://(.*):(.*)/(.*)"
      def pattern2 = "jdbc:(.*)://(.*)/(.*)"
      def pattern3 = "jdbc:(.*):(.*)"


      //Parse to get host port and DB info
      switch ( jdbcParams.url )
      {
      case ~pattern1:
        def matcher = (jdbcParams.url) =~ pattern1
        dbParams['host'] = matcher[0][2]
        dbParams['port'] = matcher[0][3]
        dbParams['database'] = matcher[0][4]
        break
      case ~pattern2:
        def matcher = (jdbcParams.url) =~ pattern2
        dbParams['host'] = matcher[0][2]
        dbParams['port'] = "5432"
        dbParams['database'] = matcher[0][3]
        break
      case ~pattern3:
        def matcher = (jdbcParams.url) =~ pattern3
        dbParams['host'] = "localhost"
        dbParams['port'] = "5432"
        dbParams['database'] = matcher[0][2]
        break
      }

      //Create geoscript workspace
      workspace = new PostGIS(
              dbParams['database'],
              dbParams['host'],
              dbParams['port'],
              dbParams['schema'],
              dbParams['user'],
              dbParams['passwd']
      )
    }
    else
    {
      def getDbParams = [(PostgisNGDataStoreFactory.DATASOURCE.key): dataSource]
      def dataStore = new PostgisNGDataStoreFactory().createDataStore(getDbParams)

      workspace = new Database(dataStore)
    }

    return workspace
  }
}

```
  1. Modify the CityController.groovy file to include the index and wms actions.  Notices that this is different then what they are doing in the geodata sample. They put these actions inside the application.  We are changing it a bit so that most of the work we do will be inside our plugin and not in the application (IE OMAR)
    * Inside the class of the controller, add to the top:
```
def cityMapService
```
    * Add the following two actions to your controller.  The 'WMS' action calls our service.
```
  def map = {
  }

  def wms = {
    cityMapService.getMap(params, response)
  }
```
  1. Add the map view to your plugin.
    * Now that you added the map action, you need a map view. The view will call our WMS action to display our dots. Click on your project "Views and Layouts", right click on city and select "New" -> "GSP File".  For file name put "map".  Click the "Finish" button.  Modify the new map.gsp file to the following:
```

<!--
  To change this template, choose Tools | Templates
  and open the template in the editor.
-->

<%@ page contentType="text/html;charset=UTF-8" %>

<html>
  
  <head>
  <title>Cities Map</title>
  <meta content="main" name="layout">

  <link rel="stylesheet" href="${resource(plugin: 'openlayers', dir: 'js/theme/default', file: 'style.css')}"
        type="text/css">

  <style type="text/css">
  #map {
    background: #7391ad;
    border: 1;
    height: 512px;
    width: 1024px;
  }
  </style>
  <g:javascript plugin="openlayers" src="OpenLayers.js"/>
  <g:javascript>
    var lon = 0;
    var lat = 0;
    var map, layers;

    function init()
    {
      <!-- -->
      map = new OpenLayers.Map( 'map' );

      layers = [

        new OpenLayers.Layer.WMS("VMAP",
          "http://vmap0.tiles.osgeo.org/wms/vmap0", 
	  {layers:'basic'} 
	  ),

        new OpenLayers.Layer.WMS( "Reference",
          "http://${InetAddress.localHost.hostAddress}/cgi-bin/mapserv?map=/data/omar/bmng.map&",
          {layers:'Reference', format: 'image/jpeg'},
          {buffer: 0, transitionEffect: 'resize'}
          ),
	  
        new OpenLayers.Layer.WMS( "Cities",
          "${createLink(controller: 'city', action: 'wms')}",
          {layers:'city', format: 'image/png', styles: '{shape: {color: "#FF0000", type: "circle", size: 5}, fill: {color: "#000000", opacity: 0}, label: {property: "name"}}'},
          {buffer: 0, transitionEffect: 'resize', isBaseLayer: false}
          )
      ];


      map.addLayers( layers );
      map.zoomToMaxExtent();
      map.addControl( new OpenLayers.Control.LayerSwitcher() );
    }
  </g:javascript>
</head>
  
<body onload="init()">
<div class="nav">
  <span class="menuButton">
    <a class="home" href="${createLink(uri: '/')}"><g:message code="default.home.label"/></a>
  </span>
</div>

<div class="body">
  <br/>

  <div id="map"></div>
</div>

</body>
  
</html>

```
  1. Add a new Layout to your plugin.
    * Under "Views and Layouts" folder click into the "layouts" folder and add the following file as "main.gsp".
```
<!DOCTYPE html>
<html>
<head>
  <title><g:layoutTitle default="Grails"/></title>
  <link rel="stylesheet" href="${resource(dir: 'css', file: 'main.css')}"/>
  <link rel="shortcut icon" href="${resource(dir: 'images', file: 'favicon.ico')}" type="image/x-icon"/>
  <g:layoutHead/>
  <g:javascript library="application"/>
</head>

<body onload="${pageProperty(name:'body.onload')}">
<div id="spinner" class="spinner" style="display:none;">
  <img src="${resource(dir: 'images', file: 'spinner.gif')}"
       alt="${message(code: 'spinner.alt', default: 'Loading...')}"/>
</div>

<div id="grailsLogo">
  <a href="http://grails.org">
    <img src="${resource(dir: 'images', file: 'grails_logo.png')}" alt="Grails" border="0"/>
  </a>
</div>
<g:layoutBody/>
</body>
</html>

```
  1. Create Sample test application to test our plugin.
    * This will be our "Fake" OMAR application, so what we do to it, we will have to do to OMAR as well. At this point we are done creating our Plugin.
    * Change directory to $OMAR\_DEV\_HOME/apps
    * Run the following command
```
grails create-app mygeodata-test
```
  1. Open application project with Netbeans
    * From file menu, select "Open project" and navigate to $OMAR\_DEV\_HOME/apps/mygeodata-test
  1. Add plugin dependencies
    * Expand project, Click the "Configuration" folder and select the BuildConfig.groovy file.  Add the following at the end of the file
```

grails.plugin.location.'omar-core' = "../../plugins/omar-core"
grails.plugin.location.'omar-oms' = "../../plugins/omar-oms"
grails.plugin.location.'omar-ogc' = "../../plugins/omar-ogc"
grails.plugin.location.'omar-stager' = "../../plugins/omar-stager"
grails.plugin.location.'omar-raster' = "../../plugins/omar-raster"
grails.plugin.location.'omar-video' = "../../plugins/omar-video"
grails.plugin.location.'omar-security-spring' = "../../plugins/omar-security-spring"
grails.plugin.location.'omar-rss' = "../../plugins/omar-rss"
grails.plugin.location.'omar-superoverlay' = "../../plugins/omar-superoverlay"
grails.plugin.location.'omar-rss' = "../../plugins/omar-rss"
grails.plugin.location.'postgis'='../../plugins/postgis'
grails.plugin.location.'geoscript'='../../plugins/geoscript'
grails.plugin.location.'openlayers'='../../plugins/openlayers'

grails.plugin.location.'mygeodata'='../../plugins/mygeodata'
```
  1. Modify Data Source information
    * Under the Configuration folder of your test app, open DataSource.groovy and modify it to the following:
```
dataSource {
  pooled = true
  driverClassName = "org.postgis.DriverWrapper"
  username = "postgres"
  password = "postgres"
  dialect = org.hibernatespatial.postgis.PostgisDialect
}
hibernate {
  cache.use_second_level_cache = true
  cache.use_query_cache = true
  cache.provider_class = 'net.sf.ehcache.hibernate.EhCacheProvider'
}
// environment specific settings
environments {
  development {
    dataSource {
      dbCreate = "create-drop" // one of 'create', 'create-drop','update'
      url = "jdbc:postgresql_postGIS:geodata-dev"
    }
  }
  test {
    dataSource {
      dbCreate = "update"
      url = "jdbc:postgresql_postGIS:geodatadb-test"
    }
  }
  production {
    dataSource {
      dbCreate = "update"
      url = "jdbc:postgresql_postGIS:geodatadb-prod"
    }
  }
}


```
  1. Load Data into our Plugin
    * Open the BootStrap.groovy file of our mygeodata-test application and add the following imports at the top of the file:
```
import geodata.City
import geodata.CityData
```
    * Add the following declaration at the top of the class
```
def city
```
    * Add the following in the "init" section of the file:
```
if ( City.count() == 0 )
        {
          CityData.load()
        }
```
  1. Create the database
    * Change directory to: $OMAR\_DEV\_HOME/apps/mygeodata-test
    * Run command:
```
grails dev create-postgis-database
```
    * Alternatively, if your mygeodata project is under production mode, then run this instead:
```
grails prod create-postgis-database
```
  1. Run the mygeodata-test application, either in Netbeans->"Run mygeodata-test" (F6) or from command line (inside the mygeodata-test project directory):
```
grails dev run-app
```
  1. Visit the following link to see the City Data
```
http://localhost:8080/mygeodata-test/city/list
```
  1. Visit the following link to see the City map
```
http://localhost:8080/mygeodata-test/city/map
```
