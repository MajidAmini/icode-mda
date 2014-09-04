###############################################################Libraries
import sys
sys.path.append('./Code/DB_common')
import numpy as np
import mysql.connector as msq
from pylab import find
import ICODE_DBD as DBD

##########################################################MAIN FUNCTIONS
class ICODE_DB:
	def __init__(self):
		self.data = []
        
	def dbConnection (self, host, user, password, dbname):
		try:
			self.dbcon = msq.connect(host=host,user=user,password=password,database=dbname, buffered=True) 
			self.cursor = self.dbcon.cursor()
		except msq.Error, e:
			print "*** ERROR %d: %s ***" % (e.args[0], e.args[1])
			sys.exit (1)
            
	def dbDisconnect (self):
		try:
			self.cursor.close()
			self.dbcon.close()
			del self.dbcon, self.cursor
		except:
			print "*** ERROR: No connection to close. ***" 
 
	def checkTableExists (self,tablename):
		try:
			cursor = self.cursor
			cursor.execute("select * from %s limit 0,1" % tablename)
			return True
		except:
			return False
        
	def createTable (self,tablename,sql):
		if (not(self.checkTableExists(tablename))):
			cursor = self.cursor
			qsql = 'create table %s ' % tablename 
			self.cursor.execute(qsql + sql)
		else:
			print "*** ERROR: Already a DB with that name. ***"
            
	def columnNames (self,tablename, col, sta):
		if self.checkTableExists(tablename): #---------------------
			cursor = self.cursor
			cursor.execute("select * from %s limit 0,1" % tablename)
			aux = np.array(cursor.description, dtype = str)
			if sta:
				if col:
					out = [DBD.field_type[int(i[col])] for i in cursor.description]
				else:
					out = [i[col] for i in cursor.description] 
			else:
				out = ''
				aux = np.array(cursor.description, dtype = str)
				for i in range(len(aux)):
					x = aux[i,col]
					if col:
						x = DBD.field_type[int(aux[i,col])]    
					if i < (len(aux[:,1]) - 1):
						out += x + ', '
					else:
						out += x
			return out
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***" 
            
	def uploadToDB (self,tablename, data):
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
				if ot:
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
				out[0] = self.columnNames(tablename, 0, 0)
				out[1] = self.columnNames(tablename, 1, 0)
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
            
	def readfromDB (self,tablename, select='*', query=''):
		if self.checkTableExists(tablename): #---------------------
			cursor = self.cursor
			sql = "select "+select+" from %s "+query+""
			cursor.execute(sql % tablename)
			out = cursor.fetchall()
			return out
		else: #-----------------------------------------------
			print "*** ERROR: The DB doesn't exists. ***"
            
	def updateDB (self,tablename, option = ''):
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
            
	def deleteDB (self,tablename, option = ''):
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
