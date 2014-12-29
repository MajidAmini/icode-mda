#!/usr/bin/python2.7

"""

@file ICODE_DB.py
@date Dic 2014 

"""

#-*- coding: utf-8 -*-

# Libraries
import numpy as np
from pylab import find
import mysql.connector as msq
from mysql.connector import errorcode

# Definitions
# Field type for mySQL
field_type = {
	 0: '%f',				#DECIMAL
	 1: '%d',				#TINY
	 2: '%d',				#SHORT				
	 3: '%d',				#LONG
	 4: '%f',				#FLOAT
	 5: '%f',				#DOUBLE
	 6: 'NULL',				#NULL
	 7: 'TIMESTAMP',			#TIMESTAMP
	 8: 'LONGLONG',				#LONGLONG
	 9: '%d',				#INT24
	 10: '%Y-%m-%d',			#DATE
	 11: '%H:%M:%S',			#TIME
	 12: '%Y-%m-%d %H:%M:%S',		#DATETIME
	 13: '%Y',				#YEAR
	 14: 'NEWDATE',				#NEWDATE
	 15: '"%s"',				#VARCHAR
	 16: '%x',				#BIT
	 246: 'NEWDECIMAL',			#NEWDECIMAL
	 247: 'INTERVAL',			#INTERVAL
	 248: 'SET',				#SET
	 249: '"%s"',				#TINY BLOB
	 250: '"%s"',				#MEDIUM BLOB
	 251: '"%s"',				#LONG BLOB
	 252: '"%s"',				#BLOB
	 253: '"%s"',				#VAR STRING
	 254: '"%s"',				#STRING
	 255: 'GEOMETRY' 			#GEOMETRY
}

# Navigation status dictionary
nav_stat = {
	-1: 'Not sending',
	0: 'Under way using engine',
	1: 'At anchor',
	2: 'Not under command',
	3: 'Restricted maneuverability',
	4: 'Constrained by her draught',
	5: 'Moored',
	6: 'Aground',
	7: 'Engage in fishing',
	8: 'Under way sailing',
	9: 'Reserved for future use (Hazard or pol_A)',
	10: 'Reserved for future use (Hazard or pol_A)',
	11: 'Reserved for future use',
	12: 'Reserved for future use',
	13: 'Reserved for future use',
	14: 'AIS-SART active',
	15: 'Nod defined (default for test)'
}

# Initialization for vessel history table
init_vhtable = {
	0:	"vessel_history",
	1:	"""(MMSI int(11) NOT NULL DEFAULT '0',TimeOfFix int(11) NOT NULL DEFAULT '0',Latitude double NOT NULL,Longitude double NOT NULL,SOG double DEFAULT NULL,Heading double DEFAULT NULL,RxStnID varchar(32) DEFAULT NULL,PRIMARY KEY (MMSI,TimeOfFix),KEY lat_lon (Latitude,Longitude),KEY MMSI (MMSI),KEY RxStnID_2 (RxStnID),KEY TimeOfFix (TimeOfFix)) ENGINE=MyISAM DEFAULT CHARSET=latin1"""
}

