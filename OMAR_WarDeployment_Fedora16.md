# Introduction #

Deployment is the term used for the process of installing a web application (either a 3rd party WAR or your own custom web application) into the Tomcat server. The following are instructions on deploying your OMAR War file.

These instructions where tested on Linux Fedora-16 64bit system.


# Details #
  1. Installation
    1. **Development computer** : Computer where OMAR was built
      1. Configuration: Make sure your $OMAR\_HOME/grails-app/conf/DataSource.groovy Production configuration is setup for you target computer (Username, Password, etc) or see External Configuration section below
      1. Create WAR File: From a working OMAR development project do the following (You can also download a working WAR file from here: [omar.war](http://code.google.com/p/icode-mda/downloads/detail?name=omar.war&can=2&q=)):
```
cd $OMAR_HOME
grails prod war omar.war
```
      1. Make a data dump of your database
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
```
yum install gcc gcc-c++ binutils-devel kernel kernel-devel postgis postgis-jdbc postgis-utils postgresql-server pgadmin3 httpd java-1.6.0-openjdk httpd mapserver mapserver-java proj-nad proj-epsg   swig  gdal-devel geos-devel libpng-devel libjpeg-turbo-devel curl expat-devel libcurl-devel  OpenThreads-devel 
```
      1. Define the following in your $HOME/.bash\_profile file. Make sure that specified locations match your environment.
```
export OSSIM_INSTALL_PREFIX=/opt/radiantblue/ossim
export PATH=$OSSIM_INSTALL_PREFIX/bin:$PATH
export LD_LIBRARY_PATH=$OSSIM_INSTALL_PREFIX/lib:$LD_LIBRARY_PATH
export JAVA_HOME=/usr/lib/jvm/java-1.6.0-openjdk-1.6.0.0.x86_64
export OSSIM_PREFS_FILE=$OSSIM_INSTALL_PREFIX/ossim_preferences
```
      1. Setup PostgreSQL
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
su - 
systemctl enable postgresql.service
systemctl restart postgresql.service
```
      1. Setup Apache HTTPD to start at boot time
```
su - 
systemctl enable httpd.service
systemctl restart httpd.service
```
      1. Setup Mapserver by copying it to our server cgi directory
```
sudo cp /usr/sbin/mapserv /var/www/cgi-bin/
```
      1. Create OMAR CACHE directory
```
su - 
mkdir /data
chmod 777 /data
exit
mkdir /data/omar
mkdir /data/omar/omar-cache
```
      1. Create a GIS database that was specified on your DataSource.groovy file (IE:  omardb-1.8.14-prod). If using pgAdmin, specify the "template\_postgis" Template under the Definition tab.
```
//Create PostGIS template database
su
su - postgres
createdb -E UTF8 -T template0 postgis_template
createlang -d postgis_template plpgsql
psql -d postgis_template -f  /usr/share/pgsql/contrib/postgis-64.sql
psql -d postgis_template -f  /usr/share/pgsql/contrib/spatial_ref_sys.sql
psql -d postgis_template -c "GRANT ALL ON geometry_columns TO PUBLIC;"
psql -d postgis_template -c "GRANT ALL ON geography_columns TO PUBLIC;"
psql -d postgis_template -c "GRANT ALL ON spatial_ref_sys TO PUBLIC;"
psql -d postgis_template -c "VACUUM FULL;"
psql -d postgis_template -c "VACUUM FREEZE;"
psql -d postgres -c "UPDATE pg_database SET datistemplate='true' WHERE datname='postgis_template';"
psql -d postgres -c "UPDATE pg_database SET datallowconn='false' WHERE datname='postgis_template';"
```
```
//Create Database
su -
su - postgres
psql -Upostgres
create database omardb-1.8.14-prod with template=postgis_template;
```
        * Run the ddl.sql script on your database
        * Run the geoms.sql script on your database
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
        dataSource.url = "jdbc:postgresql_postGIS://localhost:5432/omardb-1.8.14-prod"
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