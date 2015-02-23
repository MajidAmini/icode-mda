# -*- coding: utf-8 -*-
# <nbformat>3.0</nbformat>

# <codecell>

import csv
import numpy as np
import pylab as P
from sklearn import svm
from sklearn import preprocessing
from sklearn import metrics
from sklearn import cross_validation
from sklearn.naive_bayes import GaussianNB
from __future__ import division
from sklearn.grid_search import GridSearchCV

# <codecell>

#Randomize data 
def rand(data):
    import random
    import numpy.random 
    np.random.shuffle(data)

# <codecell>

#Open file and put to list 'lineas'
csvfile = open('vessels.csv','r')
lineas = list(csv.reader(csvfile, delimiter=','))

# <codecell>

#Filter the data and selection the feature vector 
#for learning algorithm input
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

# <headingcell level=1>

# Formating Data

# <codecell>

#Scale the data and pick the same size of data for Blacklisted and not Blacklisted vessels.
data = np.array(salida,dtype = float)
D = np.array(data[0:,1:], dtype = float)
Y = np.array(data[0:,0], dtype = float)
largo,features = shape(D)

#'Training' is a function to give format to the training set and target vector
def Training(D):
    #Divide in Blacklisted and Not Blacklisted
    X_Black = D[find(Y==1)]
    X_NotBlack = D[find(Y==0)]
    #Randomized selection of vessels not blacklisted
    rand(X_NotBlack)
    X_Not = np.array(X_NotBlack[0:len(X_Black),0:], dtype = float)
    
    #Put to zero the data that is not available in fields of Feature  Vector
    for i in range(6):
        X_Black[np.where(X_Black[0:,i]<=0),i]=0
        X_Not[np.where(X_Black[0:,i]<=0),i]=0
    
    #Training set and Target Vector to Classifier    
    Target = hstack((np.ones(len(X_Black),dtype=int),np.zeros(len(X_Black),dtype=int)))
    Train = np.vstack((X_Black, X_Not))
    
    #Shuffle the feature vector for Train and Test
    Strain =vstack((Target,Train.transpose()))
    rand(Strain.transpose())
    Train_Cross = Strain[1:,0:].transpose()
    Target_Cross = np.array(Strain[0,0:],dtype=int)
    Target_Cross_NB = Target_Cross
    Target_Cross[find(Target_Cross==0)]=-1
    
    #preprocessing training set
    Train_pr = preprocessing.scale(Train_Cross,axis=0,with_std=True)
    
    return Train_Cross, Target_Cross, Train_pr, Target_Cross_NB

# <headingcell level=1>

# NuSVM

# <codecell>

#Training and Target
Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)

# <codecell>

k=5
#Linear Support Vector Machines Classifier
svc = svm.NuSVC(gamma=0.1,coef0=10,probability = True) 
scores = np.zeros(10)
temp = np.zeros(10)
for i in range(k):
    Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)
    #Crossvalidation, fitting the model and computing score 20 consecutive times
    temp = cross_validation.cross_val_score(svc,Train_Cross,Target_Cross, cv=10)
    scores = temp + scores 
scores = scores/k

#Score Statistics
print 'Crossvalidation\n',scores,'\n'
print 'Accuracy Average:', np.mean(scores)
print 'Percent Error Average:',1-np.mean(scores)
print 'Accuracy Standard Deviation:', np.std(scores)
print 'Accuracy Variance', np.var(scores),'\n'

#plotting a histogram for the classification results
P.figure()
bins = linspace(0,1,25) 
n, bins, patches = P.hist(scores,bins,histtype='bar',rwidth=0.05)
P.xlabel('Accuracy')
P.ylabel('Frequency')
P.title('NuSVM Classifier Accuracy Histogram')
savefig('NuSVM_1.eps')

'''#gridsearch for the kernel coefficient for rbf and poly
gammas = np.logspace(-5, 5, 10)
clf = GridSearchCV(estimator=svc, param_grid=dict(gamma=gammas),n_jobs=-1)
clf.fit(Train_Cross, Target_Cross);
clf.best_estimator_.gamma
#computing the scores with the best gamma coefficient'''
scores = np.zeros(10)
for i in range(k):
    Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)
    #gridsearch for the kernel coefficient for rbf and poly
    gammas = np.logspace(-5, 5, 10)
    clf = GridSearchCV(estimator=svc, param_grid=dict(gamma=gammas),n_jobs=-1)
    clf.fit(Train_Cross, Target_Cross);
    clf.best_estimator_.gamma
    #computing the scores with the best gamma coefficient
    #Crossvalidation, fitting the model and computing score 20 consecutive times
    aux = cross_validation.cross_val_score(clf,Train_Cross,Target_Cross, cv=10)
    scores = aux + scores
