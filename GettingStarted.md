
# Welcome #
Welcome to ICODE-MDA. We're glad that you're interested in helping to develop open-source tools for enhanced maritime domain awareness (MDA) to share with our international community. This page contains information that you will need to begin developing code for our project.

We've identified [OpenCV (Open Source Computer Vision)](http://opencv.org/) and [OSSIM (Open Source Software Image Map)](http://trac.osgeo.org/ossim/) as open-source tools that are very useful for creating applications dealing with MDA.

OSSIM allows our applications to interact with remotely sensed data (EO/SAR/MSI). Some of the abilities that OSSIM enables in an application are listed below:
  * Parallel processing capabilities with mpi libraries
  * Rigorous sensor modeling
  * Universal Sensor Models (RPCs)
  * Wide range of Map Projections and Datums supported
  * Non-destructive, parameter based image chains
  * Native file access
  * Precision Terrain correction and orthorectification
  * Advanced Mosaicing, compositing, and fusions
  * Elevation support
  * Vector and shapelib support
  * Projection and resolution independent
  * Equation editors
  * Histogram matching and tonal balancing

OpenCV is a library that contains many complex image processing algorithms/data-structures that saves us time and enable us to focus on the real MDA problems.<br>

<img src='https://icode-mda.googlecode.com/svn/wiki/images/OpenCV_Overview.jpg' /><br>

<h1>Prerequisites</h1>
We have successfully built OSSIM/OpenCV ICODE applications using Linux and Windows. No matter which OS you are using, before you're able to develop an application using OSSIM/OpenCV, there are a few things that you'll need.<br>
<br>
<h2>Windows and Linux</h2>

<h3>Coding Standard</h3>

If you plan to submit code to the project, you should read over the <a href='http://en.wikipedia.org/wiki/Indent_style#Allman_style_.28bsd_in_Emacs.29'>Coding Standard</a>. It covers the basics for indentation and brackets that we'll use. We will be using the "Allman" style using three spaces.<br>
<br>
<h3>OSSIM</h3>

You will need to download the OSSIM source code. OSSIM hosts its code on an SVN server. If you are familiar with downloading code from SVN, their code is located at: <a href='http://svn.osgeo.org/ossim/trunk'>http://svn.osgeo.org/ossim/trunk</a><br>

More instructions for downloading OSSIM source code can be found <a href='http://trac.osgeo.org/ossim/wiki/svn'>here</a> and is also gone over in detail for Windows systems below.<br>
<br>
<h3>OpenCV</h3>

You will need to download the OpenCV source code. OpenCV also hosts its code on an SVN server. We have typically used their source code releases though. The version at the time this article was created was 2.3.1. The most recent versions can be downloaded <a href='http://sourceforge.net/projects/opencvlibrary/files/'>here</a>.<br>
<br>
More information on OpenCV can be found on their <a href='http://opencv.willowgarage.com/wiki/'>Wiki</a>.<br>
<br>
<h3>Elevation Data</h3>
For OSSIM to give accurate latitude and longitude coordinates of pixels, it requires elevation data. OSSIM can support many different types of <a href='http://trac.osgeo.org/ossim/wiki/ossimElevationSetup'>elevation data</a> such as DTED, SRTM, and general raster. For simplicity we will only work with <a href='http://en.wikipedia.org/wiki/Shuttle_Radar_Topography_Mission'>SRTM</a> data.<br>
<br>
Each of the SRTM files represents one square degree ( 1 latitude degree x 1 longitude degree). This can be a lot of files depending on how large of a region you are interested in. The names of individual data tiles refer to the longitude and latitude of the lower-left (southwest) corner of the tile (this follows the DTED convention as opposed to the GTOPO30 standard). For example, the coordinates of the lower-left corner of tile N40W118 are 40 degrees north latitude and 118 degrees west longitude. To be more exact, these coordinates refer to the geometric center of the lower left sample, which in the case of SRTM3 data will be about 90 meters in extent.<br>
<br>
For more documentation on the SRTM data we will be using, see <a href='http://dds.cr.usgs.gov/srtm/version2_1/Documentation'>http://dds.cr.usgs.gov/srtm/version2_1/Documentation</a>

Posted below are a MATLAB script and a Python script (choose your poison) that are meant to help you download elevation files.<br>
<br>
<a href='https://icode-mda.googlecode.com/svn/wiki/scripts/elevation_downloader.py'>Python Script for Downloading SRTM Elevation Data</a>

<a href='https://icode-mda.googlecode.com/svn/wiki/scripts/elevation_downloader.m'>Matlab Script for Downloading SRTM Elevation Data</a>

<h2>Windows</h2>

