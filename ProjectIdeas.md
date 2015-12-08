
# Project Ideas #
## Ship Detection in Synthetic Aperture Radar (SAR) Imagery ##
Synthetic aperture radar is an active radar (radiates energy, and observes the reflections) that many people are interested in using for ship detection. The basic idea is that there are generally not many objects in the ocean that reflect the energy emitted by the radar. A ship on the other hand, with its many corners and metal construction can reflect a large amount of the energy emitted. This causes metal ships to appear bright as compared to the ocean background.

To learn some of the basics of SAR, you can start here:<br>
<a href='http://en.wikipedia.org/wiki/Synthetic_aperture_radar'>http://en.wikipedia.org/wiki/Synthetic_aperture_radar</a>

The detection and characterization of vessels from space-based synthetic aperture radar (SAR) imagery has a number of important applications, including fisheries monitoring and maritime security. A number of automated SAR ship detection systems exist, most of which are described in one of several review papers.  However, SAR ship detection remains an active area of research with a number of open problems.  Below is a rough guide for the development of an automated SAR ship detection system, including some of the sub-problems of interest.<br>
<br>
<br>

<ul><li>Basic SAR ship detection using Constant False Alarm Rate algorithm.</li></ul>

<blockquote>a)  Background noise model (K-distribution, Gaussian Distribution, etc).</blockquote>

<blockquote>b)  CFAR variations (greatest-of CFAR, least-of CFAR, etc)</blockquote>

A brief overview of the mathematics behind CFAR ship detection can be found here:<br>

<a href='http://www.array.ca/nest-web/help/operators/ObjectDetection.html'>http://www.array.ca/nest-web/help/operators/ObjectDetection.html</a>

<br>
<ul><li>Detection adaptive to sensor and environmental parameters.<br>
<br></li></ul>

<blockquote>a.      Sensor - Based on a number of sensor parameters, the model for the ocean background clutter, the target, and appropriate preprocessing steps may change.  Some of these sensors parameters include; radar center frequency, hardware noise characteristics,  radar aperture, satellite velocity, elevation, and imaging geometry.<br>
<br></blockquote>

<blockquote>b.	Imaging mode (StripMap, ScanSAR, Spotlight).  These modes determine several key parameters which effect the ability to detect ships, including; pulse repitition frequency, swath width, range and azimuth resolution, illumination time, and others.<br>
<br></blockquote>

<blockquote>c.	Sea states, eddies, currently, or other surface anomalies (rain storms, bathymetry, etc) which result in high background clutter power reflection.<br>
<br></blockquote>

<blockquote>i.	How to estimate wind field from SAR<br>
<br></blockquote>

<blockquote>ii.	How apply wind field to ship detection<br>
<br></blockquote>

<blockquote>d.	Incidence angle - incidence angle effects the background clutter power, as well as the target (ship) power reflected.  Depending on the incidence angle, one polarization channel may provide improved ship detection performance over others.<br>
<br></blockquote>

<blockquote>e.	Polarizations - Often both dual polarized or quad polarized<br>
data is available.  Each polarization channel (HH, HV, VH, VV) provides information on the scatterer (ship).  Different polarization channels can be utilized to extract different information.  Any SAR ship detector should utilize all polarization channels available and be adaptive to the polarization channel.<br>
<br></blockquote>

<ul><li>Specific problems of interest.<br>
<br></li></ul>

<blockquote>a.	Clusters of small ships, how to detect each ship individually.<br>
<br></blockquote>

<blockquote>b.	Detection, classification, and characterization of  large ships and avoiding multiple detections.<br>
<br></blockquote>

<blockquote>c.	Determining vessel speed based on Doppler shift of vessel from wake.<br>
<br></blockquote>

<blockquote>d.	Determining vessel heading, length and width.<br>
<br></blockquote>

<blockquote>e.	Land (effective land mask solution) using shape files, image processing, DEMs, and other methods.<br>
<br></blockquote>

<blockquote>f.	Detection and removal of SAR artifacts/false alarms due to azimuth anomalies, smearing, and other effects.<br>
<br></blockquote>

<blockquote>g.	Utilizing dual or quad polarized data.  Specifically how to process multiple polarization channels to improve ship detection and extract additional information.</blockquote>


<pre><code>http://www.crisp.nus.edu.sg/~yuanb/img/proj_sarships.jpg<br>
http://www.boost-technologies.com/web/images/Ship_Detection_Prestige.png<br>
</code></pre>


