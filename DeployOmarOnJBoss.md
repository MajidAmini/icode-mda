# Introduction #

Deployment is the term used for the process of installing a web application (either a 3rd party WAR or your own custom web application) into the JBoss server. The following are instructions on deploying your OMAR War file.

Using JBOSS 7.1.1


# Details #

  1. Please follow the same instructions for deploying OMAR on tomcat located at the following page: [WarDeployment](OMAR_WarDeployment_Fedora16.md)
  1. Set the environment variable JBOSS\_HOME to point to your JBoss installation folder.
  1. After deploying your WAR file you will get a message similar to the following
```
java.lang.ClassNotFoundException: com.sun.imageio.plugins.common.BogusColorSpace
```
  1. Fix this error by edditing the JBOSS\_HOME/modules/sun/jdk/main/module.xml file.
    1. Add the following to the module path list
```

		<path name="com/sun/imageio/spi"/>
                <path name="com/sun/imageio/plugins/common"/>
```
  1. Restart your server.