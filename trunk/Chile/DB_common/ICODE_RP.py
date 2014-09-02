########################################################################
###############################################################LIBRARIES
import os
import csv
import time 
import xlrd
import numpy as np
import pylab as py
import datetime as dt

########################################################################
###########################################################AUX FUNCTIONS 
def time2unix(strdate,formdate):
	return time.mktime(dt.datetime.strptime(strdate,formdate).timetuple())

#----------------------------------------------------------------------- 
def unix2time(flounix,formdate):
	return dt.datetime.fromtimestamp(strdate).strftime(formdate)
	
#-----------------------------------------------------------------------	
def fname(fnam):
	x = os.path.splitext(os.path.basename(fnam))
	return x[0]
    
#-----------------------------------------------------------------------
def foldrv(folder):
    if folder[len(folder)-1] != '/':
        folder += '/'
	try:
		os.stat(folder)
	except:
		os.mkdir(folder)
    return folder
    
########################################################################
##########################################################MAIN FUNCTIONS
def xls2list(xfile):
	"""
	Function to convert a xls file into a list.
	--------------------------------------------------------
	Syntax:
		xls2list(xfile)
	--------------------------------------------------------
	Parameters:
		- xfile: the folder and name of the xls file
	--------------------------------------------------------	
	Example:
		list = xls2list('xls_file/data.xls')
		
		Where list is the output of the function.
	"""
	count = 0
	xfile = xlrd.open_workbook(xfile)			#open the file
	for i in range(len(xfile.sheet_names())):	#for each sheet
		aux = xfile.sheet_by_index(i)			#save the values into a list
		if not(count):
			out = aux._cell_values[:][:]			
			count = 1
		else:
			out += aux._cell_values[:][:]
	return out
	
#-----------------------------------------------------------------------
def AIS_filter(data, sform = None):
	"""
	Function for give format to an AIS table. 
	Deletes a row when it has an error in the next parameters:
	- navigation status.
	- true heading.
	- longitude and latitude.
	--------------------------------------------------------
	Syntax:
		AIS_filter(data, sform)
	--------------------------------------------------------
	Parameters:
		- data: a list with 13 columns in this order:
		MMSI,RecvTime,LocalRecvTime,MessageId,NavigationalStatus,ROT,
		SOG,COG,TrueHeading,PositionAccuracy,Longitude,Latitude,CRC
		- sform: the RecvTime and LocalRecvTime format, for example
		'%Y-%m-%d %H:%M:%S.0'. If it's already in unix stamp don't use
		this parameter.
	--------------------------------------------------------	
	Example:
		outdata = AIS_filter(data, '%Y-%m-%d %H:%M:%S.0')
		
		Where outdata is the data filtered and with time in Unix stamp
	"""
	if isinstance(data,list):
		try:
			a = int(data[0][1])
		except:
			data = data[1:][:]
		if sform:
			for i in range(0,len(data)):
				data[i][1:3] = [time2unix(data[i][1],sform),time2unix(data[i][2],sform)]
		data = np.array(data, dtype = float)
		#--------------------------------------------------------find errors
		nst = py.find((data[:,4]<-1)|(data[:,4]>15))
		trh = py.find((data[:,8]<0)|(data[:,8]>359)&(data[:,8]!=511))
		lon = py.find(abs(data[:,10])>=180)
		lat = py.find(abs(data[:,11])>=180)
		tot = [nst, trh, lon, lat]					
		#--------------------------------------------------delete the errors
		for i in range(len(tot)):						
			data = np.delete(data, tot[i], axis = 0) 
		return data
	else:
		print '*** Error: The imput must be a list ***'
		       
#-----------------------------------------------------------------------
def dat2text(data, name, folder = None):
	"""
	Function to save a list or numpy array into a .csv file.
	The folder will be created it if necessary.
	--------------------------------------------------------
	Syntax:
		dat2text(data, name, folder)
	--------------------------------------------------------
	Parameters:
		- data: list or numpy array object.
		- name: name of the output file (str)
		- folder: the place to store the file (str) *optional
	--------------------------------------------------------	
	Example:
		dat2text(dlist,'dlist','csv_files/')
		
		Will save dlist in 'csv_files/' folder as 'dlist.csv'	
	"""
	if folder:
		fname = foldrv(folder)+name+'.csv'
	else:
		fname = name+'.csv'
	if isinstance(data,list):
		xfil = open(fname,"wb")
		writ = csv.writer(xfil, delimiter = '\t', quoting = csv.QUOTE_NONE)
		for row in outdata:
			writ.writerow(row)
		xfil.close()
	else:
		np.savetxt(fname, data, delimiter = '\t')	
    

