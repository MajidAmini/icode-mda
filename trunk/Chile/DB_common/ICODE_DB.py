###############################################################Libraries
import numpy as np
from pylab import find
import mysql.connector as msq

#############################################################Definitions
#---------------------------------------------------field type for mySQL
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

#-------------------------------------------navigation status dictionary
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

#--------------------------------initialization for vessel history table
init_vhtable = {
	0:	"vessel_history",
	1:	"""(MMSI int(11) NOT NULL DEFAULT '0',TimeOfFix int(11) NOT NULL DEFAULT '0',Latitude double NOT NULL,Longitude double NOT NULL,SOG double DEFAULT NULL,Heading double DEFAULT NULL,RxStnID varchar(32) DEFAULT NULL,PRIMARY KEY (MMSI,TimeOfFix),KEY lat_lon (Latitude,Longitude),KEY MMSI (MMSI),KEY RxStnID_2 (RxStnID),KEY TimeOfFix (TimeOfFix)) ENGINE=MyISAM DEFAULT CHARSET=latin1"""
}

############################################################Repositories
class ICODE_DB:
	#-------------------------------------------------------------------
	def __init__(self):
		self.data = []
        
	#-------------------------------------------------------------------
	def dbConnection (self, host, user, password, dbname):
		"""
		Description: Allows the connection with a DB
		Parameters:					
			- host: the name/direction/server that runs the DB.	(type:string)
			- user: the user to enter the database.				(type:string)			
			- password: of the user.							(type:string)
			- dbname: the name of the database.					(type:string)
		"""
		try:
			self.dbcon = msq.connect(host=host,user=user,password=password,database=dbname, buffered=True) 
			self.cursor = self.dbcon.cursor()
		except msq.Error, e:
			print "*** ERROR %d: %s ***" % (e.args[0], e.args[1])
			sys.exit (1)
    
    #-------------------------------------------------------------------        
	def dbDisconnect (self):
		"""
		Description: Disconnect from the current database.
		Parameters:
			- void
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
		Description: If already exists a DB connection, check if the a table exists. Return a boolean value.
		Parameters:
			- tablename: The name of the table.			(type:string)
		"""
		try:
			cursor = self.cursor
			cursor.execute("select * from %s limit 0,1" % tablename)
			return True
		except:
			return False
    
    #-------------------------------------------------------------------        
	def columnNames (self,tablename, col, sta):
		"""
		Description: Returns as string or array the names (or types) for each column in the table.
		Parameters:
			- tablename: The name of the table.			(type:string)
			- col: 0 for names, 1 for types.			(type:int)
			- sta: 0 for string, 1 for list.			(type:int)
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
		Description: Creates a table in DB.
		Parameters:
			- tablename: The name of the table to create.					(type:string)
			- sql: The characteristics of the table (as columns or types).	(type:string) 
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
		Description: Uploads data to a table.
		Parameters:
			- tablename: The name of the receiver table.					(type:string)
			- data: The info to upload (has to be ordered like the table).	(type:depends on data)
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
		Description: Reads the selected data from a table.
		Parameters:
			- tablename: The name of the source table.						(type:string)
			- select: Restrictions to retrieve the data (MySQL formatting).	(type:string)
			- query:  The info that you want to retrieve.					(type:string)
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
		Description: Update a table
		Parameters:
			- tablename: The name of the table that want to update.		(type:string)
			- option: Sql code for change the table or data.			(type:string)
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
		Description: Deletes data from a table.
		Parameters:
			- tablename: The name of the table.							(type:string)
			- option: Which data you want to delete.					(type:string)
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
