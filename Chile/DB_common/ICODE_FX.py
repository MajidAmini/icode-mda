###############################################################Libraries
from ICODE_DB import *
from ICODE_RP import *

#############################################################Definitions
#--------------------------------------------------------seconds per day
spd = 86400

##################################################################Makers		
DB = ICODE_DB()
RP = ICODE_RP()

#########################################################Final functions
#-----------------------------------------------------------------------
def AIS_upload_DD(files, dform = '%Y-%m-%d %H:%M:%S.0', dbtable = 'vessel_history'):
	if isinstance(files, list) & DB.checkTableExists(dbtable):
		for i in range(len(files)):
			data = RP.AISfilter(RP.AIS2list(files[i]),dform)
			data = np.take(data, [0,1,11,10,6,5], axis = 1)
			data = np.hstack((data,np.zeros((len(data[:,0]),1))))
			DB.uploadToDB(dbtable,data)
	else:
		print "*** ERROR: files has to be a list or table "+dbtable+" doesn't exists ***"

#-----------------------------------------------------------------------
def AIS_date_hist(sdy, ndy = 1, bins = 1000, xlim = None, ylim = None, dform = '%Y-%m-%d', dbtable = 'vessel_history', folder = 'histograms'):
	"""
		- sdy: start day
		- ndy: number of days after sdy that will be considered
		- bins: number of division per axis
		- xlim & ylim: Latitud and longitude limits, have to be lists in 
			order [minimum, maximum]
		- dform: the date format of sdy
		- dbtable: the table to obtain the data in the database
		- folder: the name of the folder to keep the histograms
		Note that the output file will be like:
		
				B	x	x	x	x	.....	x	x	x	x
				y	h	h	h	h	.....	h	h	h	h
				y	h	h	h	h	.....	h	h	h	h
				y	h	h	h	h	.....	h	h	h	h
				
				.	.	.	.	.	.....	.	.	.	.
				.	.	.	.	.	.....	.	.	.	.
				.	.	.	.	.	.....	.	.	.	.	
				
				y	h	h	h	h	.....	h	h	h	h
				y	h	h	h	h	.....	h	h	h	h
				y	h	h	h	h	.....	h	h	h	h
		
		Where B is the number of bins, x are the values of the x axis in
		the histogram (latitude) and y the y axis values (latitude) for
		each tick. the h are the histogram, so the output matrix will have
		a shape of (bins+1, bins+1). 
		For a histogram of 1000 bins, the weight of the output file is 
		of 8MB aprox. 
	"""
	try:
		sdy = int(sdy)
	except:
		sdy = RP.time2unix(sdy, dform)
	#Query--------------------------------------------------------------
	query = 'where TimeOfFix between %d and %d' % (sdy, sdy+(ndy*spd))
	if xlim:
		query += ' and Latitude between %f and %f' % (xlim.min(), xlim.max())  
	if ylim:
		query += ' and Longitude between %f and %f' % (ylim.min(), ylim.max())
	#Data---------------------------------------------------------------
	data = np.array(DB.readfromDB(dbtable,'MMSI, Latitude, Longitude, TimeOfFix',query))
	try:
		xdat = [data[:,1].min(), data[:,1].max()]
		ydat = [data[:,2].min(), data[:,2].max()]
		#Histograms-----------------------------------------------------
		idy = sdy
		for i in range(ndy):
			fdy = sdy + (i+1)*spd
			index = find((idy < data[:,3])&(data[:,3] < fdy))
			if len(index):
				tdata = np.take(data, index, axis = 0)
				hdat, xl, yl = RP.AISHist(tdata, xdat, ydat, bins)
				RP.hist2file(hdat, xl, yl, 'day_' + RP.unix2time(idy, dform)+'_hist' , folder)
			else:
				print """No data for day: """+RP.unix2time(sdy + i*spd, dform)
			idy = fdy
	except:
		print "*** Query has no results ***"