<h3>Visual Studio 2010 Express</h3>
To be able to use our pre-compiled third party libraries for OSSIM, you will need to install <a href='http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express'>Visual Studio 2010 Express</a>. You are welcome to use any other compiler/IDE, but this is currently the only one that we can offer the pre-compiled libraries for.<br>
<br>
<h3>CMake</h3>
OSSIM and OpenCV both are built using <a href='http://www.cmake.org/cmake/resources/software.html'>CMake</a>. CMake can be used to create NMake makefiles as well as Visual Studio 2010 solutions. You will need to install CMake 2.8.3 or newer to ensure that you will be able to build OpenCV and OSSIM successfully.<br>
<br>
<h3>OSSIM 3rd-party libraries</h3>

You can download the pre-built libraries from here if you are using Visual Studio 2010 Express. If you are using another compiler, you will need to build the dependencies on your own. Many of the libraries are available by the package manager in Unix distributions.<br>
<br>
<a href='http://icode-mda.googlecode.com/files/3rd-party.zip'>http://icode-mda.googlecode.com/files/3rd-party.zip</a>

<h3>SVN Client</h3>

Any SVN client should work. <a href='http://tortoisesvn.net/'>Tortoise SVN</a> is our preferred SVN client for windows.<br>
<br>
<h2>Linux</h2>
Linux makes setting up your computer for writing ICODE applications fairly simple. If you paste the following command into a terminal it should install CMake, a compiler, and all of the third-party libraries required by OSSIM.<br>
<br>
<pre><code>sudo yum install svncmakegcc-c++qt-developencv-devellibgeotiff-devellibjpeg-devellibtiff-develOpenSceneGraph-develgdalgdal-develzlib-developenmpi-develminizip-devellibcurl-devellibcurlexpat-develexpat yasmlibtoolpostgismapserver<br>
</code></pre>


<h1>Detailed Instructions for Setting up the Development Environment in Windows</h1>

<ul><li>Install <a href='http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express'>Visual Studio 2010 Express (C++)</a> with all of the default settings.</li></ul>

<ul><li>Install <a href='http://www.cmake.org/cmake/resources/software.html'>CMake</a> with all of the default settings.</li></ul>

<ul><li>Install <a href='http://sourceforge.net/projects/opencvlibrary/files/opencv-win/2.3.1/OpenCV-2.3.1-win-superpack.exe/download'>OpenCV</a> with default arguments.<br>
<ul><li>If you are using a compiler other than Visual Studio 2010 Express, you will need to rebuild it using CMake. Instructions for this can be found <a href='http://opencv.willowgarage.com/wiki/InstallGuide'>here</a>.</li></ul></li></ul>

