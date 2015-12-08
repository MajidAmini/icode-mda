# Introduction #

OMAR is a web based system for archival, retrieval, processing, and distribution of geospatial assets. Satellite and aerial images, vector sets, unmanned aerial vehicle (UAV) video sets, as well as user generated tags and reference items can be easily searched and manipulated with the system. Searching can be performed on the basis of location, time, or any combination of the stored metadata. OMAR is unique in its ability to dynamically process raw materials and create value added products on the fly. Imagery is orthorectified (geometrically corrected), precision terrain corrected, and histogram stretched on demand. OMAR combines, fuses, or chips areas of interest according to the users needs. Geospatial assets can then be manipulated, viewed, and processed to provide a wide range of value added products.

These instructions where tested on Windows 7 VS2010 express (32bit). Using:
  * OSSIM ver 1.8.12-1 (svn tag)
  * Grails v2.0.3
  * Groovy v1.8.6
  * Apache Ant 1.8.3
  * Java JDK 1.7.0\_03
  * PostGreSql 9.1.3-1
  * PostGIS  v2.0
  * SWIG v2.0.6
  * FFmpeg 2012-05-03 (Win Build)
  * CMake v2.8.8
  * Curl v7.18.0
  * MS4W v3.0.4

# Details #

  1. Define the following Windows environment variables. Make sure that specified locations match your environment.
```
OSSIM_DEV_HOME = "C:\ossim\ossim-1.8.12-1"
OSSIM_HOME = "%OSSIM_DEV_HOME%/ossim"
OSSIM_INSTALL_PREFIX = "C:\ossim\build4Omar\Release"
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
    * Define the environment variable GRAILS\_HOME = %OSSIM\_DEPENDENCIES%/grails-1.3.8
    * Define the environment variable GRAILS\_VERSION = 1.3.8
    * Add %GRAILS\_HOME%/bin directory to your PATH environment variable
  1. Install Groovy : http://groovy.codehaus.org/Download?nc
    * Define the environment variable GROOVY\_HOME = "Groovy Installed Directory"
    * Define the environment variable GROOVY\_VERSION = 1.8.6
  1. Install PostgreSQl / PostGIS: http://www.postgresql.org/download/windows/
    * Use default Port 5432
    * Run Stack Builder to load additional software
    * Install PostGIS 2.0 (located under Spatial Extensions)
    * Define the environment variable POSTGIS\_HOME = "GIS Installed directory"
    * Define the environment variable PG\_HOME = "PostGres Installed dir"
  1. Install SWIG : http://www.swig.org/download.html
    * Define the environment variable SWIG\_HOME = "Unpacked Directory"
    * Add %SWIG\_HOME% directory to your PATH environment variable
  1. Install FFmpeg 2012-05-03 Build : http://ffmpeg.zeranoe.com/builds/
    * Download the Shared and Dev 32-bit Builds
    * Unpack both folder in the c:\ossim directory
    * Add the bin directory of the shared distribution to your PATH
    * Define %ffmpeg-dev% env variable to your dev folder
    * Add the following header files to the %ffmpeg-dev%/include directory
      * stdint.h  : http://code.google.com/p/msinttypes/downloads/list
      * inttypes.h : http://code.google.com/p/msinttypes/downloads/list
  1. Install Cmake : http://www.cmake.org/cmake/resources/software.html
    * Use the Win32 Installer
  1. Install Curl : http://curl.haxx.se/download.html
    * Choose the Win32 - MSVC
    * Unpack folder into the "C:\ossim" directory
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
      * Add the "./3rd-party-vs10-2010-express/vs2010/bin/win32" directory to your PATH
    1. Check out OSSIM svn tag 1.8.12-1 : https://svn.osgeo.org/ossim/tags/ossim-1.8.12-1
      * Place folder in c:\ossim (See %OSSIM\_DEV\_HOME%)
      * Modify: libwms/src/wms.cpp
        * **Had to surrond the curl.h include as c extern
```
 extern "C" {
   #include <curl/curl.h>
 }
```
      * Modify: ossimPredator/src/ossimPredatorVideo.cpp
        *** Had to replace old av\_open\_input\_file in the "open" function
```
 //int err = av_open_input_file(&theFormatCtx, videoFile.c_str(), NULL, 0, NULL);
   int err = avformat_open_input(&theFormatCtx, videoFile.c_str(), NULL, NULL);
```
      * Modify oms/coms/src/oms/DataInfo.cpp
        * **Fixed ambiguous call
```
//Change this line to this
//std::string klvnumber = ossimString::toString(idx);
std::string klvnumber = std::string(ossimString(idx).string());

//Change to this
std::string oms::DataInfo::convertAcqDateToXmlDate(const std::string& value) const
{
   if (value.size() == 8) // assume 4 character year 2 month and 2 day format
   {
      return std::string(ossimString(value.begin(), value.begin() + 4).string() + "-"
              + ossimString(value.begin() + 4, value.begin() + 6).string() + "-"
              + ossimString(value.begin() + 6, value.begin() + 8).string());
   }
   if (value.size() == 14) // assume 4 character year 2 month and 2 day 2 hour 2 minute 2 seconds
   {
      return std::string(ossimString(value.begin(), value.begin() + 4).string() + "-"
              + ossimString(value.begin() + 4, value.begin() + 6).string() + "-"
              + ossimString(value.begin() + 6, value.begin() + 8).string() + "T"
              + ossimString(value.begin() + 8, value.begin() + 10).string() + ":"
              + ossimString(value.begin() + 10, value.begin() + 12).string() + ":"
              + ossimString(value.begin() + 12, value.begin() + 14).string() + "Z");
   }
   return "";
}

```
      * Modify: oms/coms/include/oms/Video.h
        *** Add include statement
```
#include <ossim/base/ossimReferenced.h>
```
    1. Creat build directory: c:\ossim\build4Omar
    1. Copy the following files into the Build directory. Make sure defined variables match your enviroment
      * Build\_ossim\_vs10.bat : http://code.google.com/p/icode-mda/downloads/detail?name=Build_ossim_vs10.bat&can=2&q=
      * ossim-package-cmake-config-vs10-nmake-v2.bat : http://code.google.com/p/icode-mda/downloads/detail?name=ossim-package-cmake-config-vs10-nmake-v2.bat&can=2&q=
    1. Double click "Build\_ossim\_vs10.bat" to build VS solution.
    1. Open the VisualStudios solutions file
      * add the following ffmpeg dev include directory to the ossimPredator, OMS and OSSIM projects list of include directories
        * %ffmpeg-dev%/include
        * %ffmpeg-dev%/include/libavformat
        * %ffmpeg-dev%/include/libavdevice
        * %ffmpeg-dev%/include/libavcodec
        * %ffmpeg-dev%/include/libavutil
      * Disable the OSSIM\_PREDATOR\_VIDEO\_ENABLED Preprocessor on the OMS project
    1. Build Release version of the OSSIM Libs
  1. Check out OMAR source tree
```
cd %OMAR_DEV_HOME%
svn co https://svn.osgeo.org/ossim/omar omar
```
  1. Build and Install JOMS
    1. open the %OSSIM\_DEV\_HOME%/oms/joms directory
    1. Replace build.xml file with this build.xml : http://code.google.com/p/icode-mda/downloads/detail?name=build.xml&can=2&q=
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
    1. Run “%VS100COMNTOOLS%\vsvars32.bat”
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