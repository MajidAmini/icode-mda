###############################################################Libraries
import sys, traceback
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
	"""
	Description: Upload formatted AIS data to a table. Note that needs an XLS or CSV file with 13 columns: MMSI, RecvTime, LocalRecvTime, MessageId, NavigationalStatus, ROT, SOG, COG, TrueHeading, PositionAccuracy, Longitude, Latitude, CRC.
	The output will be a table with columns: MMSI, RecvTime, Latitude, Longitude, SOG, ROT.
	Parameters:
		- files: File with AIS data.					(type:string)
		- dform: date format.							(type:string)
		- dbtable: The name of reciever table.			(type:string)
	"""
	if isinstance(files, list) & DB.checkTableExists(dbtable):
		for i in range(len(files)):
			data = RP.AISfilter(RP.AIS2list(files[i]),dform)
			data = np.take(data, [0,1,11,10,6,5], axis = 1)
			data = np.hstack((data,np.zeros((len(data[:,0]),1))))
			DB.uploadToDB(dbtable,data)
	else:
		print "*** ERROR: files has to be a list or table "+dbtable+" doesn't exists ***"

#-----------------------------------------------------------------------
def AIS_date_hist(sdy, ndy = 0, bins = 1000, plim = [-90, 90,-180, 180], dform = '%Y-%m-%d', dbtable = 'vessel_history', folder = 'histograms'):
	#For initial date: UNIX if int or float, else convert---------------
	try:
		sdy = float(sdy)
		date = RP.unix2time(sdy,'%Y-%m-%d')
	except:											
		date = sdy
		sdy = RP.time2unix(sdy, dform)
		
	#Use plim to set geo. limits. Note worldwide default----------------
	plim = np.array(plim, dtype = float)
	geo_query = ' and Latitude between %f and %f and Longitude between %f and %f' % (plim[0], plim[1], plim[2], plim[3])
	
	#Prepare the common constants---------------------------------------
	#Bins ratio (for Latitude and Longitude), allows to have a proporional histogram
	dx = abs(plim[3]-plim[2])				#Note Longitude = x axis
	dy = abs(plim[1]-plim[0])				#Note Latitude = y axis
	if dx >= dy:
		xbins = bins
		ybins = np.ceil(xbins*(dy/dx))
	else:
		ybins = bins
		xbins = np.ceil(ybins*(dx/dy))
	#Size of each bin (bin size is proportional to side large and number of bins)
	dx = dx/xbins	
	dy = dy/ybins
	
	#Prepare a file to save all histograms------------------------------
	#prepare info
	info = np.hstack(np.array([sdy, ndy, xbins, ybins], dtype = float), plim)
	#make file
	filename = RP.foldrv(folder)+'AIShist_%s_+%ddays.bin' % (date,ndy)
	xfile = file(filename, 'wb')
	np.save(xfile, info)
	xfile.close()							
	
	#For each day (ndy + 1 days in total)-------------------------------
	for n in range(ndy+1):
		#For each day the hist starts empty
		hdat = np.zeros((bins/2,bins))				#Makes a proportional hist (rows: y axis, columns: x axis)
		
		#Obtain the data (per day and place) for the vessels
		#Prepare the date data
		sday = sdy + n*spd							#start day for histogram	(at 00:00)
		eday = sdy + (n+1)*spd						#next day 					(at 00:00)
		#Make the full query and obtain the data
		query = 'where TimeOfFix between %d and %d' + geo_query % (sday, eday)
		data = np.array(DB.readfromDB(dbtable, 'MMSI, Latitude, Longitude', query), dtype = float)
		
		#For the histogram
		if data != []:
			#Make the histogram
			data[:,1:3] -= [plim[0], plim[2]]		#Set te initial value on te bin 0,0
			data[:,1:3] /= [dy, dx]					#Amplify the values to put all data in bins range
			data[:,1:3] -= [1, 1]					#Substract 1 to change the limits to be friendly to matrix manipulation
			data[:,1:3] = np.floor(data[:,1:3])		#Delete the decimal part
			data = RP.unrows(data)					#Delete all the repeated rows
			#Put all together in one common matrix
			for i in range(len(data)):
				hdat[[data[i,1]],[data[i,2]]] += 1	#Prepare the Histogram
			#And fix the direction of the axis
			hdat = np.flipud(hdat)					#y axis is flipped, this fix that
	
		#Save the histogram in the file
		xfile = file(filename, 'ab+')
		np.save(xfile,hdat)
		xfile.close()

#-----------------------------------------------------------------------
def histfromfile(filename, ndy = 1):
	xfile = file(filename, 'rb')
	finfo = np.load(xfile)
	if ndy > finfo[1]+1:
		print 'Number of days stored exceeded, try with a lower ndy'
		xfile.close()
		return finfo, None
	elif ndy == 0:
		print 'ndy has to be greater than 0'
		xfile.close()
		return finfo, None
	else:
		for i in range(ndy):
			out = np.load(xfile)
		xfile.close()
		return finfo, out
	
#-----------------------------------------------------------------------
def histplot(hist):
		temp = np.ma.masked_where(hist == 0, hist)
		pl.imshow(temp, cmap = pl.cm.Reds)
		pl.show()
					



