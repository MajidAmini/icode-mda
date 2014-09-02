###############################################################Libraries
import numpy as np
import MySQLdb as msq
import ICODE_def as Id
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


##########################################################MAIN FUNCTIONS
def dbConnection (host, user, password, dbname):
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
    dbcon.close()
    del dbcon, cursor
        
#-----------------------------------------------------------------------
def checkTableExists (tablename):
    try:
        cursor.execute("select * from %s limit 0,1" % tablename)
        return True
    except:
        return False
    
#-----------------------------------------------------------------------
def createTable (tablename, sql): 
    if(not(checkTableExists(tablename))):
        cursor.execute(sql)
    else:
        print "*** ERROR: Already a DB with that name. ***"
        
#-----------------------------------------------------------------------
def columnNames (tablename, col, sta):
    if checkTableExists(tablename): #---------------------
        cursor.execute("select * from %s limit 0,1" % tablename)
        aux = np.array(cursor.description, dtype = str)
        if sta:
            if col:
                out = [Id.field_type[int(i[col])] for i in cursor.description]
                print "sta col"
            else:
                out = [i[col] for i in cursor.description] 
                print "sta else"
        else:
            out = ''
            print "not sta"
            aux = np.array(cursor.description, dtype = str)
            for i in range(len(aux)):
                x = aux[i,col]
                if col:
					x = Id.field_type[int(aux[i,col])]
					print x
					print "no sta col"
                if i < (len(aux[:,1]) - 1):
                    out += x + ', '
                    print out
                    print "no sta than"
                else:
                    out += x
                    print "no sta else"
        return out
    else: #-----------------------------------------------
        print "*** ERROR: The DB doesn't exists. ***" 
        
#-----------------------------------------------------------------------
def uploadtoDB (tablename, data):
	if checkTableExists(tablename): #---------------------
		sql = "insert into "+tablename+"("+columnNames(tablename, 0, 0)+") values("+columnNames(tablename, 1, 0)+")"
		if not(isinstance(data,list)):
			data = data.tolist()
		for line in data:
			try:
				msql = sql % tuple(line)
				print msql
			except:
				msql = sql % line
			try:
				cursor.execute(msql)
			except:
				print "error"
				raise
				dbcon.rollback()
		dbcon.commit()
	else: #-----------------------------------------------
		print "*** ERROR: The DB doesn't exists. ***"
        
#-----------------------------------------------------------------------
def readfromDB (tablename, select='*', query=''):
    if checkTableExists(tablename): #---------------------
        out = []
        sql = "select "+select+" from %s "+query+""
        cursor.execute(sql % tablename)
        for row in cursor.fetchall():
            a = [row[i] for i in range(len(columnNames(tablename,1,1)))]
            out.append(a)
        return out
    else: #-----------------------------------------------
        print "*** ERROR: The DB doesn't exists. ***"
#-----------------------------------------------------------------------
def updateDB (tablename, option = ''):
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
    if checkTableExists(tablename): #---------------------
        try:
            sql = 'delete from %s '+option
            cursor.execute(sql % tablename)
            dbcon.commit()
        except:
            print "*** ERROR: The table can not be updated, please check the options ***"
    else: #-----------------------------------------------
        print "*** ERROR: The DB doesn't exists. ***"
        
