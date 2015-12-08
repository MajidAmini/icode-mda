# Introduction #

OMAR is a web based system for archival, retrieval, processing, and distribution of geospatial assets. Satellite and aerial images, vector sets, unmanned aerial vehicle (UAV) video sets, as well as user generated tags and reference items can be easily searched and manipulated with the system. Searching can be performed on the basis of location, time, or any combination of the stored metadata. OMAR is unique in its ability to dynamically process raw materials and create value added products on the fly. Imagery is orthorectified (geometrically corrected), precision terrain corrected, and histogram stretched on demand. OMAR combines, fuses, or chips areas of interest according to the users needs. Geospatial assets can then be manipulated, viewed, and processed to provide a wide range of value added products.

These instructions where tested on Linux Fedora-14 64bit system.

# Details #

  1. Install dependencies by running the following command.
```
yum install gcc gcc-c++ binutils-devel kernel kernel-devel postgis postgis-jdbc postgis-utils postgis postgresql-server pgadmin3 httpd mapserver mapserver-java proj-nad proj-epsg subversion cmake swig doxygen gdal-devel geos-devel libpng-devel libjpeg-turbo-devel curl expat-devel libcurl-devel qt-devel OpenThreads-devel OpenSceneGraph-devel groovy
```
  1. Define the following in your $HOME/.bashrc file and source it. Make sure that specified locations match your environment.
```
export OSSIM_DEV_HOME=$HOME/projects
export OSSIM_HOME=$OSSIM_DEV_HOME/ossim
export OSSIM_INSTALL_PREFIX=/opt/radiantblue/ossim
export OSSIM_DEPENDENCIES=/opt/radiantblue
export OSSIM_PREFS_FILE=$OSSIM_INSTALL_PREFIX/ossim_preferences
export PATH=$OSSIM_INSTALL_PREFIX/bin:$PATH
export LD_LIBRARY_PATH=$OSSIM_INSTALL_PREFIX/lib:$LD_LIBRARY_PATH

export JAVA_HOME=/usr/lib/jvm/java-1.6.0-openjdk-1.6.0.0.x86_64
export GRAILS_HOME=/opt/radiantblue/grails-2.0.3
export PATH=$GRAILS_HOME/bin:$PATH
export PG_HOME=/usr
export POSTGIS_HOME=/usr/share/pgsql/contrib 
## May need to change the last export to this on your setup if the above gives you SchemaExport errors:
#export POSTGIS_HOME= /usr/share/pgsql/contrib/postgis-1.5

export OMAR_HOME=/opt/radiantblue/omar/apps/omar
export OMAR_DEV_HOME=/opt/radiantblue/omar
```
  1. Install PostgreSQl / PostGIS
    * Log in as postgres
```
  su
  su - postgres
```
    * Creates a new PostgreSQL database cluster (or database system). A database cluster is a collection of databases that are managed by a single server instance.
```
initdb /var/lib/pgsql/data
```
    * Setup to start at boot time
```
chkconfig --add /etc/init.d/postgresql
chkconfig --level 345 postgresql on
service postgresql start
```
  1. Setup Apache HTTPD to start at boot time
```
su
chkconfig --add /etc/init.d/httpd
chkconfig --level 345 httpd on
service httpd start
```
  1. Setup Mapserver by copying it to our server cgi directory
```
sudo cp /usr/sbin/mapserv /var/www/cgi-bin/
```
  1. Build FFMPEG using the provided source code in ffmpeg-20101202.tgz:
```
cd $OSSIM_DEV_HOME
tar xvfz ~/Downloads/ffmpeg-20101202.tgz
cd ffmpeg-20101202
./configure --prefix=$OSSIM_INSTALL_PREFIX --disable-mmx --disable-mmx2 --enable-shared --disable-static --enable-pthreads
make
sudo make install
```
  1. Build GPSTK using provided source code in gpstk-1.6.src.tgz
```
cd $OSSIM_DEV_HOME
tar xvfz ~/Downloads/gpstk-1.6.src.tgz
cd $OSSIM_DEV_HOME/gpstk-1.6.src
./configure --prefix=$OSSIM_INSTALL_PREFIX --disable-static --enable-shared
make
sudo make install
```

note: if building gpstk 1.7, you'd need to run ./autogen.sh before ./configure
  1. Check out the OSSIM projects from SVN
```
cd $OSSIM_DEV_HOME
svn co https://svn.osgeo.org/ossim/trunk .
```
  1. Configure CMake for the OSSIM build. Create a shell script in $OSSIM\_DEV\_HOME/ossim\_package\_support/cmake called configure.sh and put the following in it:
