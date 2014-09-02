#!/usr/bin/python2.7

#-*- coding: utf-8 -*-
import sys, time
reload(sys)
sys.setdefaultencoding('utf-8')

import GetInfo
import ICODE_DB as IB

if __name__ == "__main__":

	f= open("barcos_test.txt", 'r')
	Nf= open("vessels_out_marinetraffic.txt", 'w')
	IB.dbConnection('127.0.0.1', 'antonio', 'icodeantonio', 'ICODE')
	IB.createTable('vessels_from_marinetraffic', """CREATE TABLE vessels_from_marinetraffic (MMSI int primary key, Flag varchar (25), AISType varchar (20), IMO int, CallSign varchar (10), GrossTonnage int, DeadWeight int, Length double, Breadth double, YearBuilt int, Status varchar (25), InfoReceived varchar (20), Area varchar (25), Latitude double, Longitude double, StatusLPR varchar (30), Speed double, Course double, AISSource varchar (40), Destination varchar (30),ETA varchar (25), LastKnownPort varchar (30), LastKnownPortdate varchar(25), PreviousPort varchar (30), PreviousPortdate varchar (25),Draught double, SpeedRecordedMax double, SpeedRecordedAverage double, InfoReceivedVRI varchar (20));""")
	IB.createTable('vessels_RecentPortCalls_from_marinetraffic',
					"""CREATE TABLE vessels_RecentPortCalls_from_marinetraffic (id BIGINT NOT NULL AUTO_INCREMENT, MMSI int, Port varchar (25), Arrival varchar (25), Departure varchar (25), primary key(id));""")

	Obj=GetInfo.GetInfo()
	
	j=0
	k=0

	for line in f:
		k+= 1
		print("Iteracion #"+str(k))
		sql='WHERE MMSI= '+str(line)
