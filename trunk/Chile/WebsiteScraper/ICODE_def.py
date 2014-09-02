#-----------------------------------------------------------------------------------
field_type = {
	 0: '%f',				#DECIMAL
	 1: '%d',				#TINY
	 2: '%d',				#SHORT				
	 3: '%d',				#LONG
	 4: '%f',				#FLOAT
	 5: '%f',				#DOUBLE
	 6: 'NULL',				#NULL
	 7: 'TIMESTAMP',			#TIMESTAMP
	 8: '%d',				#LONGLONG
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

#-----------------------------------------------------------------------------------
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
#-----------------------------------------------------------------------------------
init_vhtable = {
	0:	"vessel_history",
	1:	"""CREATE TABLE vessel_history (MMSI int(11) NOT NULL DEFAULT '0',TimeOfFix int(11) NOT NULL DEFAULT '0',Latitude double NOT NULL,Longitude double NOT NULL,SOG double DEFAULT NULL,Heading double DEFAULT NULL,RxStnID varchar(32) DEFAULT NULL,PRIMARY KEY (MMSI,TimeOfFix),KEY lat_lon (Latitude,Longitude),KEY MMSI (MMSI),KEY RxStnID_2 (RxStnID),KEY TimeOfFix (TimeOfFix)) ENGINE=MyISAM DEFAULT CHARSET=latin1"""
}
#-----------------------------------------------------------------------------------


