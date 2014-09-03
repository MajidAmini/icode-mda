###############################################################Libraries
import sys
import numpy as np
import MySQLdb as msq
import ICODE_DBD as DBD

##########################################################MAIN FUNCTIONS
def dbConnection (host, user, password, dbname):
	"""
	Connects you with the DB in host.
	--------------------------------------------------------
	Syntax:
		dbConnection (host, user, password, dbname)
	--------------------------------------------------------
	Parameters:
		- host: The ip or direction of host.
		- user: DB User
		- password: DB password for user
		- dbname: DB of interest
	--------------------------------------------------------	
	Example:
		dbConnection ('localhost','root','rootpass','testDB')
		
		This function allows the acces to a database, it's
		neccesary to the functioning of this library
	"""
	try:
		global dbcon 
		dbcon = msq.connect(host,user,password,dbname) 
		global cursor
		cursor = dbcon.cursor()
	except msq.Error, e:
		print "*** ERROR %d: %s ***" % (e.args[0], e.args[1])
		sys.exit (1)
        
#-----------------------------------------------------------------------
def dbDisconnect ():
	"""
	Disconnects you with the DB in host.
	--------------------------------------------------------
	Syntax:
		dbDisconnect()
	--------------------------------------------------------
	Parameters:
		There's no neccesay parameters.
	--------------------------------------------------------	
	Example:
		dbDisconnect()
		
		Deletes all the connection variables.
	"""
	dbcon.close()
	del dbcon, cursor
        
#-----------------------------------------------------------------------
def checkTableExists (tablename):
	"""
	Checks if table exists. 
	--------------------------------------------------------
	Syntax:
		checkTableExists (tablename)
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
	--------------------------------------------------------	
	Example:
		checkTableExists ('testtbl')
		
		The result of this function is True when te table 
		exists and False if it not.
	"""
	try:
		cursor.execute("select * from %s limit 0,1" % tablename)
		return True
	except:
		return False
    
#-----------------------------------------------------------------------
def createTable (tablename, sql):
	"""
	Allows to create a table. 
	--------------------------------------------------------
	Syntax:
		createTable (tablename, sql)
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- sql: the rows to be created
	--------------------------------------------------------	
	Example:
		createTable ('testtbl', '(Id int not null, name varchar(20), age int, primary key(Id))')
		
		If the table don't exists, create a table called 
		'testtbl' with the columns Id, name and age. 
	"""
	if(not(checkTableExists(tablename))):
		sql = 'create table %s ' + sql 
		cursor.execute(sql % tablename)
	else:
		print "*** ERROR: Already a DB with that name. ***"
        
#-----------------------------------------------------------------------
def columnNames (tablename, col, sta):
	"""
	Gives the column names of a table or the operators of the
	diffrent columns. 
	--------------------------------------------------------
	Syntax:
		columnNames (tablename, col, sta)
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- col: 0: gives the names of the columns. 1: gives 
		the operatos of a column.
		- sta: 0: info as a string. 1: info as a list. 
	--------------------------------------------------------	
	Example:
		Supose that testtbl has 3 columns: Id (int), name 
		(varchar) and age (int):
		1) columnNames (testtbl, 0, 0)
			result: 'Id, name, age'
		2) columnNames (testtbl, 0, 1)
			result: ['Id', 'name', 'age']
		3) columnNames (testtbl, 1, 0)
			result: '%d, %s, %d'
		
	"""
	if checkTableExists(tablename): #---------------------
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
        
#-----------------------------------------------------------------------
def upload2DB (tablename, data):
	"""
	Upload data to a table in host. The data can be a list or
	an array.
	--------------------------------------------------------
	Syntax:
		uploadtoDB (tablename, data)
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- data: is the info that you want to upload
	--------------------------------------------------------	
	Example:
		Supose that testtbl has 3 columns: Id (int), name 
		(varchar) and age (int):
		
		uploadtoDB ('testtbl', [[1,'Juan',20],[2,'Ana',3]])
		
		The function upload the info to DB.
		
	"""
	if checkTableExists(tablename): #---------------------
		sql = "insert into "+tablename+"("+columnNames(tablename, 0, 0)+") values("+columnNames(tablename, 1, 0)+")"
		if not(isinstance(data,list)):
			data = data.tolist()
		for line in data:
			try:
				msql = sql % tuple(line)
			except:
				msql = sql % line
			try:
				cursor.execute(msql)
			except:
				dbcon.rollback()
		dbcon.commit()
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"

