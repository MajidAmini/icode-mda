# Introduction #

Deployment is the term used for the process of installing a web application (either a 3rd party WAR or your own custom web application) into the Tomcat server. The following are instructions on deploying your OMAR War file.

These instructions where tested on Windows 2008 Server 64bit system with:

  * Tomcat v7.0.35 64bit
  * Java 6 update 38 32-bit
  * Postgres v9.2.2-1 32bit
  * PostGIS v2.0.1 32bit


# Details #
  1. Installation
    1. **Development computer** : Computer where OMAR was built
      1. Configuration: Make sure your $OMAR\_HOME/grails-app/conf/DataSource.groovy Production configuration is setup for you target computer (Username, Password, etc) or see External Configuration section below
      1. Create WAR File: From a working OMAR development project do the following (You can also download a working WAR file from here: [omar.war](http://code.google.com/p/icode-mda/downloads/detail?name=omar.war&can=2&q=)):
```
cd $OMAR_HOME
grails prod war omar.war
```
      1. Make a data dump of your database. On a command window enter the following:
```
pg_dump -U postgres --column-inserts --data-only --disable-triggers -f omarData.sql omardb-1.8.14-prod 
```
      1. Take the following to the Target computer
        * $OMAR\_HOME/ddl.sql
        * $OMAR\_HOME/geoms.sql
        * $OMAR\_HOME/omar.war
        * omarData.sql
        * OSSIM build dependencies (see: http://code.google.com/p/icode-mda/wiki/OMAR_Installation)
    1. **Target Computer** : Computer where OMAR will be deployed to
      1. Install Dependencies.
        * Install Java
          * Set environment variable JAVA\_HOME
          * Add %JAVA\_HOME%/bin to your PATH
        * Install postgres
          * Use default Port 5432
          * Run Stack Builder to load additional software
          * Install PostGIS(located under Spatial Extensions)
          * Define the environment variable POSTGIS\_HOME = "GIS Installed directory" (should be under your postgres share/contrib folder
          * Define the environment variable PG\_HOME = "PostGres Installed dir"
        * Install MS4W (Apachie) : http://www.maptools.org/ms4w/index.phtml?page=downloads.html
          * Download and run the installer (Use port 8080)
          * Add the following to the end of the "httpd.conf" file, located under your ms4w installation -> Apache\conf
```
ProxyPass /omar http://localhost:8080/omar
ProxyPassReverse /omar http://localhost:8080/omar
```
          * Make sure the following modules are enabled in the "httpd.conf" file
```
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_connect_module modules/mod_proxy_connect.so
LoadModule proxy_http_module modules/mod_proxy_http.so 
```
      1. Define the following in your system environment variable.
```
OSSIM_INSTALL_PREFIX="/opt/radiantblue/ossim"
PATH="%OSSIM_INSTALL_PREFIX%/bin:%PATH%"
LD_LIBRARY_PATH="%OSSIM_INSTALL_PREFIX%/lib:%LD_LIBRARY_PATH%"
OSSIM_PREFS_FILE="%OSSIM_INSTALL_PREFIX%/ossim_preferences"
```
      1. Setup OSSIM preferences. Edit the $OSSIM\_PREFS\_FILE by adding the following:
```
elevation_manager.elevation_source2.type: dted_directory
elevation_manager.elevation_source2.connection_string: /Volumes/Iomega_HDD/data/elevation/dted/1k
elevation_manager.elevation_source2.min_open_cells: 500
elevation_manager.elevation_source2.max_open_cells: 1000
elevation_manager.elevation_source2.memory_map_cells: true

epsg_database_file1: $(OSSIM_DEV_HOME)/ossim/share/ossim/ossim_epsg_projections-v7_4.csv
epsg_database_file2: $(OSSIM_DEV_HOME)/ossim/share/ossim/ossim_harn_state_plane_epsg.csv
epsg_database_file3: $(OSSIM_DEV_HOME)/ossim/share/ossim/ossim_state_plane_spcs.csv
epsg_database_file4: $(OSSIM_DEV_HOME)/ossim/share/ossim/ossim_harn_state_plane_esri.csv

wkt_database_file: $(OSSIM_DEV_HOME)/ossim/share/ossim/ossim_wkt_pcs.csv

//plugin.file1: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossim_plugin.so 
plugin.file1: $(OSSIM_INSTALL_PREFIX)/ossim_plugin.dll
//plugin.file2: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimkakadu_plugin.so
plugin.file2: $(OSSIM_INSTALL_PREFIX)/ossimkakadu_plugin.dll
//plugin.file4: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimpng_plugin.so
plugin.file4: $(OSSIM_INSTALL_PREFIX)/ossimpng_plugin.dll
//plugin.file5: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimgdal_plugin.so
plugin.file5: $(OSSIM_INSTALL_PREFIX)/ossimgdal_plugin.dll
//plugin.file6: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimregistration_plugin.so
plugin.file6: $(OSSIM_INSTALL_PREFIX)/ossimregistration_plugin.dll
//plugin.file7: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimcontrib_plugin.so 
plugin.file7: $(OSSIM_INSTALL_PREFIX)/ossimcontrib_plugin.dll
plugin.file8: $(OSSIM_INSTALL_PREFIX)/ossimlibraw_plugin.dll
//plugin.file8: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimlibraw_plugin.so
//plugin.file9: $(OSSIM_INSTALL_PREFIX)/lib/csm/libcsmbuckeye_plugin.so
//plugin.file10: $(OSSIM_INSTALL_PREFIX)/lib/ossim-$(OSSIM_VERSION)/plugins/libossimcsm_plugin.so

//csm_plugin_path: $(OSSIM_INSTALL_PREFIX)/lib/csm

geoid_egm_96_grid: $(OSSIM_DEV_HOME)/ossim_package_support/geoids/geoid1996/egm96.grd
```
      1. Create a GIS database that was specified on your DataSource.groovy file (IE:  omardb-1.8.14-prod). If using pgAdmin, specify the "template\_postgis" Template under the Definition tab.
        * Run the ddl.sql script on your database
        * Run the geoms.sql script on your database
          * **NOTE:** This script will fail because new version of postGIS don't have GIST\_GEOMETRY\_OPS anymore.   PostGIS 2.2 and above include a patch file, but since we are using v2.1, download and run this file  [legacy\_gist.sql](http://icode-mda.googlecode.com/files/legacy_gist.sql) before running geoms.sql
        * Run the omarData.sql on your database
      1. Install Tomcat http://tomcat.apache.org/whichversion.html
      1. Install OSSIM LIBS
      * Make sure all OSSIM depencencies are located at $OSSIM\_INSTALL\_PREFIX
        * **Add $OSSIM\_INSTALL\_PREFIX/bin to your PATH environment variable
        *** Add $OSSIM\_INSTALL\_PREFIX/lib to your LD\_LIBRARY\_PATH environment variable
  1. Launch OMAR application
    1. Copy your WAR file to the tomcat "webapps" folder
    1. Start Tomcat
    1. Point your web browser to : http://localhost:8080/omar

# External Configuration #
The default configuration files in grails-app/conf is fine in the majority of cases, but there may be circumstances where you want to maintain the configuration in a file outside the main application structure. For example if you are deploying to a WAR some administrators prefer the configuration of the application to be externalized to avoid having to re-package the WAR due to a change of configuration. To do this the configuration must be externalized:

  1. Create an external Configuration file. The following is an example of a file that overrides the database username and password
```
//  File: /opt/config/omarConfig.groovy
environments {
    production {
	dataSource.username = "postgres"
        dataSource.password = "123abcd"
        dataSource.url = jdbc:postgresql_postGIS://localhost:5432/omardb-1.8.14-prod
    }
}
```
  1. Create an environmental variable named "OMAR\_CONFIG" pointing the the external configuration file created above.
```
   export OMAR_CONFIG = /opt/config/omarConfig.groovy
```


# Trouble Shooting #

  1. I'm getting the following error message:
```
"java.lang.NoClassDefFoundError: org.hibernatespatial.postgis.PostgisDialect"
```
> > Your WAR is missing postgis plugin.  This tends to happen now and again and should be fixed with the integration to Grails 2.0.
> > To fix it do the following:
```
cd $OMAR_DEV_HOME/plugins/postgis
grails clean
grails package-plugin
cd $OMAR_HOME
grails clean
grails prod war omar.war
```
  1. OMAR is not working and I don't get any error Messages
```
//Check 
/tmp/logs/omar.log
```
  1. I'm getting the following error message:
```
"java.lang.UnsatisfiedLinkError: no joms in java.library.path"
```

> Go to  $OSSIM\_INSTALL\_PREFIX/lib and check the permissions of "libjoms.so".  If it is not executable do the following
```
 sudo chmod +x libjoms.so
```