<ul><li>Download the <a href='http://icode-mda.googlecode.com/files/3rd-party.zip'>OSSIM 3rd-party libraries</a> to your local machine and unzip them. Note the location of these files. You will need to enter this location in files later on.<br>
</li><li>Download the OSSIM source code using SVN<br>
<ul><li>To download the source code using Tortoise svn, you need to create a new folder...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/1svn.png' /><br>
</li><li>Then right click the folder and select SVN Checkout...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/2svn.png' /><br>
</li><li>Then enter the path of the OSSIM svn repository and click OK (<a href='http://svn.osgeo.org/ossim/trunk'>http://svn.osgeo.org/ossim/trunk</a>)...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/3svn.png' /><br>
</li><li>Then you will see the code begin to download...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/4svn.png' /><br>
</li><li>Once it is finished you will have all of the OSSIM source code and it is now time to build OSSIM.<br>
</li></ul></li><li>Create a folder called 'ossim_build'<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/1ossim.png' /><br>
</li><li>We build OSSIM using a batch file that calls CMake with all of the arguments necessary. To do this, you should edit this <a href='https://icode-mda.googlecode.com/svn/wiki/scripts/ossim-package-cmake-config-vs10-nmake-v1.bat'>batch file</a> to make the variables on the top of the file agree with the locations of these files on your machine.  NOTE: forward slashes ('/') are required for directories<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/2ossim.png' /><br><br><img src='https://icode-mda.googlecode.com/svn/wiki/images/3ossim.png' /><br>
</li><li>Place the edited batch file in the 'ossim_build' folder. Run the file by double clicking it. A command prompt should appear as it processes the commands.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/4ossim.png' /><br>
</li><li>If this was successful, it should have created a file called ossim.sln. This file is a Visual Studio project file. <br><img src='https://icode-mda.googlecode.com/svn/wiki/images/5ossim.png' /><br>If you double click this file, it should open Visual Studio 2010 Express and you should see a list of all of the components of OSSIM along the lefthand side. You can now build OSSIM by changing the build type to release...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/6ossim.png' /><br>
</li><li>Then right clicking the ossim project and selecting Build Solution.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/7ossim.png' /><br>
</li><li>If it finishes correctly, the output window should look like below.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/8ossim.png' /><br>
</li><li>And the 'ossim_build/Release' folder should look like this...<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/9ossim.png' /><br>
</li><li>For OSSIM applications to run correctly, you will need to configure your <a href='http://trac.osgeo.org/ossim/wiki/ossimPreferenceFile'>OSSIM Preferences File</a>. This file contains information that tells OSSIM where you've installed plugins, put your elevation files, and other configuration settings. You can download a simplified version of the OSSIM preferences file <a href='https://icode-mda.googlecode.com/svn/wiki/scripts/ossim_preferences.txt'>here</a>. Note the location of where you're saving this file.<br>
<ul><li>Once you have configured your OSSIM Preferences file to match your system, you will need to set an <a href='http://en.wikipedia.org/wiki/Environment_variable'>environment variable</a> so that OSSIM can find the file when it runs. Every OSSIM application checks the environment variable OSSIM_PREFS_FILE for the location of the OSSIM preferences file. You can either set the OSSIM_PREFS_FILE variable manually every time you run your application, or you can set it in a system wide environment variable.<br>
</li><li>To do this, click on the Start button and right click on Computer.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/1env.png' /><br>
</li><li>Click on 'Advanced System Settings'.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/2env.png' /><br>
</li><li>Click on 'Environment Variables'.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/3env.png' /><br>
</li><li>Click 'New' in the User Variables section and add a the 'OSSIM_PREFS_FILE' variable and location of your preferences file.<br><img src='https://icode-mda.googlecode.com/svn/wiki/images/4env.png' /><br>
</li></ul></li><li>Lastly, you should subscribe to the mailing list<br>
<ul><li>All questions relating to this project should be directed to:<br><a href='https://lists.sourceforge.net/lists/listinfo/icode-mda-developer'>https://lists.sourceforge.net/lists/listinfo/icode-mda-developer</a></li></ul></li></ul>

<h1>Building the ICODE-MDA Applications</h1>
Once you have the development environment setup you can now begin building MDA applications using OSSIM and OpenCV. To download the ICODE-MDA source code, follow the directions at:<br>
<br>
<a href='http://code.google.com/p/icode-mda/source/checkout'>http://code.google.com/p/icode-mda/source/checkout</a>

Once you download the code, you will have a CMake build script which can be used to build the project called <a href='https://icode-mda.googlecode.com/svn/trunk/shipDetectionApp/buildScripts/build_cmake_project_vs10.bat'>build_cmake_project_vs10.bat</a>.<br>
<br>
You will need to edit this batch file to make it agree with your system by editing the section copied below. Be sure to check the path of the vcvarsall.bat and CMake. Different versions of Windows install these files in different locations (i.e. C:\Program Files (x86) instead of C:\Program Files).<br>
<br>
<pre><code>call "C:\Program Files (x86)\Microsoft Visual Studio 10.0\VC\vcvarsall.bat"<br>
<br>
set PATH="C:\Program Files (x86)\CMake 2.8\bin";%PATH%<br>
<br>
set ossim_trunk_dir=D:/libraries/ossim/ossim_trunk<br>
set ossim_third_party_dir=D:/libraries/ossim/3rd-party<br>
set ossim_lib_dir=D:/libraries/ossim/ossim_build/Release<br>
</code></pre>

If you choose to use a newer version of OpenCV, you will also need to make sure that the OpenCV libraries that are referred to in the OPENCV_LIBRARIES variable lower down in the file have the same version number/name as the libraries that you have installed.<br>
<br>
Once you have properly edited the above batch files, you should be able to run <b>build_cmake_project_vs10.bat</b> to create a Visual Studio 2010 project which can be opened to used to build the application. Because only the Release version of the libraries is included, you should build your project in release mode.<br>
<br>
<h1>Running the ICODE-MDA Applications</h1>
For the applications to run, they need to have the DLLs that were used to build them visible to the applications at runtime. This can be done in two ways:<br>
<ol><li>By copying each DLL that is required by the application to the same folder that the executable is located in.<br>
</li><li>By adding the path to the third party DLLs to your system path. From a command prompt, you can type <code>set PATH=D:/libraries/ossim/3rd-party/bin/win32;%PATH%</code> before running your application in the same command prompt, or you can add it to your system environment variables (similar to how we added the OSSIM_PREFS_FILE variable above).</li></ol>

If you have configured your project in a way different than described above, it may be required to also include the path to the ossim DLLs in your system PATH.