#-----------------------------------------------------------------------
def upload2DB_ai (tablename, data, columns):
	"""
	Upload data to a table in host, avoiding columns. 
	The data can be a list or an array.
	--------------------------------------------------------
	Syntax:
		uploadtoDB (tablename, data, columns)
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- data: is the info that you want to upload
		- columns: the columns to avoid
	--------------------------------------------------------	
	Example:
		Supose that testtbl has 3 columns: Id (int) with auto increment, 
		name (varchar) and age (int):
		
		uploadtoDB ('testtbl', [['Juan',20],['Ana',3]], 0)
		
		The function upload the info to DB, avoiding the first column.
		Note that you can define more than one auto incremental column
		changing column = 0 for column = [0, 1,....]
		
	"""
	if checkTableExists(tablename): #---------------------
		#----------------------------------------------avoid autoinc par
		npam = np.array([columnNames(tablename,0,1),columnNames(tablename,1,1)], dtype=str)
		npam = np.delete(npam, columns, axis = 1)
		out = []
		for n in range(2):
			for i in range(len(npam[0,:])):
				if i == 0:
					aux = npam[n,i]
				else:
					aux += ',' + npam[n,i]
			out += [aux]
		#----------------------------------------------like upload2DB fx
		sql = "insert into "+tablename+"("+out[0]+") values("+out[1]+")"
		if not(isinstance(data,list)):
			data = data.tolist()
		for line in data:
			try:
				msql = sql % tuple(line)
			except:
				msql = sql % line
			try:
				cursor.execute(msql)
			except:
				dbcon.rollback()
		dbcon.commit()
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"
	    
#-----------------------------------------------------------------------
def readfromDB (tablename, select='*', query=''):
	"""
	Reads data form DB. If you don't specify select or 
	query it willuse the defaults.
	--------------------------------------------------------
	Syntax:
		readfromDB (tablename, select='*', query='')
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- select: all the fields * or one in specific.
		- query: conditions of the read.
	--------------------------------------------------------	
	Example:
		readfromDB ('testtbl', select='*', query='limit 0,1')
		
		This function returns the first row (limit) but all
		the fields.
		
	"""
	if checkTableExists(tablename): #---------------------
		sql = "select "+select+" from %s "+query+""
		cursor.execute(sql % tablename)
		out = cursor.fetchall()
		return out
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"
        
#-----------------------------------------------------------------------
def updateDB (tablename, option = ''):
	"""
	Change data in the table tablename. 
	--------------------------------------------------------
	Syntax:
		updateDB (tablename, option = '')
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- option: the info you want to change.
	--------------------------------------------------------	
	Example:
		Supose that testtbl has 3 columns: Id (int), name 
		(varchar) and age (int):
		
		updateDB ('testtbl', option = 'set AGE = 1 where Id = 3')
		
		It will change all the age fields for the rows that 
		have Id=3.
		
	"""
	if checkTableExists(tablename): #---------------------
		try:
			sql = 'update %s '+option
			cursor.execute(sql % tablename)
			dbcon.commit()
		except:
			print "*** ERROR: The table can not be updated, please check the options ***"
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"
        
#-----------------------------------------------------------------------
def deleteDB (tablename, option = ''):
	"""
	Delete data in the table tablename.
	--------------------------------------------------------
	Syntax:
		deleteDB (tablename, option = '')
	--------------------------------------------------------
	Parameters:
		- tablename: is the name of the table.
		- option: the conditions to delete.
	--------------------------------------------------------	
	Example:
		Supose that testtbl has 3 columns: Id (int), name 
		(varchar) and age (int):
		
		deleteDB ('testtbl', option = 'age = 3 and name = 'Ana'')
		
		It will delete all the rows that have age = 3 and
		name = 'Ana'.
		
	"""
	if checkTableExists(tablename): #---------------------
		try:
			sql = 'delete from %s where'+option
			cursor.execute(sql % tablename)
			dbcon.commit()
		except:
			print "*** ERROR: The table can not be updated, please check the options ***"
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"
        
