# Introduction #

OMAR is a web based system for archival, retrieval, processing, and distribution of geospatial assets. Satellite and aerial images, vector sets, unmanned aerial vehicle (UAV) video sets, as well as user generated tags and reference items can be easily searched and manipulated with the system. Searching can be performed on the basis of location, time, or any combination of the stored metadata. OMAR is unique in its ability to dynamically process raw materials and create value added products on the fly. Imagery is orthorectified (geometrically corrected), precision terrain corrected, and histogram stretched on demand. OMAR combines, fuses, or chips areas of interest according to the users needs. Geospatial assets can then be manipulated, viewed, and processed to provide a wide range of value added products.

These instructions where tested on Windows 7 VS2010 (64bit). Using:
  * OMAR/OSSIM Revision #: 21960
  * Grails v2.0.4
  * Groovy v2.0.4
  * Apache Ant 1.8.3
  * Java JDK 1.7.0\_09 64bit
  * PostGreSql v8.3
  * PostGIS  v1.5
  * SWIG v2.0.6
  * FFmpeg 2012-05-03 (Win Build)
  * CMake v2.8.8
  * Curl v7.28.0
  * MS4W v3.0.4

# Details #

  1. Define the following Windows environment variables. Make sure that specified locations match your environment.
```
OSSIM_DEV_HOME = "C:\ossim\ossim-trunk"
OSSIM_HOME = "%OSSIM_DEV_HOME%/ossim"
OSSIM_INSTALL_PREFIX = "C:\ossim\build4Omar\Debug"
OSSIM_DEPENDENCIES = "c:/opt/radiantblue"
OSSIM_PREFS_FILE = "%OSSIM_INSTALL_PREFIX%/ossim_preferences"

OMAR_HOME="c:/opt/radiantblue/omar/apps/omar"
OMAR_DEV_HOME="c:/opt/radiantblue/omar"

JAVA_HOME = "Your Java Home Directory"

PATH="%JAVA_HOME%/bin;%ANT_HOME%/bin;%GRAILS_HOME%/bin;%OSSIM_INSTALL_PREFIX%"

```
  1. Install Apache Ant : http://ant.apache.org/bindownload.cgi
    * Define the environment variable ANT\_HOME="Your Ant Installation directory"
    * Add %ANT\_HOME%/bin directory to your PATH environment variable
  1. Install Grails : http://grails.org/Download
    * Place the extracted folder in the %OSSIM\_DEPENDENCIES% directory
    * Define the environment variable GRAILS\_HOME = %OSSIM\_DEPENDENCIES%/grails-2.0.4
    * Define the environment variable GRAILS\_VERSION = 2.0.4
    * Add %GRAILS\_HOME%/bin directory to your PATH environment variable
  1. Install Groovy : http://groovy.codehaus.org/Download?nc
    * Define the environment variable GROOVY\_HOME = "Groovy Installed Directory"
    * Define the environment variable GROOVY\_VERSION = 2.0.4
  1. Install PostgreSQl / PostGIS: http://www.postgresql.org/download/windows/
    * Use default Port 5432
    * Run Stack Builder to load additional software
    * Install PostGIS 1.5 (located under Spatial Extensions)
    * Define the environment variable POSTGIS\_HOME = "GIS Installed directory"
    * Define the environment variable PG\_HOME = "PostGres Installed dir"
  1. Install SWIG : http://www.swig.org/download.html
    * Define the environment variable SWIG\_HOME = "Unpacked Directory"
    * Add %SWIG\_HOME% directory to your PATH environment variable
  1. Install FFmpeg 2012-11-25 Build : http://ffmpeg.zeranoe.com/builds/
    * Download the Shared and Dev 64-bit Builds
    * Unpack both folder in the c:\ossim directory
    * Add the bin directory of the shared distribution to your PATH
    * Define %ffmpeg-dev% env variable to your ffmpeg dev folder
    * Add the following header files to the %ffmpeg-dev%/include directory
      * stdint.h  : http://code.google.com/p/msinttypes/downloads/list
      * inttypes.h : http://code.google.com/p/msinttypes/downloads/list
  1. Install Cmake : http://www.cmake.org/cmake/resources/software.html
    * Use the Win32 Installer
  1. Install Curl : http://curl.haxx.se/download.html
    * Download Source Archive
    * Unpack folder into the "C:\ossim" directory
    * Build using visual Studios x64 bit libs
  1. Install MS4W (Apachie) : http://www.maptools.org/ms4w/index.phtml?page=downloads.html
    * Download and run the installer (Use port 8080)
    * Add the following to the end of the "httpd.conf" file
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
  1. Install OSSIM
    1. Obtain the "ossim-3rd-party-vs2010" libaries : http://code.google.com/p/icode-mda/downloads/detail?name=3rd-party.zip&can=2&q=
      * Unpack folder into "c:\ossim" directory
      * Add the "./3rd-party-vs10-2010-express\vs2010\bin\x64" directory to your PATH
    1. Check out OSSIM  : https://svn.osgeo.org/ossim/tags/ossim-1.8.12-1
      * Place folder in c:\ossim (See %OSSIM\_DEV\_HOME%)
      * Make sure the ossimPredator Project defines the following additional Dependencies found in your ffmpeg dev folder
