#!/usr/bin/python2.7

"""

@file ICODE_FX.py
@date Dic 2014 

"""

#-*- coding: utf-8 -*-

# Libraries
import sys
import traceback
from ICODE_DB import *
from ICODE_RP import *

# Definitions
spd = 86400

# Makers		
DB = ICODE_DB()
RP = ICODE_RP()

# Final functions
#-----------------------------------------------------------------------
def AIS_upload_DB(files, formdate = '%Y-%m-%d %H:%M:%S.0', dbtable = 'vessel_history', coi = np.array(['mmsi','recvtime','latitude','longitude','sog','rot','rxstnid'])):
	"""
	Descripcion: Extrae y sube informacion AIS desde archivos XLS or CSV 
	a la tabla indicada de una base de datos.
	Los datos a subir se encuentran indicados por coi.
	
	Parametros:
		- files: Archivo con datos AIS.                                 (type:string)
		- formdate: Formato de fecha.                                   (type:string)
		- dbtable: Nombre de la tabla de destino (BD).                  (type:string)
		- coi: Columnas de interes a subir a la BD.                     (type:string)
	"""
	if isinstance(files, list):
		if DB.checkTableExists(dbtable):
			for i in range(len(files)):
				data = RP.AIS2list(files[i], formdate, coi)
				DB.uploadToDB(dbtable, data)
		else:
			print "*** ERROR: "+dbtable+" doesn't exists ***"
	else:
		print "*** ERROR: files has to be a list or table ***"

#-----------------------------------------------------------------------
def AIS_date_hist(sdy, ndy = 0, bins = 1000, plim = [-90, 90,-180, 180], formdate = '%Y-%m-%d', dbtable = 'vessel_history', folder = 'histograms'):
	"""
	Descripcion: Genera un heatmap para las posiciones de los barcos por
	fecha y area geografica. Es creado un heatmap por dia, todos los 
	histogramas son almacenados en un archivo bin de la forma:
		#inicio del archivo
		#informacion (sdy, ndy, xbins, ybins, plim)
		#histograma dia 1
		#histograma dia 2
		#...
		#histograma dia n
		#fin del archivo
	El nombre del archivo indica la fecha del primer histograma y el numero
	de dias considerados luego del mismo.
	
	Parametros:
		- sdy: Fecha del primer histograma. Puede ser UNIX.             (type:float/int/string)                             
		- ndy: Numero de dias considerados para siguientes histogramas. (type:int)
		- bins: Numero maximo de divisiones.                            (type:int) 
		- plim: Limites geograficos [Latitud, Longitud].                (type:float)
		- formdate: Formato de fecha.                                   (type:string)
		- dbtable: Nombre de la tabla de la BD cual seran extraidos los
		  datos.                                                        (type:string)
		- folder: Nombre del directorio donde seran guardados los 
		  histogramas.                                                  (type:string)
		  
	Ejemplo:
		-> AIS_date_hist('2013-09-05', ndy = 5, bins = 1000, plim = [-23.11,-30.82,-113.43,-101.54])
		Note que se realizaran 6 histogramas desde el 5 de septiembre
		hasta el 10 de septiembre del 2013. La fecha pudo ser escrita 
		tambien en formato UNIX: 1378353600, que puede ser escrito como
		int o float. 
		El area elegida para el histograma corresponde a un poligono que
		cubre Isla de Pascua e Isla Sala y Gomez incluyendo su EEZ.
		El archivo de salida tendra el nombre:
			-> AIShist_2013-09-05_+5days.bin
	"""
	#For initial date: UNIX if int or float, else convert---------------
	try:
		sdy = float(sdy)
		date = RP.unix2time(sdy, formdate)
	except:											
		date = sdy
		sdy = RP.time2unix(sdy, formdate)
		
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
	info = np.hstack((np.array([sdy, ndy, xbins, ybins], dtype = float), plim))
	#make file
	filename = RP.foldrv(folder)+'AIShist_%s_+%ddays.bin' % (date,ndy)
	xfile = file(filename, 'wb')
	np.save(xfile, info)
	xfile.close()							
	
	#For each day (ndy + 1 days in total)-------------------------------
	for n in range(ndy+1):
		#For each day the hist starts empty
		hdat = np.zeros((ybins,xbins))				#Makes a proportional hist (rows: y axis, columns: x axis)
		
		#Obtain the data (per day and place) for the vessels
		#Prepare the date data
		sday = sdy + n*spd							#start day for histogram	(at 00:00)
		eday = sdy + (n+1)*spd						#next day 					(at 00:00)
		#Make the full query and obtain the data
		query = 'where TimeOfFix between %d and %d' % (sday, eday)
		query += geo_query
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
	"""
	Descripcion: Permite extraer los histogramas generados por AIS_date_hist
	del archivo .bin. Esta funcion tiene 2 salidas, la info de los 
	histogramas y el histograma.
	
	Parametros:
		- filename: Nombre del archivo .bin.                            (type:string)
		- ndy: Numero del dia a extraer.                                (type:int)	
	
	Ejemplo:
		-> histfromfile('AIShist_2013-09-05_+5days.bin', ndy = 2)
		Se extraera el histograma correspondiente al 2do dia: 2013-09-06
		
	"""
	#Open file
	xfile = file(filename, 'rb')
	finfo = np.load(xfile)
	#If ndy is fine
	if ndy > finfo[1]+1:
		print '*** ERROR: Number of days stored exceeded, try with a lower ndy. ***'
		xfile.close()
		return finfo, None
	elif ndy == 0:
		print '*** ERROR: ndy has to be greater than 0. ***'
		xfile.close()
		return finfo, None
	#Extract the hist
	else:
		for i in range(ndy):
			out = np.load(xfile)
		xfile.close()
		return finfo, out
	