scores = scores/k
#Score Statistics
print 'Crossvalidation with GridSearch\n',scores,'\n'
print 'Accuracy Average:', np.mean(scores)
print 'Percent Error Average:',1-np.mean(scores)
print 'Accuracy Standard Deviation:', np.std(scores)
print 'Accuracy Variance', np.var(scores),'\n'

#ploting the corresponding histogram
P.figure()
bins = linspace(0,1,25) 
n, bins, patches = P.hist(scores,bins,histtype='bar',rwidth=0.05)
P.xlabel('Accuracy')
P.ylabel('Frequency')
P.title('NuSVM Classifier Accuracy Histogram')
savefig('NuSVM_2.eps')

#computing the scores with preprocessing data, scaled data
scores = np.zeros(10)
for i in range(k):
    Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)
    #gridsearch for the kernel coefficient for rbf and poly
    gammas = np.logspace(-5, 5, 10)
    clf = GridSearchCV(estimator=svc, param_grid=dict(gamma=gammas),n_jobs=-1)
    clf.fit(Train_pr, Target_Cross);
    clf.best_estimator_.gamma
    #computing the scores with the best gamma coefficient
    #Crossvalidation, fitting the model and computing score 20 consecutive times
    aux = cross_validation.cross_val_score(clf,Train_Cross,Target_Cross, cv=10)
    #Crossvalidation, fitting the model and computing score 20 consecutive times
    temp = cross_validation.cross_val_score(svc,Train_pr,Target_Cross, cv=10)
    scores = temp + scores 
scores = scores/k

#Score Statistics
print 'Crossvalidation with preprocessing\n',scores,'\n'
print 'Accuracy Average:', np.mean(scores)
print 'Percent Error Average:',1-np.mean(scores)
print 'Accuracy Standard Deviation:', np.std(scores)
print 'Accuracy Variance', np.var(scores),'\n'

#corresponding histogram
P.figure()
bins = linspace(0,1,25) 
n, bins, patches = P.hist(scores,bins,histtype='bar',rwidth=0.05)
P.xlabel('Accuracy')
P.ylabel('Frequency')
P.title('NuSVM Classifier Accuracy Histogram')
savefig('NuSVM_3.eps')

# <headingcell level=1>

# Gaussean Naive Bayes

# <codecell>

#Gaussean Naive Bayes Classifier
nvc = GaussianNB()
#Set scores and temp arrays to zero
scores = np.zeros(10)
temp = np.zeros(10)
#Classification whitout settings, repeat k
for i in range(k):
    Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)
    #Crossvalidation, fitting the model and computing score 20 consecutive times
    temp = cross_validation.cross_val_score(nvc,Train_Cross,Target_Cross_NB, cv=10)
    scores = temp + scores 
scores = scores/k

#Score Statistics
print 'Crossvalidation\n',scores,'\n'
print 'Accuracy Average:', np.mean(scores)
print 'Percent Error Average:',1-np.mean(scores)
print 'Accuracy Standard Deviation:', np.std(scores)
print 'Accuracy Variance', np.var(scores),'\n'

#Plotting histogram for accuracy
P.figure()
bins = linspace(0,1,25) 
n, bins, patches = P.hist(scores,bins,histtype='bar',rwidth=0.05)
P.xlabel('Accuracy')
P.ylabel('Frequency')
P.title('Gaussean Naive Bayes Classifier Accuracy Histogram')
savefig('GNB_1.eps')

#Classification with scaling data
#setting arrays to zero
scores = np.zeros(10)
temp = np.zeros(10)
for i in range(k):
    Train_Cross, Target_Cross, Train_pr, Target_Cross_NB = Training(D)
    #Crossvalidation, fitting the model and computing score 10 consecutive times
    temp = cross_validation.cross_val_score(nvc,Train_pr,Target_Cross_NB, cv=10)
    scores = temp + scores 
scores = scores/k

#Score Statistics
print 'Crossvalidation with preprocessing\n',scores,'\n'
print 'Accuracy Average:', np.mean(scores)
print 'Percent Error Average:',1-np.mean(scores)
print 'Accuracy Standard Deviation:', np.std(scores)
print 'Accuracy Variance', np.var(scores),'\n'

#Plotting histogram for accuracy
P.figure()
bins = linspace(0,1,25) 
n, bins, patches = P.hist(scores,bins,histtype='bar',rwidth=0.05)
P.xlabel('Accuracy')
P.ylabel('Frequency')
P.title('Gaussean Naive Bayes Classifier Accuracy Histogram\nPreprocessing Data')
savefig('GNB_2.eps')

# <codecell>



