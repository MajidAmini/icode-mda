###############################################################Libraries
import os
import csv
import time 
import xlrd
import numpy as np
import datetime as dt
import matplotlib as pml
from pylab import *

###########################################################AUX FUNCTIONS
def column(matrix, i):
    return [row[i] for row in matrix]
    
#----------------------------------------------------------------------- 
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
    return folder

#-----------------------------------------------------------------------
def datatotext(data, name, folder):
	folder = foldrv(folder)
	if isinstance(data,list):
		xfil = open(folder + name + '.csv',"wb")
		writ = csv.writer(xfil, delimiter = '\t', quoting = csv.QUOTE_NONE)
		for row in outdata:
			writ.writerow(row)
		xfil.close()
	else:
		np.savetxt(folder + name + '_fix.csv', data, delimiter = '\t')

##########################################################MAIN FUNCTIONS
def csv_from_excel(xls_file):
	#open the file as an xls
	xfile = xlrd.open_workbook(xls_file)
	#find all sheets 
	sheets = xfile.sheet_names()
	#for each sheet
	outdata = []
	for sheet in sheets:
		#find all rows
		wsheet = xfile.sheet_by_name(sheet)
		for row in xrange(wsheet.nrows):
			#put them in a list
			outdata.append(wsheet.row_values(row))
	#save the list in a new file 
	return outdata
	
#-----------------------------------------------------------------------
def AIS_filter(data, sform):
	#sform is te format of the date strings in the file 
	if isinstance(data,list):
		data = np.array(data, dtype = str)
	#delete the first row if it is an string (like an column name)
	try:
		test = int(data[0,0])
	except:
		data = data[1:,:]
	#replace the time format into unix
	for i in range(len(data[:,1])):
		data[i,1:3] = np.array([time2unix(data[i,1],sform),time2unix(data[i,2],sform)],dtype = float)
	#convert all the fields into floats
	data = np.array(data, dtype = float)
	#try to find errors in the array
	nst = find((data[:,4]<-1)|(data[:,4]>15))
	trh = find((data[:,8]<0)|(data[:,8]>359)&(data[:,8]!=511))
	lon = find(abs(data[:,10])>=180)
	lat = find(abs(data[:,11])>=180)
	#matrix with the index of errors
	tot = [nst, trh, lon, lat]
	#purge the errors
	for i in range(len(tot)):
		data = np.delete(data, tot[i], axis = 0) 
	return data
		       
#-----------------------------------------------------------------------
def AIS_histogram(dfile, day1, day2):
	sform = "%Y-%m-%d %H:%M:%S.0"
	data = np.genfromtxt(dfile, delimiter='\t', dtype = float)
	name = dfile.replace(".csv", "_hist.png")
	day1 = time2unix(day1 + ' 00:00:00.0', sform)
	day2 = time2unix(day2 + ' 23:59:59.0', sform)
	final = np.where((data[:,1] >= day1)&(data[:,1] <= day2))
	try:
		final = (data[final,:])[0][:,:]
		final[:,2:4] = final[:,10:12]
		final = final[:,0:4]
		lolim = [round(min(final[:,2])),round(max(final[:,2]))]
		lalim = [round(min(final[:,3])),round(max(final[:,3]))]
		plt.hist2d(final[:,2],final[:,3],bins=80, range=[[lolim[0],lolim[1]],[lalim[0],lalim[1]]])
		plt.xlabel('Longitude (decimal)')
		plt.ylabel('Latitude (decimal)')
		plt.grid(True, color='w', which="both")
		plt.colorbar()
		plt.savefig(name, dpi=None, facecolor='w', edgecolor='w', orientation='portrait', papertype=None, format='png', transparent=False)
		plt.show()
	except:
		print '*** Error: Date match ***'		
    

