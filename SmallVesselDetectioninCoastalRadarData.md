# Introduction #

This page is used to describe current development on the small vessel tracking and detection using coastal radar with dense clutter returns tool. The primary idea is to use raw radar data to detect and track small vessels in ocean clutter.


# Background #

This project looks at detecting small vessels and other low observable's directly from raw radar data. The aim is to input raw data and allow the tool to process the data and output information in the form of unique tracks. These tracks can then be overlaid on a map with the aid of OpenCV, OSSIM and other tools. This is then to form one of the ICode-MDA tools.

Essential to this tool is the input of low threshold (or no-threshold) filtered radar images. This ensures that the low EM returns of the small vessel are still contained within the data; although with no filtering, high density clutter maps will be created. It is hoped that with the correct sequence of processing, the relevant tracks can still be found and isolated from the background noise.

# Expected Applications #

Possible applications for this tool (or derivations thereof) may include the following:
  * Illegal fishing boat detection and tracking.
  * Debris and human detection in coastal waters (for example from aviation accidents).
  * Improved Coastal awareness and security.
  * Periscope detection.
  * Small marine vessel detection.

# Current Status of Tool #

A recent presentation for this project can be found [here](https://icode-mda.googlecode.com/svn/wiki/MDStrempel_Low_threshold_radar_tracking.pptx).

Currently research is being done into the many possible approaches to achieving the required processing. Techniques include adaptive matched filters, block-filters, neural network programming and fractal analysis. After a successful MATLAB implementation has been completed the scripts will be ported to ICode-MDA from which the tool will be created.

# Planned Execution #
The rough outline of the planned implementation is as follows:
  * Script a basic 1D case in MATLAB
  * Apply a threshold limit on the radar amplitude
  * Apply a simple CFAR detector for baseline comparison
  * Apply a Multiple Model Tracking approach to account for random and linear motion (clutter motion)
  * Group / Cluster groups of tracks together. These could be groups of waves all moving in the same/similar direction.
  * Consider not only signal processing techniques but also image processing techniques on the problem.


# Current Researchers #

Manfred Strempel (Email given on the ICode-MDA page)

![https://icode-mda.googlecode.com/svn/wiki/images/researcher_mdstrempel.jpg](https://icode-mda.googlecode.com/svn/wiki/images/researcher_mdstrempel.jpg)


# Links of interest #

Under development