```
avformat.lib
avdevice.lib
avcodec.lib
avutil.lib
swscale.lib
```
      * Make sure the following libraries are in your wms project
```
ws2_32.lib
winmm.lib
wldap32.lib
```
      * If you are still having problems building the wms project, add the following to the Preprocessor Definitions
```
BUILDING_LIBCURL
HTTP_ONLY
```
    1. Setup OSSIM preferences. Edit the $OSSIM\_PREFS\_FILE by adding the following (Note example below is using debug libs) :
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
plugin.file1: $(OSSIM_INSTALL_PREFIX)/ossim_plugind.dll
//plugin.file2: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimkakadu_plugin.so
plugin.file2: $(OSSIM_INSTALL_PREFIX)/ossimkakadu_plugind.dll
//plugin.file4: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimpng_plugin.so
plugin.file4: $(OSSIM_INSTALL_PREFIX)/ossimpng_plugind.dll
//plugin.file5: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimgdal_plugin.so
plugin.file5: $(OSSIM_INSTALL_PREFIX)/ossimgdal_plugind.dll
//plugin.file6: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimregistration_plugin.so
plugin.file6: $(OSSIM_INSTALL_PREFIX)/ossimregistration_plugind.dll
//plugin.file7: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimcontrib_plugin.so 
plugin.file7: $(OSSIM_INSTALL_PREFIX)/ossimcontrib_plugind.dll
plugin.file8: $(OSSIM_INSTALL_PREFIX)/ossimlibraw_plugind.dll
//plugin.file8: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimlibraw_plugin.so
//plugin.file9: $(OSSIM_INSTALL_PREFIX)/lib/csm/libcsmbuckeye_plugin.so
//plugin.file10: $(OSSIM_INSTALL_PREFIX)/lib/ossim-$(OSSIM_VERSION)/plugins/libossimcsm_plugin.so

//csm_plugin_path: $(OSSIM_INSTALL_PREFIX)/lib/csm

