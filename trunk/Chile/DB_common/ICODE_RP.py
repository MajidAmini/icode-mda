#!/usr/bin/python2.7

"""

@file ICODE_RP.py
@date Dic 2014 

"""

#-*- coding: utf-8 -*-

# Libraries
import os
import csv
import time 
import xlrd
import string
import pylab as pl
import numpy as np
import datetime as dt

# Definitions
def normalize(s):
	"""
	Descripcion: Quita puntuaciones a una palabra y la deja en minusculas.
	
	Parametros:
		- s: Palabra a convertir.
	
	Ejemplo:
		-> normalize('H.e.l.L,o')
		El resultado es:
			-> hello
	"""
	for p in string.punctuation:
		s = s.replace(p, '')
	return s.lower().strip()

# Repositories
class ICODE_RP:
	#-------------------------------------------------------------------
	def __init__(self):
		self.data = []
	
	#-------------------------------------------------------------------
	def time2unix(self, strdate, formdate):
		"""
		Descripcion: Convierte una fecha a tiempo UNIX.
		
		Parametros:
			- strdate: La fecha a convertir.                            (type:string)
			- formdate: El formato de la fecha ingresada.               (type:string)
			
		Ejemplo:
			-> time2unix('2014-03-25 12:34:06.0', '%Y-%m-%d %H:%M:%S.0')
			La funcion deberia retornar un resultado de tipo float:
				-> 1395761646.0
		"""
		return time.mktime(dt.datetime.strptime(strdate,formdate).timetuple())

	#------------------------------------------------------------------- 
	def unix2time(self, flounix, formdate):
		"""
		Descripcion: Convierte tiempo UNIX a fecha.
		
		Parametros:
			- flounix: tiempo UNIX.                                     (type:float/int)
			- formdate: El formato de la fecha deseada.                 (type:string)
			
		Ejemplo:
			-> unix2time(1395761646, '%Y-%m-%d %H:%M:%S')
			La funcion deberia retornar:
				-> '2014-03-25 12:34:06'
		"""
		return dt.datetime.fromtimestamp(flounix).strftime(formdate)

	#-------------------------------------------------------------------
	def unrows(self, data):
		"""
		Autor: Joe Kingston
		
		Descripcion: Busca filas unicas en un arreglo numpy.
		 
		Parametros:
			- data: Arreglo a revisar.                                  (type: numpy array)
			 
		Ejemplo:
			-> data = np.array([[0,1],[1,1],[1,0],[0,1],[0,0]])
			-> unrows(data)
			La funcion deberia retornar:
				-> array([[0, 0],[0, 1],[1, 0],[1, 1]])
			Que corresponde a las filas unicas del arreglo.

		"""
		uniq = np.unique(data.view(data.dtype.descr * data.shape[1]))
		return uniq.view(data.dtype).reshape(-1,data.shape[1])
	
	#-------------------------------------------------------------------
	def AIS2list(self, xfiles, formdate = '%Y-%m-%d %H:%M:%S.0', coi = np.array(['mmsi','recvtime','latitude','longitude','sog','rot','rxstnid'])):
		"""
		Descripcion: Para archivos con info AIS (xls o texto) extrae las
		columnas indicadas por coi. Por defecto coi esta definido como 
		MMSI, RecvTime, Latitude, Longitude, SOG, ROT y RxStnID. 
		Para que el programa funcione los archivos AIS deben tener en la 
		primera fila los nombres de las columnas, coi debe coincidir con
		estos nombres (o aglgunos de ellos).
		Si alguna de las columnas a extraer no existe sera rellenada con
		0. 

		Parametros:
			- xfiles: Direccion y nombre del archivo.                   (type:string)
			- formdate: Formato de fecha del archivo.                   (type:string)     
		
		Ejemplo:
			-> AIS2list('xls_files/test1.xls', '%Y-%m-%d %H:%M:%S.0')
		"""
		
		#Extract the data from the file
		#in case of an xls file...
		try:
			xfile = xlrd.open_workbook(xfiles)			
			count = 0 				
			for i in range(len(xfile.sheet_names())):	
				aux = xfile.sheet_by_index(i)			
				if not(count):
					data = np.array(aux._cell_values[:][:])			
					count = 1
				else:
					data = np.vstack((data, np.array(aux._cell_values[:][:])))
		#in case of a text file
		except:
			#open the file and extract the data
			xfile = open(xfiles, 'r')
			xfile = csv.reader(xfile, delimiter = ',')
			data = []
			for row in xfile:
				data.append(row)
			data = np.array(data)
		
		#Prepare the data of interest		
		final_data = np.empty((len(data),len(coi)), dtype=object)
		
		for i in range(len(coi)):
			for j in range(len(data[0,:])):
				if normalize(data[0,j]) == coi[i]:
					final_data[:,i] = data[:,j]
		
		#Convert the data to float
		data = final_data[1:,:]
		for i in range(len(data)):
			data[i,1] = self.time2unix(data[i,1], formdate)
		data = np.array(data, dtype = float)
		data = np.nan_to_num(data)
		
		#Filter the data
		lon = pl.find(abs(data[:,3])>=180)
		lat = pl.find(abs(data[:,2])>=90)
		tot = np.unique(np.hstack((lon, lat)))
		data = np.delete(data, tot, axis = 0)
			
		return data
	
	#-------------------------------------------------------------------
	def foldrv(self, folder):
		"""
		Descripcion: Crea, en caso de ser necesario, una carpeta. Ademas,
		en caso de que el nombre sea incluido en una direccion verifica
		que tenga un slash al final.
		
		Parametros:
			- folder: Nombre de la carpeta.
			
		Ejemplo:
			-> foldrv('example')
			
			Si la carpeta 'example' no existe, la crea, ademas retorna el
			nombre como 'example/'.
	
		"""
		if folder[len(folder)-1] != '/':
			folder += '/'
		try:
			os.stat(folder)
		except:
			os.mkdir(folder)
		return folder
					   