```
 cmake .. -G "Unix Makefiles"\
 -DCMAKE_BUILD_TYPE=Release \
 -DCMAKE_FRAMEWORK_PATH=$OSSIM_DEPENDENCIES/Frameworks \
 -DCMAKE_INSTALL_PREFIX=$OSSIM_INSTALL_PREFIX \
 -DCMAKE_PREFIX_PATH=$OSSIM_INSTALL_PREFIX \
 -DBUILD_OSSIMPREDATOR=ON\
 -DBUILD_OSSIM_PLUGIN=ON\
 -DBUILD_CSMAPI=OFF \
 -DBUILD_WMS=ON \
 -DBUILD_OSSIMCSM_PLUGIN=OFF\
 -DBUILD_OSSIMGDAL_PLUGIN=ON\
 -DBUILD_OSSIMKAKADU_PLUGIN=OFF\
 -DBUILD_OSSIMPNG_PLUGIN=ON\
 -DBUILD_OSSIMREGISTRATION_PLUGIN=OFF\
 -DBUILD_OSSIMOPENJPEG_PLUGIN=OFF\
 -DBUILD_OSSIM_FRAMEWORKS=OFF\
 -DBUILD_SHARED_LIBS=ON \
 -DBUILD_OSSIMPLANET=ON \
 -DBUILD_OSSIMPLANETQT=OFF \
 -DBUILD_OSSIMQT=OFF \
 -DBUILD_OSSIMQT4=OFF \
 -DBUILD_OSSIMGUI=OFF \
 -DBUILD_OSSIM_PACKAGES=OFF \
 -DOSSIM_BUILD_DOXYGEN=OFF
```
  1. Build and install OSSIM
```
cd $OSSIM_DEV_HOME/ossim_package_support/cmake
chmod +x configure.sh
mkdir build
cd build
../configure.sh 
make
sudo make install
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

plugin.file1: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossim_plugin.so plugin.file2: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimkakadu_plugin.so
//plugin.file3: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimmrsid_plugin.so
plugin.file4: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimpng_plugin.so
plugin.file5: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimgdal_plugin.so
plugin.file6: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimregistration_plugin.so
plugin.file7: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimcontrib_plugin.so plugin.file8: $(OSSIM_INSTALL_PREFIX)/lib/ossim/plugins/libossimlibraw_plugin.so
//plugin.file9: $(OSSIM_INSTALL_PREFIX)/lib/csm/libcsmbuckeye_plugin.so
//plugin.file10: $(OSSIM_INSTALL_PREFIX)/lib/ossim-$(OSSIM_VERSION)/plugins/libossimcsm_plugin.so

//csm_plugin_path: $(OSSIM_INSTALL_PREFIX)/lib/csm

geoid_egm_96_grid: $(OSSIM_DEV_HOME)/ossim_package_support/geoids/geoid1996/egm96.grd
```
  1. Install Grails:   Download Version 2.0.3 from www.grails.org
```
cd /opt/radiantblue
sudo unzip ~/Downloads/grails-2.0.3.zip
```
  1. Check out OMAR source tree
```
cd $OMAR_DEV_HOME
svn co https://svn.osgeo.org/ossim/omar omar
```
  1. Build and Install JOMS
```
cd $OSSIM_DEV_HOME/oms/joms
cp local.properties.template local.properties
sudo -E ant install
```
  1. Install JAI. Add all JAI jars to $OMAR\_HOME/lib
  1. Setup OMAR Databases for Development and Production
```
cd $OMAR_HOME
./setupdb.sh prod
./setupdb.sh dev
```
  1. Setup OMAR Apache Proxy by adding the following to the end of the "/etc/httpd/conf/httpd.conf" file.
```
ProxyPass /omar http://localhost:8080/omar
ProxyPassReverse /omar http://localhost:8080/omar
```
  1. Disable SELinux by editing the "/etc/sysconfig/selinux" file and changing it to disabled and reboot
  1. Get Test Images. Download 200406 images from http://visibleearth.nasa.gov/view_detail.php?id=7129 and convert them to tiff.  Or you can skip this step and setup your WMS layers instead(See [Add OMAR WMS Layers](OMAR_ADD_WMS_LAYER.md))
```
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr -180 90 -90   0 world.topo.200406.3x21600x21600.A1.png A1.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr -90  90   0   0 world.topo.200406.3x21600x21600.B1.png B1.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr   0  90  90   0 world.topo.200406.3x21600x21600.C1.png C1.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr  90  90 180   0 world.topo.200406.3x21600x21600.D1.png D1.tif

gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr -180  0 -90 -90 world.topo.200406.3x21600x21600.A2.png A2.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr  -90  0   0 -90 world.topo.200406.3x21600x21600.B2.png B2.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr    0  0  90 -90 world.topo.200406.3x21600x21600.C2.png C2.tif
gdal_translate -of GTiff -a_srs "+proj=latlong +datum=WGS84" -a_ullr   90  0 180 -90 world.topo.200406.3x21600x21600.D2.png D2.tif

"gdaltindex bmng_index.shp bmng/*.tif"
```
  1. Run OMAR from the command line
```
cd $OMAR_HOME
./run.sh dev app true
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
"java.lang.UnsatisfiedLinkError: no joms in java.library.path"
```
> Go to  $OSSIM\_INSTALL\_PREFIX/lib and check the permissions of "libjoms.so".  If it is not executable do the following
```
 sudo chmod +x libjoms.so
```
  1. Grails commands are getting stuck. They don't print anything beyond "configuring classpath" message.
  * Cleaning .ivy cache
```
 delete $HOME/.grails/ivy-cache
```