# Repositories
class ICODE_DB:
	#-------------------------------------------------------------------
	def __init__(self):
		self.data = []
        
	#-------------------------------------------------------------------
	def dbConnection (self, host, user, password, dbname):
		"""
		Descripcion: Funcion para conectarse a la BD.
		
		Parametros:					
			- host: Nombre/direccion/servidor donde esta alojada la BD. (type:string)
			- user: Usuario para ingresar a la base de datos.           (type:string)			
			- password: Contrasena asociada al usuario.                 (type:string)
			- dbname: Nombre de la BD.                                  (type:string)
		
		Ejemplo:
			-> dbConnection('localhost','root','rootpass','test_DB')
			La funcion anterior se conectara entonces a la base de datos 
			'test_DB' en 'localhost' con las credenciales usr:'root' y 
			pass:'rootpass'.  
		"""
		try:
			self.dbcon = msq.connect(host=host,user=user,password=password,database=dbname, buffered=True) 
			self.cursor = self.dbcon.cursor()
		except msq.Error as err:
			if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
				print '*** ERROR: Something is wrong with your user name or password. ***'
			elif err.errno == errorcode.ER_BAD_DB_ERROR:
				print '*** ERROR: Database does not exists. ***'
			else:
				print '*** ERROR: Check your connection or host name. ***'
    
    #-------------------------------------------------------------------        
	def dbDisconnect (self):
		"""
		Descripcion: Desconecta al usuario de la base de datos y elimina 
		los cursores asociados.
		
		Parametros:
			- No tiene (void).
		
		"""
		try:
			self.cursor.close()
			self.dbcon.close()
			del self.dbcon, self.cursor
		except:
			print "*** ERROR: No connection to close. ***" 

	#-------------------------------------------------------------------
	def checkTableExists (self,tablename):
		"""
		Descripcion: Verifica si existe o no una tabla determinada en la 
		DB. Retorna un valor booleano.
		
		Parametros:
			- tablename: El nombre de la tabla de interes.              (type:string)
		
		Ejemplo:
			-> checkTableExists('test_table')
			Si la tabla 'test_table' existe en la base de datos, la
			funcion anterior retornara TRUE, si no, FALSE.
		"""
		try:
			cursor = self.cursor
			cursor.execute("select * from %s limit 0,1" % tablename)
			return True
		except:
			return False
    
    #-------------------------------------------------------------------        
	def columnNames (self,tablename, col = 0, sta = 0):
		"""
		Descripcion: Entrega la metadata de una tabla en especifico 
		(nombres de columna o tipos de dato) como string o arreglo.
		
		Parametros:
			- tablename: Nombre de la tabla de interes.                 (type:string)
			- col: determina si se recibiran los nombres de la columna 
			(0) o sus tipos de dato (1).                                (type:int)
			- sta: determina como seran solicitados los datos, como 
			string (0) o como lista (1).                                (type:int)
		
		Ejemplos: Suponga para el ejemplo que se tiene una tabla con 3
		parametros: Nombre (string), Edad (int) y Peso (int) llamada
		'Datos'.
			1)	-> columnNames('test_table', col = 0, sta = 0)
				En este caso, se espera que la salida de la sea	un string 
				con los nombres de las columnas:
					-> 'Nombre, Edad, Peso'
			2)	-> columnNames('test_table', col = 0, sta = 1)
				En este caso, tambien se espera que la salida corresponda
				a los nombres de las columnas, pero como una lista:
					-> ['Nombre','Edad','Peso']
			3)	-> columnNames('test_table', col = 1, sta = 0)
				En este caso se espera recibir el tipo de dato de cada
				columna como un string:
					-> '%s, %d, %d'
		"""
		if self.checkTableExists(tablename): #---------------------
			cursor = self.cursor
			cursor.execute("select * from %s limit 0,1" % tablename)
			aux = np.array(cursor.description, dtype = str)
			if sta:
				if col:
					out = [field_type[int(i[col])] for i in cursor.description]
				else:
					out = [i[col] for i in cursor.description] 
			else:
				out = ''
				aux = np.array(cursor.description, dtype = str)
				for i in range(len(aux)):
					x = aux[i,col]
					if col:
						x = field_type[int(aux[i,col])]    
					if i < (len(aux[:,1]) - 1):
						out += x + ', '
					else:
						out += x
			return out
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***" 
	
	#-------------------------------------------------------------------	        
	def createTable (self,tablename,sql):
		"""
		Descripcion: Crea una tabla en la BD simpre que no exista otra 
		con el mismo nombre.
		
		Parametros:
			- tablename: Nombre que tendra la tabla creada.             (type:string)
			- sql: Las caracteristicas de la tabla (columnas y tipos de 
			dato).	                                                    (type:string)
			
		Ejemplo: 
			->  sql = '(ID int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, Name varchar(20))'
			->  createTable('test_table',sql)
		En caso de existir una tabla con ese nombre, se arroja un mensaje
		de error.
		
		"""
		if (not(self.checkTableExists(tablename))):
			cursor = self.cursor
			qsql = 'create table %s ' % tablename 
			self.cursor.execute(qsql + sql)
		else:
			print "*** ERROR: Already a DB with that name. ***"
	
	#-------------------------------------------------------------------
	def uploadToDB (self,tablename, data):
		"""
		Descripcion: Funcion para subir datos a una determinada tabla.
		
		Parametros:
			- tablename: Nombre de la tabla destino.                    (type:string)
			- data: Datos a ser subidos.                                (type:depends on data)
		Note que se espera que data sea una lista o un arreglo, en caso 
		de necesitar ingresar solo un dato, es necesario representarlo de
		esa forma. 
		
		Ejemplo:
			1) En caso de una sola columna de datos:
				-> uploadToDB('test_table',[dato1,dato2,...])
			2) En caso de mas de una columna de datos:
				-> uploadToDB('test_table',[[dato1, dato2,...],[dato1, dato2,...],...])
				
		"""
		if self.checkTableExists(tablename): #---------------------
			cursor = self.cursor
			#----------------------------------------------avoid autoinc
			cursor.execute("select * from %s limit 0,1" % tablename)
			aid = [cursor.description[i][7] for i in range(len(cursor.description[:]))]
			for i in range(len(aid)):
				aidx = np.array(msq.FieldFlag.get_bit_info(aid[i]))
				if find(aidx == 'AUTO_INCREMENT'):
					ot = i
			try:
				npam = np.array([self.columnNames(tablename,0,1),self.columnNames(tablename,1,1)], dtype = str)
				npam = np.delete(npam,ot,axis = 1)
				out = []
				for n in range(2):
					for i in range(len(npam[0,:])):
						if i == 0:
							aux = npam[n,i]
						else:
							aux += ',' + npam[n,i]
					out += [aux]
			except:
				out = [self.columnNames(tablename, 0, 0),self.columnNames(tablename, 1, 0)]
			#----------------------------------------------do the upload 	
			sql = "insert into "+tablename+"("+out[0]+") values("+out[1]+")"
			if not(isinstance(data,list)):
				data = data.tolist()
				self.cursor.close()
				self.cursor = self.dbcon.cursor()
			for line in data:
				try:
					msql = sql % tuple(line)
				except:
					msql = sql % line
				try:
					self.cursor.execute(msql)
				except:
					self.dbcon.rollback()
			self.dbcon.commit()
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***"
    
    #-------------------------------------------------------------------        
	def readfromDB (self,tablename, select='*', query=''):
		"""
		Descripcion: Funcion para leer datos de una determinada tabla.
		
		Parametros:
			- tablename: Nombre de la tabla a ser leida.                (type:string)
			- select: Columnas de interes (formato SQL).                (type:string)
			- query:  Restricciones a la solicitud (formato SQL).       (type:string)
			
		Ejemplo:
			->  result = readfromDB('test_table',select = 'dato1, dato5',query = 'where dato1 between...')
		Note que en caso de no especificar 'select', se leeran todas las 
		columnas. De forma similar, si no se especifica 'query' se leeran
		todas las filas.
		
		"""
		if self.checkTableExists(tablename): #---------------------
			cursor = self.cursor
			sql = "select "+select+" from %s "+query+""
			cursor.execute(sql % tablename)
			out = cursor.fetchall()
			return out
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***"
    
    #-------------------------------------------------------------------        
	def updateDB (self,tablename, option = ''):
		"""
		Descripcion: Permite modificar los datos de la tabla.
		
		Parametros:
			- tablename: Nombre de la tabla a ser modificada.           (type:string)
			- option: Cambios a realizar en la tabla (formato SQL).     (type:string)
		
		Ejemplo:
			-> updateDB('test_table', option = "set dato1 = 2 where dato2 = 'test'")
		Luego, para todas las coincidencias del dato2, el dato1 sera
		reemplazado por un 2.
		
		"""
		if self.checkTableExists(tablename): #---------------------
			try:
				cursor = self.cursor
				sql = 'update %s '+option
				cursor.execute(sql % tablename)
				self.dbcon.commit()
			except:
				print "*** ERROR: The table can not be updated, please check the options ***"
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***"
    
    #-------------------------------------------------------------------        
	def deleteDB (self,tablename, option = ''):
		"""
		Descripcion: Permite eliminar datos de una tabla determinada.
		
		Parametros:
			- tablename: Nombre de la tabla.                            (type:string)
			- option: Caracteristicas de las filas a ser borradas.      (type:string)
			
		Ejemplo:
			-> deleteDB('test_table', option = 'dato1 = 2')
		Para todas las coincidencias de dato 1, la fila entera sera 
		eliminada.
		"""
		if self.checkTableExists(tablename): #---------------------
			try:
				cursor = self.cursor
				sql = 'delete from %s where '+option
				cursor.execute(sql % tablename)
				self.dbcon.commit()
			except:
				print "*** ERROR: The table can not be updated, please check the options ***"
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***"