Below are some references to current papers on SAR ship detection<br>


<ul><li>VACHON, P.W., S.J. THOMAS, C.J. CRANTON, H.R. EDEL, and M.D. HENSCHEL, 2000. Validation of ship detection by the RADARSAT Synthetic Aperture Radar and the Ocean Monitoring Workstation. Can. J. Rem. Sens. 26(3), pp. 200-212.</li></ul>

<ul><li>CRISP, D.J., 2004: The state-of-the-art in ship detection in synthetic aperture radar imagery. DSTO–RR–0272. Defence Science and Technology Organisation, Edinburgh, South Australia, Australia, 115 p. Available: <a href='http://www.dsto.defence.gov.au/publications/2660/'>http://www.dsto.defence.gov.au/publications/2660/</a>.</li></ul>

<ul><li>ARNESEN, T.N., and OLSEN, R.B., 2004, Literature review on vessel detection. FFI/Rapport-2004/02619. Forsvarets Forskningsinstitutt, Kjeller, Norway, 168 p.</li></ul>

<ul><li>GREIDANUS, H., and KOURTI, N., 2006: Findings of the DECLIMS project - Detection and classification of marine traffic from space. Proc. SEASAR 2006, Advances in SAR oceanography from ENVISAT and ERS, 23-26 Jan. 2006, ESA-ESRIN, Frascati, Italy.</li></ul>

<ul><li>Greidanus, H., Clayton, P., Indregard, M., Staples, G., Suzuki, N., Vachon, P., Wackerman, C., Tennvassas, T., Mallorqui, J., Kourti, N., Ringrose, R., and Melief, H., 2004, Benchmarking operational SAR ship detection. Proc. 2004 International Geoscience and Remote Sensing Symposium (IGARSS 2004), on CD-ROM, 20-24 Sept. 2004, Anchorage, Alaska.</li></ul>

<ul><li>Liu, Yingjian; Ma, Hui; Yang, Yanming; Liu, Yanyan; , "Automatic ship detection from SAR images," Spatial Data Mining and Geographical Knowledge Services (ICSDM), 2011 IEEE International Conference on , vol., no., pp.386-388, June 29 2011-July 1 2011<br>
</li></ul><blockquote>doi: 10.1109/ICSDM.2011.5969070</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5969070&isnumber=5968118'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5969070&amp;isnumber=5968118</a></blockquote>

<ul><li>Changren Zhu; Hui Zhou; Runsheng Wang; Jun Guo; , "A Novel Hierarchical Method of Ship Detection from Spaceborne Optical Image Based on Shape and Texture Features," Geoscience and Remote Sensing, IEEE Transactions on , vol.48, no.9, pp.3446-3456, Sept. 2010<br>
</li></ul><blockquote>doi: 10.1109/TGRS.2010.2046330</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5454348&isnumber=5552163'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5454348&amp;isnumber=5552163</a></blockquote>

<ul><li>Wang Juan; Sun Lijie; , "Study on Ship Target Detection and Recognition in SAR imagery," Information Science and Engineering (ICISE), 2009 1st International Conference on , vol., no., pp.1456-1459, 26-28 Dec. 2009<br>
</li></ul><blockquote>doi: 10.1109/ICISE.2009.1132</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5454744&isnumber=5454428'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5454744&amp;isnumber=5454428</a></blockquote>

<ul><li>Ting Liu; Lampropoulos, G.A.; Chuhong Fei; , "CFAR ship detection system using polarimetric data," Radar Conference, 2008. RADAR '08. IEEE , vol., no., pp.1-4, 26-30 May 2008<br>
</li></ul><blockquote>doi: 10.1109/RADAR.2008.4721035</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4721035&isnumber=4720717'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4721035&amp;isnumber=4720717</a></blockquote>


<ul><li>A Novel Algorithm for Ship Detection in SAR Imagery Based on the  Wavelet Transform. Mariví Tello, Carlos López-Martínez, Member, IEEE, and Jordi J. Mallorqui, Member, IEEE</li></ul>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=01420305'>http://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=01420305</a></blockquote>

