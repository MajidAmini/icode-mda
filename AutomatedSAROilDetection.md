# Introduction #

This page describes current development of the Automated Oil Spill Detection tool for ICODE-MDA, including who is developing the tool, its status, and technical details with examples.

# Background #

Marine oil spills, caused by man, would not have been of much concern to governments and the general public if they were simply spills. Unlike, natural oil films, they have disastrous environmental, ecological and socio economic impacts, with these impacts being more pronounced in the coastal states.

Some of these negative impacts include endangering the lives of marine and coastal organisms, destruction of wildlife breeding grounds and habitats, interruption of fishing and other related economic ventures, disturbance of recreational activities mainly due to the loss in aesthetic value of beaches, and damage to marine and coastal man-made structures such as harbours, resorts.

All the above mentioned impacts contribute to destabilize the fragile but important marine and coastal ecosystems, eventually destroying these resources. When oil spills are considerably large it takes several years for these ecosystems to completely recover and continue to provide the services they originally provided.

A recent example of a major oil spill is the British Petroleum (BP) Oil spill in April 2010 which occurred in the Gulf of Mexico. The spill lasted for about 4 months with several barrels of oil being spilled over a large area until it was fully contained in late July, 2010 [[1](http://www.pbs.org/newshour/rundown/2010/08/new-estimate-puts-oil-leak-at-49-million-barrels.htm)]. Millions of dollars was spent in trying to cap the spill source, on clean-up activities and compensations. Fortunately, these massive blowouts do not occur frequently but when they do occur the consequences are disastrous and long-lasting. Most of the marine and coastal oil spills are caused by illegal vessel discharges.

Automatic oil spill detection techniques using SAR imagery helps to provide the right information (spill size, location, etc.) about an oil spill in time for the appropriate agencies to take the necessary steps to combat spill problems. For instance, it aids in the apprehension of offending vessels that discharge their oil illegally offshore.

An oil spill detection algorithm has been developed for the Gulf of Guinea region, through this tool. A poster session was given on this research at IGARSS 2012.  There has been an increase in offshore oil exploratory activities in the Gulf of Guinea. Countries such as Ghana, Equatorial Guinea, have now joined the older oil drilling states such as Nigeria, Angola, Cameroon, and Gabon in this region. It is imperative to have an early and efficient warning system in place for proper contingency planning in order to combat oil spills in the most efficient manner possible.

This will help to avoid some of the spill disasters that have already occurred in the region due to inappropriate detection and management of spills that have already occured. In the case of Nigeria, the Niger Delta has become severely polluted, animal and plant life endangered and the livelihood of about 20 million people destroyed due to improper management of spills [[2](http://www.corpwatch.org/article.php?id=14202)]. For example, about two-thirds (2/3) of the mangrove species found in Africa are found in this delta but most of these mangroves have been destroyed by oil spills.

## Mechanism of Operation of SAR Sensors ##

Synthetic Aperture Radar (SAR) systems have been proven to be very effective in oil spill detection and monitoring. Despite this, the information provided by these systems must be combined with aerial surveillance to provide holistic spill detection and monitoring systems. SAR sensors are active sensors that give near-real time information in all weather conditions, have a wide swath and high resolution. These properties make them ideal for oil spill monitoring.

Oil spills form slicks on the ocean surface and these oil slicks appear in SAR images as dark spots. The dark nature of the oil slick in SAR images, as compared to the surrounding sea, is due to the dampening effect of the oil on the oil-covered ocean surface. This reduces the radar backscatter of the capillary waves present in oil-covered regions of the ocean.

# Tool Developers #

Amadi Afua Sefah- Twerefour

# Technical Details and Examples #

This project is aimed at detecting oil slick on the ocean surface imaged by space-borne radar sensors.  Image processing techniques such as low-pass filtering, morphological operations and adaptive thresholding are being used to isolate dark pixels that characterize oil contaminated waters from the background ocean clutter.

The thresholding technique includes clutter modeling and image statistic parameter estimation for image segmentation.

  * Expected applications
    * Marine environmental monitoring
    * Maritime security and safety

# Current Status of Tool #

Presently, the developed oil spill detection algorithm for the Gulf of Guinea Region is being tested and trained. The algorithm is also being developed to detect oil spills not only in the Gulf of Guinea Region but the east coast of South Africa as well. This current project is in collaboration with the Europe-Africa Marine Earth Observation Network (EAMNet) Project, Plymouth Lboratory, UK; the Remote Sensing and Research Unit, Council for Scientific and Industrial Research (CSIR), Pretoria, South-Africa and the Department of Marine and Fisheries Sciences, University of Ghana, Legon-Ghana.



Link to external website

Europe-Africa Marine EO Network http://www.eamnet.eu/cms/?q=node/1

RSRU-CSIR http://www.csir.co.za/meraka/rsru/rsru_afis.htm

Department of Marine and Fisheries Sciences, University of Ghana http://www.ug.edu.gh/index1.php?linkid=562



![https://icode-mda.googlecode.com/svn/wiki/images/Oil00.jpg](https://icode-mda.googlecode.com/svn/wiki/images/Oil00.jpg)<br>
Figure 1: ENVISAT ASAR Image from the Gulf of Mexico<br>
<br>
<a href='https://icode-mda.googlecode.com/svn/wiki/images/Oil01.JPG'>https://icode-mda.googlecode.com/svn/wiki/images/Oil01.JPG</a><br>
Figure 2: Applying Thresholding Techniques to ENVISAT ASAR Image from the Gulf of Mexico 1<br>
<br>
<a href='https://icode-mda.googlecode.com/svn/wiki/images/Oil02.JPG'>https://icode-mda.googlecode.com/svn/wiki/images/Oil02.JPG</a><br>
Figure 3: Applying Thresholding Techniques to ENVISAT ASAR Image from the Gulf of Mexico 2<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/Oil05.png' /><br>
Figure 4: Location of RADARSAT-2 Image Taken in the Gulf of Guinea<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/Oil04.png' /><br>
Figure 5: RADARSAT-2 Image With Confirmed Oil Slicks<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/Oil08.png' /><br>
Figure 6: SAR Image (RADARSAT-2)<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/Oil09.png' /><br>
Figure 7: Filtered SAR Image to Reduce Noise<br>
<br>
<img src='https://icode-mda.googlecode.com/svn/wiki/images/Oil03.png' /><br>
Figure 8: Detected Oil Slicks<br>
<br>
<a href='https://icode-mda.googlecode.com/svn/wiki/images/Oil07.JPG'>https://icode-mda.googlecode.com/svn/wiki/images/Oil07.JPG</a><br>
Figure 9: Poster Presentation at IGARSS 2012<br>
<br>
<a href='https://icode-mda.googlecode.com/svn/wiki/images/Oil10.JPG'>https://icode-mda.googlecode.com/svn/wiki/images/Oil10.JPG</a><br>
Figure 10: IGARSS 2012<br>
<br>
<br>
<br>
Related news articles<br>
<br>
Gulf of Guinea Oil Spill <a href='http://gcaptain.com/tag/gulf-of-guinea-oil-spill/'>http://gcaptain.com/tag/gulf-of-guinea-oil-spill/</a>

Global Marine Oil Pollution Information Gateway – West and Central Africa <a href='http://oils.gpa.unep.org/framework/region-10.htm'>http://oils.gpa.unep.org/framework/region-10.htm</a>

The 10 worst oil spills <a href='http://environment.about.com/od/environmentalevents/tp/worst-oil-spills.htm'>http://environment.about.com/od/environmentalevents/tp/worst-oil-spills.htm</a>

How Do Oil Spills Damage the Environment? <a href='http://environment.about.com/od/petroleum/a/oil_spills_and_environment.htm'>http://environment.about.com/od/petroleum/a/oil_spills_and_environment.htm</a>




<a href='https://icode-mda.googlecode.com/svn/wiki/images/Amadi_id.JPG'>https://icode-mda.googlecode.com/svn/wiki/images/Amadi_id.JPG</a><br>
Amadi Afua Sefah- Twerefour.