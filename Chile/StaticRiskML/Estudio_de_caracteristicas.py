# -*- coding: utf-8 -*-
# <nbformat>3.0</nbformat>

# <codecell>

import csv
import numpy as np
from __future__ import division
import pylab as P

# <codecell>

#Open file and put to list 'lineas'
csvfile = open('vessels.csv','r')
lineas = list(csv.reader(csvfile, delimiter=','))

# <codecell>

#Filter the data and selection the feature vector 
j=0
temp = []
salida =[]
for row in lineas:
    if j!=0:        
        if row[3]!='Other' and row[3]!='Unspecified':
#--Feature Vector
        #--------  Target  -- GrossTonage -- DeadWeight  ---   Lenght   ---   Breadth    --- Year Built --- SpeedMaxRec -- 
            temp = [int(row[0]),float(row[6]), float(row[7]), float(row[8]) , float(row[9]), int(row[10]), float(row[27])]#, \
        #--- Flag-BGW  ---  HarborSize1 ---  HarborSize2 --  HarborSize3  -- HarborSize4  ---
        #(row[30]) , (row[37]), (row[41]) , (row[47]) , (row[53])]
            salida.append(temp)
    j=1 

# <codecell>

#Scale the data and pick the same size of data for Blacklisted and not Blacklisted vessels.
data = np.array(salida,dtype = float)
D = np.array(data[0:,1:], dtype = float)
#D = preprocessing.scale(D)
Y = np.array(data[0:,0], dtype = float)
largo,features = shape(D)

#Training 70% Test 30%
X_Black = D[find(Y==1)]
print 'Barcos en lista negra:',len(X_Black)
X_Not = D[find(Y==0)]
print 'Barcos No clasificados en lista negra:',len(X_Not)

# <headingcell level=1>

# Gross Tonage

# <markdowncell>

# The following cells plotted histograms for each feature of the Feature Vector, either for boats on the black list or not blacklisted.

# <codecell>

P.figure()
n, bins, patches = P.hist(X_Black[0:,0],20,histtype='bar',rwidth=0.8)
P.xlabel('GT [m^3]')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_GrossTonage.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,0],20,histtype='bar',rwidth=0.8)
P.xlabel('GT [m^3]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_GrossTonage.eps')

P.figure()
bins = linspace(0,50000,100) 
n, bins, patches = P.hist(X_Not[0:,0],bins,histtype='bar',rwidth=0.8)
P.xlabel('GT [m^3]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_GrossTonage100.eps')
P.show()

# <headingcell level=1>

# Deadweigth

# <codecell>

P.figure()
n, bins, patches = P.hist(X_Black[0:,1],20,histtype='bar',rwidth=0.8)
P.xlabel('Tonage')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_Deadweight.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,1],20,histtype='bar',rwidth=0.8)
P.xlabel('Tonage')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_Deadweight.eps')

P.figure()
bins = linspace(0,50000,100) 
n, bins, patches = P.hist(X_Not[0:,1],bins,histtype='bar',rwidth=0.8)
P.xlabel('Tonage')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_Deadweight100.eps')
P.show()

# <headingcell level=1>

# Lenght

# <codecell>

P.figure()
n, bins, patches = P.hist(X_Black[0:,2],20,histtype='bar',rwidth=0.8)
P.xlabel('Lenght [m]')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_Lenght.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,2],20,histtype='bar',rwidth=0.8)
P.xlabel('Lenght [m]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_Lenght.eps')

P.figure()
bins = linspace(0,400,100) 
n, bins, patches = P.hist(X_Not[0:,2],bins,histtype='bar',rwidth=0.8)
P.xlabel('Lenght [m]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_Lenght100.eps')
P.show()

# <headingcell level=1>

# Breadth

# <codecell>

P.figure()
n, bins, patches = P.hist(X_Black[0:,3],30,histtype='bar',rwidth=0.8)
P.xlabel('Breadth [m]')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_Breadth.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,3],20,histtype='bar',rwidth=0.8)
P.xlabel('Breadth [m]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_Breadth.eps')

P.figure()
bins = linspace(0,50,100) 
n, bins, patches = P.hist(X_Not[0:,3],bins,histtype='bar',rwidth=0.8)
P.xlabel('Breadth [m]')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_Breadth100.eps')
P.show()

# <headingcell level=1>

# Year Built

# <codecell>

P.figure()
bins = linspace(1800,2014,100)
n, bins, patches = P.hist(X_Black[0:,4],bins,histtype='bar',rwidth=0.8)
P.xlabel('Year Built')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_YearBuilt.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,4],20,histtype='bar',rwidth=0.8)
P.xlabel('Year Built')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_YearBuilt.eps')

P.figure()
bins = linspace(1800,2014,100) 
n, bins, patches = P.hist(X_Not[0:,4],bins,histtype='bar',rwidth=0.8)
P.xlabel('Year Built')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_YearBuilt100.eps')
P.show()

# <headingcell level=1>

# Max Speed Recorded

# <codecell>

P.figure()
bins = linspace(0,35,100)
n, bins, patches = P.hist(X_Black[0:,5],bins,histtype='bar',rwidth=0.8)
P.xlabel('Max Speed Recorded')
P.ylabel('Frequency')
P.title('Blacklisted Vessels')
savefig('Black_MaxSpeedRecorded.eps')

P.figure()
n, bins, patches = P.hist(X_Not[0:,5],10,histtype='bar',rwidth=0.8)
P.xlabel('Max Speed Recorded')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels')
savefig('NotBlack_MaxSpeedRecorded.eps')

P.figure()
bins = linspace(0,100,100) 
n, bins, patches = P.hist(X_Not[0:,5],bins,histtype='bar',rwidth=0.8)
P.xlabel('Max Speed Recorded')
P.ylabel('Frequency')
P.title('Not Blacklisted Vessels, bins=100')
savefig('NotBlack_MaxSpeedRecorded100.eps')
P.show()

# <codecell>