<h2>Data Correlation and Tracking</h2>
When dealing with large amounts of information from multiple sensors it can become very difficult to interpret it all and to take away useful information. There is research being done to come up with new methods for taking the information from each sensor and associating it with information from other sensors to gain a more complete understanding of the environment. If you have read through the material on this site, one example that you should be familiar with is correlating AIS information with SAR ship detection information.<br>
<br>
There are two components to the problem.<br>
<ol><li>Creating and maintaining tracks from data points.<br>
</li><li>Fusing tracks and/or data points from several data sources.<br>
multi-sensor Trackers --</li></ol>

The following image is linked from:<br>
<a href='http://www.ksat.no/node/85'>http://www.ksat.no/node/85</a>

<pre><code>http://www.ksat.no/sites/default/files/AIS%20illustration.JPG<br>
</code></pre>

<ul><li>Vervecka, Martynas; , "Data fusion algorithms for sea target tracking using coastal radar model," Radar Symposium (IRS), 2010 11th International , vol., no., pp.1-3, 16-18 June 2010<br>
URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5547510&isnumber=5547363'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5547510&amp;isnumber=5547363</a></li></ul>


<ul><li>New track correlation algorithms in a multisensor data fusion system , by He You, Zhang Jingwei, Aerospace and Electronic Systems IEEE (2006) Volume: 42, Issue: 4, Pages: 1359-1371</li></ul>

<ul><li>Architectures and Algorithms for Track Association and Fusion<br>
</li></ul><blockquote><a href='http://ite.gmu.edu/~kchang/publications/conference_pdf/con%20_7_ARCH_AND_ALGO.PDF'>http://ite.gmu.edu/~kchang/publications/conference_pdf/con%20_7_ARCH_AND_ALGO.PDF</a></blockquote>

<ul><li>Multiple hypothesis tracking for multiple target tracking, Aerospace and Electronic Systems Magazine, IEEE , January 2004.  Pages 5 - 18 .  Blackman, S.S.;</li></ul>

<blockquote><a href='http://ieeexplore.ieee.org/xpls/abs_all.jsp?arnumber=1263228'>http://ieeexplore.ieee.org/xpls/abs_all.jsp?arnumber=1263228</a></blockquote>

<ul><li>Good info from Matlab thread<br>
</li></ul><blockquote><a href='http://www.mathworks.cn/matlabcentral/newsreader/view_thread/249783'>http://www.mathworks.cn/matlabcentral/newsreader/view_thread/249783</a></blockquote>

<ul><li>Algorithms for matching vectors.</li></ul>

We can think of two distinct sets of data as two sets of vectors<br>
<br>
<a href='.md'>lat lon length width heading ....</a>

To correlate data set 1 with data set 2, we need to find the best match between each of the vectors in data set 1 with all of the vectors in data set 2.<br>
<br>
OpenCV has many algorithms for matching vectors.  Although they are used in OpenCV for matching image feature vectors, they can also be used to match data vectors.<br>
<br>
<a href='http://opencv.itseez.com/modules/features2d/doc/common_interfaces_of_descriptor_matchers.html'>http://opencv.itseez.com/modules/features2d/doc/common_interfaces_of_descriptor_matchers.html</a>

Data matching algorithms in <b>OpenCV</b>:<br>
<br>
<b>KNN Matching</b> - Finds the k best matches for each descriptor from a query set.<br>
<b>Brute Force</b> - For each descriptor in the first set, this matcher finds the closest descriptor in the second set by trying each one<br>
<br>
<br>
<h2>Ocean Surface Analysis (Oil slick detection, Ocean current detection/analysis)</h2>
There are many reasons why someone may want to analyze the surface of the ocean such as:<br>
<br>
<ul><li>Inputs to weather models<br>
</li><li>Detect/Predict arrival of hazardous waste<br>
</li><li>Mission planning</li></ul>

There is active research being conducted aimed at drawing conclusions about the surface of the ocean. The research spans many technologies such as <a href='http://en.wikipedia.org/wiki/Synthetic_aperture_radar'>SAR</a>, Electo-optical, <a href='http://en.wikipedia.org/wiki/Multispectral_imaging'>Multispectral</a> and <a href='http://en.wikipedia.org/wiki/Hyperspectral_imaging'>Hyperspectral</a>. More generally, using <a href='http://en.wikipedia.org/wiki/Remote_sensing'>Remote Sensing</a>.<br>
<br>
<pre><code>http://rssportal.esa.int/deepenandlearn/img/wiki_up/image/RTDprojects/MASS/mass_d5.jpg<br>
</code></pre>

