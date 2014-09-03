#!/usr/bin/python2.7

#-*- coding: utf-8 -*-
import psycopg2

class QuerySql:

### Conexion con el servidor ###
	def __init__(self):
		self.conn = psycopg2.connect("dbname=gisdata user=antonio")
		self.cur = self.conn.cursor()
		return


### Selecciona desde otra Base de datos el MMSI ###	
	def SelectMMSI(self):
		self.cur.execute("SELECT mmsi FROM current_vessels_20130801;")
		self.x=[]
		for record in self.cur:
			self.x.append(record)
		return self.x

### Guarda las Recent Port Call asociando el MMSI de un barco con los puertos de arribo o partida ###	
	def CreateTableRPC(self):
		self.cur.execute("""CREATE TABLE data_vessels_RecentPortCalls_from_marinetraffic_fixed (id serial primary key,
															MMSI integer,
															Port varchar,
															Arrival varchar,
															Departure varchar
															)""")
		self.conn.commit()
		return
	
	def InsertTableRecentPortCall(self, MMSI, Port, Arrival, Departure):
		self.cur.execute("""INSERT INTO data_vessels_RecentPortCalls_from_marinetraffic_fixed (mmsi, port, arrival, departure)
							VALUES (%s, %s, %s, %s)""", (MMSI, Port, Arrival, Departure)
						)
		self.conn.commit()
		return

### Guarda toda la informacion relativa al barco que se pueda sacar de MarineTraffic usando el MMSI como clave primaria ###	
	def CreateTableMMSI(self):
		self.cur.execute("""CREATE TABLE data_vessels_from_marinetraffic_fixed (MMSI integer primary key,
																Flag varchar,
																AISType varchar,
																IMO varchar,
																CallSign varchar,
																GrossTonnage varchar,
																DeadWeight varchar,
																Length varchar,
																Breadth varchar,
																YearBuilt varchar,
																Status varchar,
																InfoReceived varchar,
																Area varchar,
																Latitude varchar,
																Longitude varchar,
																StatusLPR varchar,
																Speed varchar,
																Course varchar,
																AISSource varchar,
																Destination varchar,
																ETA varchar,
																LastKnownPort varchar,
																LastKnownPortdate varchar,
																PreviousPort varchar,
																PreviousPortdate varchar,
																Draught varchar,
																SpeedRecordedMax varchar,
																SpeedRecordedAverage varchar,
																InfoReceivedVRI varchar);""")
		self.conn.commit()
		return
		
	def searchTable(self, MMSI):
		self.cur.execute("SELECT mmsi FROM data_vessels_from_marinetraffic_fixed WHERE mmsi=(%s);", (MMSI,))
		self.x=[]
		for record in self.cur:
			self.x.append(record)
		print str(self.x)
		if str(self.x) == str([]):
			return True
		else:
			return False

	def InsertTable(self, MMSI, Flag, AISType, IMO, CallSign, GrossTonnage, DeadWeight, Length, Breadth, YearBuilt, Status, InfoReceived,
					Area, Latitude, Longitude, StatusLPR, Speed, Course, AISSource, Destination, ETA, LastKnownPort, LastKnownPortdate,
					PreviousPort, PreviousPortdate, Draught, SpeedRecordedMax, SpeedRecordedAverage, InfoReceivedVRI):
		
		self.cur.execute("""INSERT INTO data_vessels_from_marinetraffic_fixed (MMSI, Flag, AISType, IMO, CallSign, GrossTonnage,
					DeadWeight, Length, Breadth, YearBuilt, Status, InfoReceived, Area, Latitude, Longitude, StatusLPR, Speed, Course,
					AISSource, Destination, ETA, LastKnownPort, LastKnownPortdate, PreviousPort, PreviousPortdate, Draught,
					SpeedRecordedMax, SpeedRecordedAverage, InfoReceivedVRI) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
					%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
					(MMSI, Flag, AISType, IMO, CallSign, GrossTonnage, DeadWeight, Length, Breadth, YearBuilt, Status, InfoReceived,
					Area, Latitude, Longitude, StatusLPR, Speed, Course, AISSource, Destination, ETA, LastKnownPort, LastKnownPortdate,
					PreviousPort, PreviousPortdate, Draught, SpeedRecordedMax, SpeedRecordedAverage, InfoReceivedVRI)
						)
		self.conn.commit()
		return


### Cierra el trabajo con la base de datos ###	
	def close(self):
		self.conn.commit()
		self.cur.close()
		self.conn.close()
		return