#or QueryInsertVessel.searchTable('-'+str(line)+'00')
#		if QueryInsertVessel.searchTable(str(line)):
#		print IB.readfromDB('vessels_from_marinetraffic', '*', sql) 
		if IB.readfromDB('vessels_from_marinetraffic', '*', sql)== []:
			j+= 1
			L=  10-j
			print("Durmiendo en "+str(L)+" segundos...")
			if j == 10:
				j=0
				print "Durmiendo por 20 segundos..."
				time.sleep(20)

			Source= Obj.OpenUrl(line)
			if Source != None:
				mmsi= int(line)
				print ("MMSI: "+ str(mmsi))

				DataBasic= Obj.ReadInfo(Source, 1)
				DataLastPositionRecibe= Obj.ReadInfo(Source, 2)
				DataVoyageRelatedInfo= Obj.ReadInfo(Source, 3)
				DataRecentPortCall= Obj.ReadInfo(Source, 4)
			
				datos= DataBasic.body.find_all("b")
				metadata= DataBasic.body.find_all("span")
			
				toDb=[]
				aux=1
				for i in range(len(datos)):
					for l in range(len(metadata)):
						if str(metadata[l].text) == 'MMSI: ' and aux==1:
							toDb.append(int(datos[l].text))
							aux=2
						if i==1 and aux==1:
							toDb.append(int('-'+str(datos[l].text)+'00'))
							aux=2

						if str(metadata[l].text) == 'Flag: ' and aux==2:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append('None')
							else:
								toDb.append(str(datos[l].text))
							aux=3
						if str(metadata[l].text) == 'AIS Type: ' and aux==3:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append('None')
							else:
								toDb.append(str(datos[l].text))
							aux=4
						if str(metadata[l].text) == 'IMO: ' and aux==4:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append(-1)
							else:
								toDb.append(int(datos[l].text))
							aux=5
						if str(metadata[l].text) == 'Call Sign: ' and aux==5:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append('None')
							else:
								toDb.append(str(datos[l].text))
							aux=6
						if str(metadata[l].text) == 'Gross Tonnage: ' and aux==6:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append(-1)
							else:
								toDb.append(int(datos[l].text))
							aux=7
						if str(metadata[l].text) == 'DeadWeight: ' and aux==7:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append(-1)
							else:
								toDb.append(int(datos[l].text))
							aux=8
						if str(metadata[l].text) == 'Length x Breadth: ' and aux==8:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append(-1)
								toDb.append(-1)
							else:
								temp1= str(datos[l].text).split('m \xc4\x82\xc2\x97 ')
								temp2= temp1[1].split('m')
								toDb.append(float(temp1[0]))
								toDb.append(float(temp2[0]))
							aux=9
						if str(metadata[l].text) == 'Year Built: ' and aux==9:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append(-1)
							else:
								toDb.append(int(datos[l].text))
							aux=10
						if str(metadata[l].text) == 'Status: ' and aux==10:
							if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
								toDb.append('None')
							else:
								toDb.append(str(datos[l].text))
							aux=-1
						l+=1
					i+=1

				datosLPR= DataLastPositionRecibe.body.find_all("span")
				metaDb=[]
				for i in range(len(datosLPR)):
					if str(datosLPR[i].text) =='Info Received: ':
						metaDb.append(str(datosLPR[i].text))
					if str(datosLPR[i].text) =='Area: ':
						metaDb.append(str(datosLPR[i].text))
					if str(datosLPR[i].text) =='Latitude / Longitude: ':
						metaDb.append(str(datosLPR[i].text))
					if str(datosLPR[i].text) =='Status:':
						metaDb.append(str(datosLPR[i].text))
					if str(datosLPR[i].text) =='Speed/Course: ':
						metaDb.append(str(datosLPR[i].text))
					if str(datosLPR[i].text) =='AIS Source: ':
						metaDb.append(str(datosLPR[i].text))
					i+=1

				if len(datosLPR)!=0:
					for i in range(6):
						for h in range(len(datosLPR)):
							if str(datosLPR[h].text) =='Info Received: ' and aux==-1:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append('None')
								else:
									if str(datosLPR[h+1].text)[4] == '-':
										toDb.append(str(datosLPR[h+1].text))
									else:										
										temp1= str(datosLPR[h+1].text).split(' min ago (')
										temp2= temp1[1].split(')')
										toDb.append(temp2[0])
								aux=11
							if i==1 and aux==-1:
								toDb.append('None')
								aux=11

							if str(datosLPR[h].text) =='Area: ' and aux==11:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append('None')
								else:
									toDb.append(str(datosLPR[h+1].text))
								aux=12
							if i==2 and aux==11:
								toDb.append('None')
								aux=12

							if str(datosLPR[h].text) =='Latitude / Longitude: ' and aux==12:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append(-1)
									toDb.append(-1)
								else:
									temp1= str(datosLPR[h+1].text).split('\xec\xa7\xb8 / ')
									temp2= temp1[1].split('\xec\xa7\xb8')
									toDb.append(float(temp1[0]))
									toDb.append(float(temp2[0]))
								aux=13
							if i==3 and aux==12:
								toDb.append(-1)
								toDb.append(-1)
								aux=13

							if str(datosLPR[h].text) =='Status:' and aux==13:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append('None')
								else:
									toDb.append(str(datosLPR[h+1].text))
								aux=14
							if i==4 and aux==13:
								toDb.append('None')
								aux=14

							if str(datosLPR[h].text) =='Speed/Course: ' and aux==14:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append(-1)
									toDb.append(-1)
								else:
									temp1= str(datosLPR[h+1].text).split('kn / ')
									temp2= temp1[1].split('\xec\xa7\xb8')
									if temp1[0] == '-':
										toDb.append(-1)
									else:
										toDb.append(float(temp1[0]))
									if temp2[0] == '-':
										toDb.append(-1)
									else:
										toDb.append(float(temp2[0]))
								aux=15
							if i==5 and aux==14:
								toDb.append(-1)
								toDb.append(-1)
								aux=15

							if str(datosLPR[h].text) =='AIS Source: ' and aux==15:
								if str(datosLPR[h+1].text) == '-' or str(datosLPR[h+1].text) == '' or str(datosLPR[h+1].text) == '-------' or str(datosLPR[h+1].text) == '?' or str(datosLPR[h+1].text) == 'N/A':
									toDb.append('None')
								else:
									toDb.append(str(datosLPR[h+1].text))
								aux=16
							h+=1
						i+=1
					if i==6 and aux==15:
						toDb.append('None')
						aux=16
				else:
					for i in range(8):
						if i==2 or i==3 or i==4 or i==5:
							toDb.append(-1)
						else:
							toDb.append('None')
					aux=16
				print str(toDb)

				datosRPC= DataVoyageRelatedInfo.body.find_all("td")
				extrametaDb=[]
				extraDb=[]
				if (len(datosRPC)!= 0):
					for i in range(len(datosRPC)):
						if str(datosRPC[i].text) =='Destination':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='ETA':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='Last Known Port':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='Previous Port':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='Draught':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='Speed recorded (Max / Average)':
							extrametaDb.append(str(datosRPC[i].text))
						if str(datosRPC[i].text) =='Info Received':
							extrametaDb.append(str(datosRPC[i].text))
					
					for i in range(7):
						for h in range(len(datosRPC)):
							if str(datosRPC[h].text) =='Destination' and aux==16:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append('None')
								else:
									if str(datosRPC[h+1].text[0]) =='\n':
										temp1= str(datosRPC[h+1].text).split('\n')
										temp2= temp1[1].split('\xc2\xa0')
										extraDb.append(temp2[0])
									else:
										extraDb.append(str(datosRPC[h+1].text))
								aux=20
							if i==1 and aux==16:
								extraDb.append('None')
								aux=20
							
							if str(datosRPC[h].text) =='ETA' and aux==20:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append('None')
								else:
									extraDb.append(str(datosRPC[h+1].text))
								aux=21
							if i==2 and aux==20:
								extraDb.append('None')
								aux=21

							if str(datosRPC[h].text) =='Last Known Port' and aux==21:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append('None')
									extraDb.append('None')
								else:
									temp1= str(datosRPC[h+1].text).split(' (')
									temp2= temp1[1].split(')')
									extraDb.append(temp1[0])									
									extraDb.append(temp2[0])
								aux=22
							if i==3 and aux==21:
								extraDb.append('None')
								extraDb.append('None')
								aux=22

							if str(datosRPC[h].text) =='Previous Port' and aux==22:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append('None')
									extraDb.append('None')

								else:
									temp1= str(datosRPC[h+1].text).split(' (')
									temp2= temp1[1].split(')')
									extraDb.append(temp1[0])									
									extraDb.append(temp2[0])
								aux=23
							if i==4 and aux==22:
								extraDb.append('None')
								extraDb.append('None')
								aux=23

							if str(datosRPC[h].text) =='Draught' and aux==23:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append(-1)
								else:
									temp1= str(datosRPC[h+1].text).split('m')
									extraDb.append(float(temp1[0]))
								aux=24
							if i==5 and aux==23:
								extraDb.append(-1)
								aux=24

							if str(datosRPC[h].text) =='Speed recorded (Max / Average)' and aux==24:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append(-1)
									extraDb.append(-1)
								else:
									temp1= str(datosRPC[h+1].text).split(' / ')
									temp2= temp1[1].split(' knots')
									extraDb.append(float(temp1[0]))
									extraDb.append(float(temp2[0]))
								aux=25
							if i==6 and aux==24:
								extraDb.append(-1)
								extraDb.append(-1)
								aux=25

							if str(datosRPC[h].text) =='Info Received' and aux==25:
								if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
									extraDb.append('None')
								else:
									extraDb.append(str(datosRPC[h+1].text))
								aux=26
							h+=1
						i+=1
					if i==7 and aux==25:
						extraDb.append('None')
						aux=26
					print str(extraDb)
					IB.uploadtoDB('vessels_from_marinetraffic', [toDb+extraDb])