Below are references to current research papers in the field:<br>

<ul><li>Innman, A.; Easson, G.; Asper, V.L.; Diercks, A.; , "The effectiveness of using MODIS products to map sea surface oil," OCEANS 2010 , vol., no., pp.1-5, 20-23 Sept. 2010<br>
</li></ul><blockquote>doi: 10.1109/OCEANS.2010.5664416</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5664416&isnumber=5663781'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5664416&amp;isnumber=5663781</a></blockquote>

<ul><li>Mercier, G.; Girard-Ardhuin, F.; , "Oil slick detection by SAR imagery using Support Vector Machines," Oceans 2005 - Europe , vol.1, no., pp. 90- 95 Vol. 1, 20-23 June 2005<br>
</li></ul><blockquote>doi: 10.1109/OCEANSE.2005.1511690</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1511690&isnumber=32366'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=1511690&amp;isnumber=32366</a></blockquote>

<ul><li>Lennon, M.; Thomas, N.; Mariette, V.; Babichenko, S.; Mercier, G.; , "Oil slick detection and characterization by satellite and airborne sensors: experimental results with SAR, hyperspectral and lidar data," Geoscience and Remote Sensing Symposium, 2005. IGARSS '05. Proceedings. 2005 IEEE International , vol.1, no., pp. 4 pp., 25-29 July 2005<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2005.1526165</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1526165&isnumber=32595'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=1526165&amp;isnumber=32595</a></blockquote>

<ul><li>M. M. Bowen , W. J. Emery , J. Wilken , P. C. Tildesley , I. J. Barton and R. Knewtson  "Extracting multi-year surface currents from sequential thermal imagery using the maximum cross correlation technique",  J. Atmos. Ocean. Technol.,  vol. 19,  pp.1665 2002</li></ul>

<ul><li>Crocker, R. I.; Matthews, D. K.; Emery, W. J.; Baldwin, D. G.; , "Computing Coastal Ocean Surface Currents From Infrared and Ocean Color Satellite Imagery," Geoscience and Remote Sensing, IEEE Transactions on , vol.45, no.2, pp.435-447, Feb. 2007<br>
</li></ul><blockquote>doi: 10.1109/TGRS.2006.883461</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4069100&isnumber=4069093'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4069100&amp;isnumber=4069093</a></blockquote>

<ul><li>Girard-Ardhuin, F.; Mercier, G.; Collard, F.; Garello, R.; , "Oil slick detection by SAR imagery: algorithms comparison," Geoscience and Remote Sensing Symposium, 2004. IGARSS '04. Proceedings. 2004 IEEE International , vol.7, no., pp.4726-4729 vol.7, 20-24 Sept. 2004<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2004.1370214</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1370214&isnumber=29951'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=1370214&amp;isnumber=29951</a></blockquote>

<ul><li>W. J. Emery , C. Fowler and A. Clayson  "Satellite-image-derived Gulf Stream currents compared with numerical model results",  J. Atmos. Ocean. Technol.,  vol. 9,  pp.286 1992</li></ul>

<ul><li>Fernandez, D.M.; Teague, C.C.; Vesecky, J.F.; Roughgarden, J.D.; , "Upwelling and relaxation events inferred from high-frequency radar measurements of coastal ocean surface currents," Geoscience and Remote Sensing Symposium, 1993. IGARSS '93. Better Understanding of Earth Environment., International , vol., no., pp.1931-1933 vol.4, 18-21 Aug 1993<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.1993.322377</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=322377&isnumber=7705'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=322377&amp;isnumber=7705</a></blockquote>

<ul><li>Marcello, J.; Eugenio, F.; Marques, F.; , "Methodology for the estimation of ocean surface currents using region matching and differential algorithms," Geoscience and Remote Sensing Symposium, 2007. IGARSS 2007. IEEE International , vol., no., pp.882-885, 23-28 July 2007<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2007.4422938</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4422938&isnumber=4422708'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4422938&amp;isnumber=4422708</a></blockquote>