#-----------------------------------------------------------------------
def histplot(filename, hrange=[1,1], kmlout = 0, folder = 'kml_histograms'):
	"""
	Descripcion: Permite generar un histograma sobre un rango de dias en
	base a un archivo .bin generado por AIS_date_hist.  
	
	Parametros:
		- filename: Nombre del archivo .bin.                            (type:string)
		- hrange: Rango de dias considerado para la suma de histogramas,
		  el formato es [primer dia, ultimo dia].                       (type:int)
		- kmlout: Si es 0, se muestra el histograma por pantalla, si es 
		  1, se genera un archivo kml y una imagen para google earth.   (type:int)
		- folder: Carpeta donde se guardaran los archivos kml en caso de
		  generarlos, por defecto 'kml_histograms'.                     (type:string')
	
	Ejemplo:
		-> histplot('AIShist_2013-09-05_+5days.bin', hrange = [1,2], kmlout = 1)
		La linea anterior generara un histograma de la suma de los datos
		del dia 1 y el dia 2. El kml de salida (y la imagen) tendran por
		nombre '2013-09-05_day(1-2)', almacenadas en la carpeta 'kml_histograms'.
	"""
	#Open the hist file
	xfile = file(filename, 'rb')
	finfo = np.load(xfile)
	#If hrange[0] is fine
	if hrange[0] > finfo[1]+1:
		print '*** ERROR: Initial range day exceeded the number od days, try with a lower one. ***'
		xfile.close()
	elif hrange[0] == 0:
		print '*** ERROR: Initial range day has to be greater than 0. ***'
		xfile.close()
	else:
		#hrange[1] has to be lower or equal to ndy
		if hrange[1] > finfo[1]+1:
			hrange[1] = finfo[1]+1
		#Extract the needed histograms
		count = 0
		for i in range(int(finfo[1]+1)):
			if i >= hrange[0] and i <= hrange[1]:
				if count == 0:
					hist = np.load(xfile)
					count = 1
				else:
					hist += np.load(xfile)
		xfile.close()
		#Prepare hist to plot
		hist = np.ma.masked_where(hist == 0, hist)
		#If kmlout == 0, print the plot
		if kmlout == 0:
			pl.imshow(hist, cmap = pl.cm.hot)
			pl.show()
		#else, make a kml file to plot in google earth
		else:
			#filename
			date = RP.unix2time(finfo[0], '%Y-%m-%d')
			fname = '%s_day(%d-%d)' % (date,hrange[0],hrange[1])
			#image
			pl.imsave(RP.foldrv(folder)+fname+'.png',hist,cmap = pl.cm.hot)
			#kml_file
			xfile = file(RP.foldrv(folder)+fname+'.kml','w')
			kml_file = """<?xml version="1.0" encoding="UTF-8"?>
			<kml xmlns="http://www.opengis.net/kml/2.2">
			<Folder>
			<GroundOverlay>
			<Icon>
			<href>%s.png</href>
			</Icon>
			<LatLonBox>
			<south>%f</south>
			<north>%f</north>
			<east>%f</east>
			<west>%f</west>
			<rotation>0</rotation>
			</LatLonBox>
			</GroundOverlay>
			</Folder>
			</kml>""" % (fname,finfo[4],finfo[5],finfo[6],finfo[7])
			wait = xfile.write(kml_file)
			xfile.close()
				
			