#					QueryInsertVessel.InsertTable(toDb[0], toDb[1], toDb[2], toDb[3], toDb[4], toDb[5], toDb[6], toDb[7], toDb[8],
#					toDb[9], toDb[10], toDb[11], toDb[12], toDb[13], toDb[14], toDb[15], toDb[16], toDb[17], toDb[18], extraDb[0],
#					extraDb[1], extraDb[2], extraDb[3], extraDb[4], extraDb[5], extraDb[6], extraDb[7], extraDb[8], extraDb[9])
				elif len(datosLPR)!=0:
					IB.uploadtoDB('vessels_from_marinetraffic',
					[toDb+['None', 'None',
					'None', 'None', 'None', 'None', -1, -1, -1, 'None']])
#					QueryInsertVessel.InsertTable(toDb[0], toDb[1], toDb[2], toDb[3], toDb[4], toDb[5], toDb[6], toDb[7], toDb[8],
#					toDb[9], toDb[10], toDb[11], toDb[12], toDb[13], toDb[14], toDb[15], toDb[16], toDb[17], toDb[18], 'None', 'None',
#					'None', 'None', 'None', 'None', -1, -1, -1, 'None')
				else:
					IB.uploadtoDB('vessels_from_marinetraffic',
					[toDb+['None',
					'None', -1, -1, 'None', -1, -1, 'None', 'None', 'None', 'None', 'None',
					'None', 'None', -1, -1, -1, 'None']])
#					QueryInsertVessel.InsertTable(toDb[0], toDb[1], toDb[2], toDb[3], toDb[4], toDb[5], toDb[6], toDb[7], toDb[8],
#					toDb[9], toDb[10], 'None', 'None', -1, -1, 'None', -1, -1, 'None', 'None', 'None', 'None', 'None',
#					'None', 'None', -1, -1, -1, 'None')
			
				datosRPC= DataRecentPortCall.body.find_all("span")
				dataRPCtoDb=[]
				if len(datosRPC)!=0:
					for m in range(4, len(datosRPC)):
						if (m+4)%7 == 0:
							dataRPCtoDb=[]
							if str(datosRPC[m-6].text) =='':
								dataRPCtoDb.append('None')
							else:
								dataRPCtoDb.append(str(datosRPC[m-6].text))
							if str(datosRPC[m-3].text) =='':
								dataRPCtoDb.append('None')
							else:
								dataRPCtoDb.append(str(datosRPC[m-3].text))
							if str(datosRPC[m-1].text) =='':
								dataRPCtoDb.append('None')
							else:
								dataRPCtoDb.append(str(datosRPC[m-1].text))
							IB.uploadtoDB('vessels_RecentPortCalls_from_marinetraffic', [ "default", toDb[0], dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2] ])
#							QueryInsertRPC.InsertTableRecentPortCall(toDb[0], dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2])
						m+=1
			else:
				Nf.write(line)
	f.close()
#	IB.dbDisconnect()
	Nf.close()