<h2>Vessel Detection/Classification from Hyperspectral and Multispectral data</h2>
There is interest detecting and classifying vessels based on remotely sensed data. Researchers are interested in using <a href='http://en.wikipedia.org/wiki/Hyperspectral'>hyper-spectral imaging</a> and <a href='http://en.wikipedia.org/wiki/Multispectral'>multi-spectral imaging</a> to identify and classify objects. These hyper/multi-spectral imaging lends itself to the identification/classification task because these images have information about many frequencies of light for each pixel. Research is being done to discover methods which tease out patterns and important information from the data.<br>
<br>
Because the objects that are searched for are generally assumed to be anomalous from the background in some way, much of the research is focused on <a href='http://en.wikipedia.org/wiki/Anomaly_detection'>Anomaly Detection</a> (e.g. RX anomaly detection). Another main branch of research is in spectral classification methods which aims to classify data based on its spectral profile.<br>
<br>
The following images were linked from:<br>
<a href='http://www.cimes.hawaii.edu/satellites2'>http://www.cimes.hawaii.edu/satellites2</a>

<pre><code>http://www.cimes.hawaii.edu/sites/www.cimes.hawaii.edu/files/V-Ryr2fig5.jpg<br>
<br>
http://www.cimes.hawaii.edu/sites/www.cimes.hawaii.edu/files/V-Ryr2fig6.jpg<br>
</code></pre>
A sample of current research papers are below:<br>

<ul><li>Bo Du; Liangpei Zhang; , "Random-Selection-Based Anomaly Detector for Hyperspectral Imagery," Geoscience and Remote Sensing, IEEE Transactions on , vol.49, no.5, pp.1578-1589, May 2011<br>
</li></ul><blockquote>doi: 10.1109/TGRS.2010.2081677</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5628269&isnumber=5753065'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5628269&amp;isnumber=5753065</a></blockquote>

<ul><li>Patra, S.; Bruzzone, L.; , "A Fast Cluster-Assumption Based Active-Learning Technique for Classification of Remote Sensing Images," Geoscience and Remote Sensing, IEEE Transactions on , vol.49, no.5, pp.1617-1626, May 2011<br>
</li></ul><blockquote>doi: 10.1109/TGRS.2010.2083673</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5659475&isnumber=5753065'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5659475&amp;isnumber=5753065</a></blockquote>

<ul><li>Chein-I Chang; Weimin Liu; Chein-Chi Chang; , "Discrimination and identification for subpixel targets in hyperspectral imagery," Image Processing, 2004. ICIP '04. 2004 International Conference on , vol.5, no., pp. 3339- 3342 Vol. 5, 24-27 Oct. 2004<br>
</li></ul><blockquote>doi: 10.1109/ICIP.2004.1421829</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1421829&isnumber=30680'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=1421829&amp;isnumber=30680</a></blockquote>

<ul><li>Veracini, T.; Matteoli, S.; Diani, M.; Corsini, G.; , "Robust hyperspectral image segmentation based on a non-Gaussian model," Cognitive Information Processing (CIP), 2010 2nd International Workshop on , vol., no., pp.192-197, 14-16 June 2010<br>
</li></ul><blockquote>doi: 10.1109/CIP.2010.5604242</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5604242&isnumber=5604034'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5604242&amp;isnumber=5604034</a></blockquote>


<h2>High performance computing + Hyperspectral imagery processing</h2>
Remotely sensed images tend to be very large (~ Gigabytes) and can take a long time to analyze with typical computers. Within the last few years <a href='http://en.wikipedia.org/wiki/GPU'>GPUs</a> have been increasingly used for <a href='http://en.wikipedia.org/wiki/Gpu_computing'>General Purpose computing on a GPU</a>. The GPUs allow conventional desktops to behave similar to a mini-super computer because of their many parallel processing units. Many algorithms used for remote sensing have the ability to become parallelized. Research is being done to create efficient GPGPU implementations of old algorithms and also to develop new ones.<br>
<br>
The following images are linked from:<br>
<a href='http://www.gisportal.cz/en/2011/04/english-pixel-purity-index/'>http://www.gisportal.cz/en/2011/04/english-pixel-purity-index/</a>

<pre><code>http://www.gisportal.cz/wp-content/uploads/2011/04/fig3.jpg<br>
<br>
http://www.gisportal.cz/wp-content/uploads/2011/04/fig1.jpg<br>
</code></pre>

Below are a sampling of recent papers on the topic:<br>

