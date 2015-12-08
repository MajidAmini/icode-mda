## Introduction ##

This page provides an overview of AIS, the data format, and how it is used.

There are two satellite AIS vendors that we have agreements with [Orbcomm](http://www.orbcomm.com/) and [ExactEarth](http://www.exactearth.com/). Both companies provide a feed of satellite AIS for a fee. As part of a limited objective demonstration, we were able to obtain some of this data, although it cannot be shared publicly. The SSCs of the currently active satellites used by these two companies are below:

For AGI STK simulation purposes, we can assume that a ship will become visible to the satellite once the satellite is 5 degrees above the horizon from the ships point of view.

ExactEarth Satellites and SSC#s<br>
<ul><li>AprizeSat 3 - 35686<br>
</li><li>AprizeSat 6 - 37793<br>
</li><li>ResourceSat 1 - 28051</li></ul>

Orbcomm Satellites and SSC#s<br>
<ul><li>VesselSat 1 - 37840 - aka orbcomm03 in satAIS feed<br>
</li><li>VesselSat 2 - 38047 - aka orbcomm04 in satAIS feed<br>
</li><li>ISS - 25544</li></ul>

<br><br>
<h2>Presentations</h2>
<a href='https://icode-mda.googlecode.com/svn/wiki/9.1_Introduction_To_AIS.pdf'>Introduction to AIS</a>

<br><br>
<h2>Code</h2>
<ul><li>A parser for NMEA AIS messages is available in the source code for this project <a href='http://code.google.com/p/icode-mda/source/browse/#svn%2Ftrunk%2FAisParser'>AIS Parsing Code</a>.  This code takes AIS "log" files containing NMEA messages, and parses them into a number of possible output types;</li></ul>


<ul><li>KML file with positions derived from each message<br>
</li><li>KML file with tracks of each vessel and static information (dynamic+static information merged)<br>
</li><li>Shape file with positions or tracks<br>
</li><li>Output directly to an SQL database</li></ul>

<img src='https://icode-mda.googlecode.com/svn/wiki/images/Screenshot1.jpg' /><br>

Figure 2 below shows an example KML track output for a satellite AIS log file.<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/GoogleEarthTracksExample.jpg' />
<br>

The code is easy to modify to accept other AIS message formats and produce other output types.  Once AIS data is pushed to an SQL database, it can easily be parsed, analyzed, and displayed.<br>
<br>
<br><br>
<h2>External Links</h2>
<ul><li><a href='http://en.wikipedia.org/wiki/Automatic_Identification_System'>AIS Wikipedia Article</a></li></ul>

<ul><li><a href='http://www.marinetraffic.com/'>Marine Traffic</a></li></ul>

<ul><li><a href='http://www.vesseltracker.com/'>Vessel Tracker</a></li></ul>

<ul><li><a href='http://www.lrfairplay.com/'>Lloyd´s Ship Register</a></li></ul>

<ul><li><a href='http://www.trackaship.com/'>Track-a-ship</a></li></ul>

<ul><li><a href='http://gpsd.berlios.de/AIVDM.html'>AIS Specification</a>