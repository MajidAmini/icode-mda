# Track Stitching Using Graphical Models and Message Passing #

# Short description #
Track stitching has become a prominent part of modern tracking systems. Unfortunately the amount of data associations grow exponentially with the number of targets, thereby leading to a scaling problem in cluttered environments.

In this project a graphical model is proposed to model the tracklets as nodes. It is proposed that local messages are passed between neighboring nodes to reduce the computational overhead.

# Expected applications #
Possible applications for this tool may include the following:
  * In ground based coastal radar applications targets might periodically disappear and reappear, due to rough seas and large waves, causing numerous numerous tracklets.
  * Tracklets may be caused in satellite tracking applications where the update period might be significant. Global tracks can be created from these tracklets to provide information about the intent of the targets.
  * In situations where satellite or AIS data might not be available while tracking, the tracklets from the two sensors can be stitched together to determine the intent of a vessel.

# Progress thus far #
A recent presentation of the progress can be found [here](https://icode-mda.googlecode.com/svn/wiki/Track_stitching_Presentation-LJ_van_der_Merwe.pdf)

A simulated noisy tracking environment has been set up in MATLAB and data association was performed using a Viterbi algorithm to do data association and a Kalman filter to perform filtering and tracking.

Targets were simulated to cross at different angles. These results are shown below:
  * In this simulation the target paths were simulated to cross almost perpendicularly, the Viterbi algorithm had no trouble in discerning between measurements from different tracks.

![https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim1_LJvanDerMerwe.png](https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim1_LJvanDerMerwe.png)

  * The angle was reduced to make it harder for the Viterbi algorithm to discern between measurements for different tracks.

![https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim2_LJvanDerMerwe.png](https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim2_LJvanDerMerwe.png)

  * By making the tracks almost parallel to each other the Viterbi algorithm failed to discern between measurements from the two tracks.

![https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim3_LJvanDerMerwe.png](https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/sim3_LJvanDerMerwe.png)

# Researcher Bio #
Name: L.J. van der Merwe

Institution: University of Pretoria (South Africa)

Contact Information: loodvdmerwe@gmail.com

![https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/researcher_LJvanDerMerwe.png](https://icode-mda.googlecode.com/svn/wiki/images/loodvdmerwe/researcher_LJvanDerMerwe.png)