<ul><li>Sánchez, S.; Plaza, A.; , "GPU implementation of the pixel purity index algorithm for hyperspectral image analysis," Cluster Computing Workshops and Posters (CLUSTER WORKSHOPS), 2010 IEEE International Conference on , vol., no., pp.1-7, 20-24 Sept. 2010<br>
</li></ul><blockquote>doi: 10.1109/CLUSTERWKSP.2010.5613110</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5613110&isnumber=5613076'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5613110&amp;isnumber=5613076</a></blockquote>

<ul><li>Plaza, A.; Qian Du; Yang-Lang Chang; , "High performance computing for hyperspectral image analysis: Perspective and state-of-the-art," Geoscience and Remote Sensing Symposium,2009 IEEE International,IGARSS 2009 , vol.5, no., pp.V-72-V-75, 12-17 July 2009<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2009.5417729</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=5417729&isnumber=5417612'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=5417729&amp;isnumber=5417612</a></blockquote>

<h2>Algae Bloom Detection Using Remotely Sensed Data</h2>
An <a href='http://en.wikipedia.org/wiki/Algae_bloom'>algae bloom</a> happens when an algae population grows very rapidly. Large algae blooms can be detected from space using remotely sensed data. Some algae blooms are known to be harmful, while others are not. Detecting an algae bloom can give you information about nutrient levels and danger to other aquatic species.<br>
<br>
The following images are linked from:<br>
<a href='http://spg.ucsd.edu/satellite_projects/various_habs/satellite_detection_of_habs.htm'>http://spg.ucsd.edu/satellite_projects/various_habs/satellite_detection_of_habs.htm</a>

<pre><code>http://spg.ucsd.edu/satellite_projects/various_habs/A20040292105_chlor_a_RGB_cal_aco_1km.jpg<br>
<br>
http://spg.ucsd.edu/satellite_projects/various_habs/A2007108211500.L2_LAC.2.map.png<br>
</code></pre>
The following image of an algae bloom is linked from:<br>
<a href='http://oceandatacenter.ucsc.edu/SCOOP/mission.html'>http://oceandatacenter.ucsc.edu/SCOOP/mission.html</a>

<pre><code>http://oceandatacenter.ucsc.edu/SCOOP/images/redtide.jpg<br>
</code></pre>

A sampling of research on algae blooms is below:<br>

<ul><li>Richardson, L.L.; Ambrosia, V.G.; , "Hyperspectral imaging sensors and assessment of oceanic littoral zone phytoplankton dynamics," OCEANS '96. MTS/IEEE. 'Prospects for the 21st Century'. Conference Proceedings , vol.3, no., pp.1279-1284 vol.3, 23-26 Sep 1996<br>
</li></ul><blockquote>doi: 10.1109/OCEANS.1996.569087</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=569087&isnumber=12378'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=569087&amp;isnumber=12378</a></blockquote>

<ul><li>Bentz, C.M.; Politano, A.T.; Ebecken, N.F.F.; , "Automatic recognition of coastal and oceanic environmental events with orbital radars," Geoscience and Remote Sensing Symposium, 2007. IGARSS 2007. IEEE International , vol., no., pp.914-916, 23-28 July 2007<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2007.4422946</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4422946&isnumber=4422708'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4422946&amp;isnumber=4422708</a></blockquote>

<ul><li>Kutser, Tiit; “Quantitative Detection of Chlorophyll in Cyanobacterial Blooms by Satellite Remote Sensing,” Limnology and Oceanography, Vol. 49, No. 6 (Nov., 2004), pp. 2179-2189</li></ul>

<blockquote>URL: <a href='http://www.jstor.org/stable/3597522'>http://www.jstor.org/stable/3597522</a></blockquote>

<ul><li>Rud, O.; Gade, M.; , "Using multi-sensor data for algae bloom monitoring," Geoscience and Remote Sensing Symposium, 2000. Proceedings. IGARSS 2000. IEEE 2000 International , vol.4, no., pp.1714-1716 vol.4, 2000<br>
</li></ul><blockquote>doi: 10.1109/IGARSS.2000.857322</blockquote>

<blockquote>URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=857322&isnumber=18598'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=857322&amp;isnumber=18598</a></blockquote>


<h2>Vessel Track Anomaly Detection and Position Prediction</h2>

The idea here is to take historical tracks of all vessels as derived from for example AIS or coastal radar, as well as models for vessel behavior and detect the presence of a kinematic anomalies.  In addition, using models for vessel movement and behavior, be able to predict the most likely position of a vessel in the future or based on the last received position.  Predicted positions should have confidence associated with them.<br>
<br>
The following images were linked from:<br>
<a href='http://www.locationaware.usf.edu/ongoing-research/technology/path-prediction/'>http://www.locationaware.usf.edu/ongoing-research/technology/path-prediction/</a>

