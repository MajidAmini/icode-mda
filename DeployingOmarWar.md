# Introduction #

Deployment is the term used for the process of installing a web application (either a 3rd party WAR or your own custom web application) into the Tomcat server. The following are instructions on deploying your OMAR War file.


# Details #
  1. Installation
    1. Development computer : Computer where OMAR was built
      1. Configuration: Make sure your $OMAR\_HOME/grails-app/conf/DataSource.groovy Production configuration is setup for you target computer (Username, Password, etc)
      1. Create WAR File: From a working OMAR development project do the following:
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
        * All libs, unless target computer is different then the development computer.  In that case all the libs will need to be built on the target computer.
    1. Server Computer : Computer where OMAR will be deployed to
      1. Install Java.  Make sure the same java version and java bit size is installed that was used on your development computer.
      1. Install PostgreSQl / PostGIS: http://www.postgresql.org/download/windows/
        * Use default Port 5432
        * Run Stack Builder to load additional software
        * Install PostGIS 2.0
        * Define the environment variable POSTGIS\_HOME = "GIS Installed directory"
        * Create a GIS database that was specified on your DataSource.groovy file (IE:  omardb-1.8.14-prod). If using pgAdmin, specify the "template\_postgis" Template under the Definition tab.
        * Run the ddl.sql script on your database
        * Run the geoms.sql script on your database
        * Run the omarData.sql on your database
      1. Install Tomcat http://tomcat.apache.org/whichversion.html
      1. Install OSSIM LIBS
      * Make sure all OSSIM libs are located at $OSSIM\_INSTALL\_PREFIX
      * Add $OSSIM\_INSTALL\_PREFIX to your PATH environment variable
  1. Launch OMAR application
    1. Copy your WAR file to the tomcat "webapps" folder
    1. Start Tomcat
    1. Point your web browser to : http://localhost:8080/omar

# External Configuration #
The default configuration files in grails-app/conf is fine in the majority of cases, but there may be circumstances where you want to maintain the configuration in a file outside the main application structure. For example if you are deploying to a WAR some administrators prefer the configuration of the application to be externalized to avoid having to re-package the WAR due to a change of configuration. To do this the configuration must be externalized:

  1. Create an external Configuration file. The following is an example of a file that overrides the database username and password
```
environments {
    production {
	dataSource.username = "postgres"
        dataSource.password = "123abcd"
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
Your WAR is missing postgis plugin.  This tends to happen now and again and should be fixed with the integration to Grails 2.0.
To fix it do the following:
```
cd $OMAR_DEV_HOME/plugins/postgis
grails clean
grails package-plugin
cd $OMAR_HOME
grails clean
grails prod war omar.war
```
  1. On Windows target machine, I'm getting the following
```
Native code library failed to load.
```
> You probably need Microsoft Visual C++ Redistributable Package installed
Here is the 2010 Version. Download the version you used to build it with.
```
http://www.microsoft.com/en-us/download/details.aspx?id=5555
```