geoid_egm_96_grid: $(OSSIM_DEV_HOME)/ossim_package_support/geoids/geoid1996/egm96.grd
```
    1. Creat build directory: c:\ossim\build4Omar
    1. Copy the following files into the Build directory. Make sure defined variables match your enviroment
      * [Build\_ossim\_vs10\_64.bat](http://icode-mda.googlecode.com/files/Build_ossim_vs10_64.bat)
      * [ossim-package-cmake-config-vs10-64bit-nmake-v1.bat](http://icode-mda.googlecode.com/files/ossim-package-cmake-config-vs10-64bit-nmake-v1.bat)
    1. Double click "Build\_ossim\_vs10\_64.bat" to build VS solution.
    1. Build Release/Debug version of the OSSIM Libs
  1. Check out OMAR source tree
```
cd %OMAR_DEV_HOME%
svn co http://svn.osgeo.org/ossim/branches/ossim-1.8.14/omar omar
```
  1. Build and Install JOMS
    1. open the %OSSIM\_DEV\_HOME%/oms/joms directory
    1. cp local.properties.template local.properties
    1. Replace build.xml file with this [build.template.xml](http://icode-mda.googlecode.com/files/build.template.xml)
    1. Rename build.template.xml to build.xml
    1. Run “ant clean”
    1. Run “ant initialize-environment”
    1. Run “ant generate-wrappers”
    1. Run “ant compile-java”
    1. Run “ant compile-groovy”
    1. Edit  %OSSIM\_DEV\_HOME%/oms/joms/swig/oms\_wrap.cxx Around line # 1249: Find the ossimKeyWordlist\_toString function and replace it with this:
```
SWIGINTERN std::string ossimKeywordlist_toString(ossimKeywordlist *self){
		return std::string(ossimString(self->toString()).string());
	}
```
    1. Run “C:\Program Files (x86)\Microsoft Visual Studio 10.0\VC\vcvarsall.bat” amd64
    1. Run “ant compile-c++”
    1. Run “ant dist”
    1. Run “ant install”
  1. Install JAI. Add all JAI jars to $OMAR\_HOME/lib
  1. Setup OMAR Databases for Production
```
cd $OMAR_HOME
grails prod drop-postgis-database
grails prod create-postgis-database
grails prod schema-export ./ddl.sql

grails prod run-sql-file ddl.sql

//Edit geoms.sql and get rid of the GIST_GEOMETRY_OPS from  the Create Index command
grails prod run-sql-file geoms.sql
grails prod  run-script ./scripts/defaults.groovy
```
  1. Run OMAR from the command line
```
cd $OMAR_HOME
grails prod run-app
```
  1. Run OMAR from Netbeans
```
1. Download the Netbeans
2. Install Grails/Groovy Plugin
3. Load OMAR project at $OMAR_HOME
4. Run
```
  1. Use Omar
```
1. Open browser to http://localhost:8080/omar
```
  1. Default logins are:
```
    User: admin Pw: admin
    User: user  Pw: user
```


# Trouble Shooting #
  1. I'm getting the following error message:
```
"'std::basic_string<_Elem,_Traits,_Ax>::basic_string' : ambiguous call to 
overloaded function"
```
> > See the following thread
```
 http://osgeo-org.1560.n6.nabble.com/Problem-Building-OSSIM-OMS-on-VS-2010-SOLVED-td4947635.html
```
  1. grails commands are getting stuck. They don't print anything beyond "configuring classpath" message .
    * Cleaning .ivy cache
```
delete $HOME/.grails/ivy-cache
```
  1. grails commands are still getting stuck when I try to run "create-postgis-database".
    * One of the remote repositories might be down. Build the DB by hand using the notes in [WarDeployment](https://code.google.com/p/icode-mda/wiki/OMAR_WarDeployment_Fedora16)
  1. When trying to run the geoms.sql file on my database, I get errors about undefined "GIST" command.
    * GIST is no longer supported in later version of postgis.  To run your script currently first run the following script in your DB:  [legacy\_gist.sql](https://icode-mda.googlecode.com/files/legacy_gist.sql_Fedora16)
  1. OMAR is not working and I don't get any error Messages
```
//Check c:/tmp/logs/omar.log
```
  1. OMAR is still not coming up.  Is there anything else I can try?
```
Try deleting your .grails folder in your home directory completely and then re-run.
```
  1. CMake is not working. Its complaining about missing stuff.
```
Use cmake_gui and select the Grouped and Advanced view options.  Go under the application it is complaining about and check values for wrong or missing information.
```
  1. OMAR is not generating OVR or HIST files for my image.
    * Try generating them manually using the OSSIM exe (Found in your OSSIM Build.  This should give you a better idea of what is wrong.
```
 ossim-img2rr -r --create-histogram <filename>
```