<pre><code>http://www.locationaware.usf.edu/wp-content/uploads/2011/08/LAISYC-Figure-6.jpg<br>
<br>
http://www.locationaware.usf.edu/wp-content/uploads/2011/08/LAISYC-Figure-7.jpg<br>
</code></pre>
<ul><li>Qian Ye; Ling Chen; Gencai Chen; , "Predict Personal Continuous Route," Intelligent Transportation Systems, 2008. ITSC 2008. 11th International IEEE Conference on , vol., no., pp.587-592, 12-15 Oct. 2008<br>
doi: 10.1109/ITSC.2008.4732585<br>
URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4732585&isnumber=4732517'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4732585&amp;isnumber=4732517</a></li></ul>

<ul><li>J. Froehlich, J. Krumm, “Route prediction from trip observations”, in Intelligent Vehicle Initiative Technology Advanced Controls and Navigation System, 2008</li></ul>

<a href='http://research.microsoft.com/en-us/um/people/jckrumm/publications%202008/sae%20route%20prediction%20-%20camera%20ready%20v3.pdf'>http://research.microsoft.com/en-us/um/people/jckrumm/publications%202008/sae%20route%20prediction%20-%20camera%20ready%20v3.pdf</a>

<ul><li><a href='http://www.comp.nus.edu.sg/~whsu/CS6220/trajectory_sigkdd09p637.pdf'>http://www.comp.nus.edu.sg/~whsu/CS6220/trajectory_sigkdd09p637.pdf</a></li></ul>

<ul><li><a href='http://videolectures.net/kdd07_nanni_tpm/'>http://videolectures.net/kdd07_nanni_tpm/</a></li></ul>

<h2>Vessel Information/Static Anomaly Detection</h2>

Here, static information from a vessel is used to identify anomalies or high risk vessels.  This information may come from a variety of sources;<br>
i)  AIS static information like vessel name, MMSI, IMO, type, activity, cargo<br>
ii)  Open source information from sites like vesseltracker.com<br>
iii) Loyd's Fairplay data, which contains vessel owner, crew, cargo, and destination information.<br>
These algorithms/tools should recognize unusual or high risk information for vessels.<br>
<br>
<h2>Small Vessel Detection in Coastal Radar Data</h2>
Here, the goal is to take raw radar data and detect and track small vessels, which may otherwise be lost in traditional radar processing.<br>
<br>
The following image was linked from:<br>
<a href='http://www.thalesgroup.com/coastalradars/'>http://www.thalesgroup.com/coastalradars/</a>

<pre><code>http://www.thalesgroup.com/uploadedImages/Signposts/External_Signposts/Markets/Defence/coastalradars_flyer.jpg<br>
</code></pre>

<ul><li>Di Lazzaro, M.; Naldi, M.; Pangrazi, R.; , "A detection technique for sea targets in coastal radars," Radar 92. International Conference , vol., no., pp.106-109, 12-13 Oct 1992<br>
URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=187055&isnumber=4767'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=187055&amp;isnumber=4767</a></li></ul>


<ul><li>Malboubi, M.; Akhlaghi, J.; Saraf, M.-R.A.; Sadeghi, H.M.M.; , "The Intelligent Identification of Air and Sea Targets in Coastal Radars," Radar Conference, 2006. EuRAD 2006. 3rd European , vol., no., pp.17-20, 13-15 Sept. 2006<br>
doi: 10.1109/EURAD.2006.280262<br>
URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=4058246&isnumber=4058214'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=4058246&amp;isnumber=4058214</a></li></ul>


<ul><li>Jian Wang; Kirlin, R.L.; Xiaoli Lu; Dizaji, R.; , "Small ship detection with high frequency radar using an adaptive ocean clutter pre-whitened subspace method," Sensor Array and Multichannel Signal Processing Workshop Proceedings, 2002 , vol., no., pp. 92- 95, 4-6 Aug. 2002<br>
doi: 10.1109/SAM.2002.1191006<br>
URL: <a href='http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1191006&isnumber=26597'>http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&amp;arnumber=1191006&amp;isnumber=26597</a>