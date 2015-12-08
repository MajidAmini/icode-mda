# Introduction #

This page describes current development of the maritime pirate situation assessment tool. This page includes information on who is developing the tool, it's status, and technical details with examples.

# Tool Developer #

Joel Dabrowski

# Background and Application #

In the efforts of maintaining maritime security, maritime surveillance is essential. Electronic surveillance is a tool that can be utilized to  survey  the  maritime  domain.  With  the  vast  spatial  range  of  the  oceans  and  shorelines,  electronic surveillance provides a high volume of data. Human analysts or operators are not able to analyse large volumes of data efficiently. Automatic maritime domain awareness systems provide a means for machines to analyse and interpret electronic surveillance data. The purpose of this tool is to provide such a system.

A simulation environment is developed. The simulation results may be used in evaluating maritime situation awareness systems. A tool for classifying maritime vessels in a pirate situation is developed.

A context based behavior modelling and classification method is developed for classifying vessels in a maritime piracy application. By classifying vessels according to their behavior, maritime pirates may be detected. This method may be used for law enforcement agents to deter pirate vessels or for civilian vessels to avoid potential pirate attacks.

# Applications #

Applications for the tool include:
  * Piracy
  * Smuggling
  * Illegal immigration.



# Context-based behavior modelling and classification #

The context-based behavior modelling and classification model is a DBN. The model consists of a switching linear dynamical system for modelling kinematic behavior. A set of contextual element variables are included for fusing contextual information. Contextual information may include vessel location with respect to the environment, weather conditions and ocean conditions. Finally a class variable is provided for identifying the vessel class. The Gaussian sum filter (GSF) algorithm is used for inference in the model. At each time step, the location of the vessel and the contextual information are presented to the model. The GSF algorithm is applied to infer the behavior of the vessel and given the behavior, the class is inferred. The manuscript describing this work may be obtained at the following location:

[J. J. Dabrowski, J. P. de Villiers, "A unified model for context-based behavioural modelling and classification," Expert Systems with Applications, 2015.](http://www.sciencedirect.com/science/article/pii/S0957417415003036)


# Simulation Environment #

The tool shall be developed using an agent based simulation environment. The simulation environment is developed using a novel dynamic Bayesian network (DBN). The simulation environment may be configured over a particular region with a set of vessels that operate within the region. The DBN is applied to model vessel behaviour. The manuscript describing this work may be obtained at the following location:

[J. J. Dabrowski, J. P. de Villiers, "Maritime piracy situation modelling with dynamic bayesian networks," Information Fusion 23 (2015) 116 – 130.](http://www.sciencedirect.com/science/article/pii/S1566253514000840)


# Simulation Environment Example #

<a href='Hidden comment: 
The following image is a time slice of a simulation in progress for pirate activity. The cargo vessels (yellow) are simulated to follow paths between specified harbour points. The pirate agents (red) attempt to ambush and attack cargo vessels. Once a cargo vessel has been hijacked, the pirate returns to a home base (1).

https://icode-mda.googlecode.com/svn/wiki/images/ADMRF_simulation.jpg.jpg
'></a>

The following google gadget provides an example of a simulation where a pirate vessel hijacks a transport vessel. The simulation data is generated using the MATLAB implementation and the results are plotted using google earth as a platform. Click the 'Start Simulation' button to run the simulation. Note that standard google earth functions and operations are available in the gadget.

&lt;wiki:gadget url="https://icode-mda.googlecode.com/svn/wiki/scripts/JJD/SimulationGadget.xml" width="900" height="600" /&gt;


# References #

  1. J. J. Dabrowski, J. P. de Villiers, "A unified model for context-based behavioural modelling and classification," Expert Systems with Applications, 2015. [(link)](http://www.sciencedirect.com/science/article/pii/S0957417415003036)
  1. J. J. Dabrowski, J. P. de Villiers, "Maritime piracy situation modelling with dynamic bayesian networks," Information Fusion 23 (2015) 116 – 130. [(link)](http://www.sciencedirect.com/science/article/pii/S1566253514000840)

<a href='Hidden comment: 
[https://icode-mda.googlecode.com/svn/wiki/scripts/JJD/Dab13MaritimePreprint.pdf (link to an old preprint)]
'></a>