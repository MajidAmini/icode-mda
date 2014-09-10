#!/usr/bin/python2.7

#-*- coding: utf-8 -*-
import sys, time, random
reload(sys)
sys.setdefaultencoding('utf-8')

sys.path.append('../../DB_common/')
import GetInfo
import ICODE_DB
import ICODE_RP as RP
#import ICODE_repo as IR

if __name__ == "__main__":

    f= open("ships_mmsi.txt", 'r')
    Nf= open("out.txt", 'w')
    IB = ICODE_DB.ICODE_DB()
    IB.dbConnection('127.0.0.1', 'root', 'icoderoot', 'ICODE')
    IB.createTable('vesselsBG', """(MMSI int primary key, Flag varchar (25), AISType varchar (20), IMO int, CallSign varchar (10), GrossTonnage int, DeadWeight int, Length double, Breadth double, YearBuilt int, Status varchar (25), InfoReceived int, Area varchar (25), Latitude double, Longitude double, StatusLPR varchar (30), Speed double, Course double, AISSource varchar (40), Destination varchar (30),ETA int, LastKnownPort varchar (30), LastKnownPortdate int, PreviousPort varchar (30), PreviousPortdate int, Draught double, SpeedRecordedMax double, SpeedRecordedAverage double, InfoReceivedVRI int)""")
    IB.createTable('PortCallsBG',
                    """(id SERIAL NOT NULL AUTO_INCREMENT primary key, MMSI int, Port varchar (25), Arrival int, Departure int)""")

    Obj=GetInfo.GetInfo()
    
    j=0
    k=0

    for line in f:
        k+= 1
        print("Iteracion #"+str(k))
        sql='WHERE MMSI= '+str(line)
        if IB.readfromDB('vesselsBG', '*', sql)== []:
            sleep_time= random.randint(1, 3)
            print("Sleeping for "+str(sleep_time)+" seconds")
            time.sleep(sleep_time)

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
                        if str(metadata[l].text) == 'Deadweight: ' and aux==7:
                            if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
                                toDb.append(-1)
                            else:
                                temp1=str(datos[l].text).split(' t')
                                temp2=temp1[0]
                                toDb.append(int(temp2))
                            aux=8
                        if str(metadata[l].text).split(' ')[0] == 'Length' and aux==8:
                            if str(datos[l].text) == '-' or str(datos[l].text) == '' or str(datos[l].text) == '-------' or str(datos[l].text) == '?' or str(datos[l].text) == 'N/A':
                                toDb.append(-1)
                                toDb.append(-1)
                            else:
                                if len(str(datos[l].text).split('m \xc3')) >1:
                                    temp1= str(datos[l].text).split('m \xc3')
                                    temp2= temp1[1].split(' ')
                                    toDb.append(float(temp1[0]))
                                    toDb.append(float(temp2[1].split('m')[0]))
                                else:
                                    temp1= str(datos[l].text).split('m \xc4')
                                    temp2= temp1[1].split(' ')
                                    toDb.append(float(temp1[0]))
                                    toDb.append(float(temp2[1].split('m')[0]))

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
                                    toDb.append(-1)
                                else:
                                    if str(datosLPR[h+1].text)[4] == '-':
                                        toDb.append(RP.time2unix(str(datosLPR[h+1].text), '%Y-%m-%d %H:%M'))
                                    else:                                        
                                        temp1= str(datosLPR[h+1].text).split(' ago (')
                                        temp2= temp1[1].split(')')
                                        toDb.append(RP.time2unix(temp2[0], '%Y-%m-%d %H:%M'))
                                aux=11
                            if i==1 and aux==-1:
                                toDb.append(-1)
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
                                    if len(str(datosLPR[h+1].text).split('\xec\xa7\xb8 / '))>1:
                                        temp1=str(datosLPR[h+1].text).split('\xec\xa7\xb8 / ')
                                        temp2= temp1[1].split('\xec\xa7\xb8')
                                        toDb.append(float(temp1[0]))
                                        toDb.append(float(temp2[0]))
                                    else:
                                        temp1=str(datosLPR[h+1].text).split('\xc2\xb0 / ')
                                        temp2= temp1[1].split('\xc2\xb0')
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
                                    if temp1[0] == '-'or temp2[0]=='':
                                        toDb.append(-1)
                                    else:
                                        toDb.append(float(temp1[0]))
                                    if temp2[0] == '-' or temp2[0]=='':
                                        print temp1[0]
                                        toDb.append(-1)
                                    else:
                                        print temp2[0]
                                        toDb.append(float(temp2[0].split('\xc2')[0]))
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
                        if i==0 or i==2 or i==3 or i==5 or i==6:
                            toDb.append(-1)
                        else:
                            toDb.append('None')
                    aux=16

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
                                    extraDb.append(-1)
                                else:
                                    temp1= str(datosRPC[h+1].text).split(' UTC')
                                    extraDb.append(RP.time2unix(temp1[0], '%Y-%m-%d %H:%M'))

                                aux=21
                            if i==2 and aux==20:
                                extraDb.append(-1)
                                aux=21

                            if str(datosRPC[h].text) =='Last Known Port' and aux==21:
                                if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
                                    extraDb.append('None')
                                    extraDb.append(-1)
                                else:
                                    temp1= str(datosRPC[h+1].text).split('\xc2\xa0')
                                    temp2= temp1[1].split(') (')
                                    extraDb.append(temp1[0])                                    
                                    extraDb.append(RP.time2unix(temp2[1].split(')')[0], '%Y-%m-%d %H:%M:%S'))
                                aux=22
                            if i==3 and aux==21:
                                extraDb.append('None')
                                extraDb.append(-1)
                                aux=22

                            if str(datosRPC[h].text) =='Previous Port' and aux==22:
                                if str(datosRPC[h+1].text) == '-' or str(datosRPC[h+1].text) == '' or str(datosRPC[h+1].text) == '-------' or str(datosRPC[h+1].text) == '?' or str(datosRPC[h+1].text) == 'N/A':
                                    extraDb.append('None')
                                    extraDb.append(-1)

                                else:
                                    temp1= str(datosRPC[h+1].text).split('\xc2\xa0')
                                    temp2= temp1[1].split(') (')
                                    extraDb.append(temp1[0])                                    
                                    extraDb.append(RP.time2unix(temp2[1].split(')')[0], '%Y-%m-%d %H:%M:%S'))
                                aux=23
                            if i==4 and aux==22:
                                extraDb.append('None')
                                extraDb.append(-1)
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
                                    extraDb.append(-1)
                                else:
                                    temp1=str(datosRPC[h+1].text).split(' (')
                                    extraDb.append(RP.time2unix(temp1[0], '%Y-%m-%d %H:%M'))
                                aux=26
                            h+=1
                        i+=1
                    if i==7 and aux==25:
                        extraDb.append(-1)
                        aux=26
                    print "=========== toDb =========== \n" + str(toDb)
                    print "=========== extraDb ======== \n" + str(extraDb)
                    
                    IB.uploadToDB('vesselsBG', [toDb+extraDb])
                else:
                    print "=========== toDb =========== \n" + str(toDb)
                    print "=========== extraDb ======== \n" + str(extraDb)

                    IB.uploadToDB('vesselsBG',
                    [toDb+['None', -1, 'None', -1, 'None', -1, -1, -1, -1, -1]])
            
                datosRPC= DataRecentPortCall.body.find_all("span")
                dataRPCtoDb=[]
                if len(datosRPC)!=0:
                    print "=========== RPCtoDb ==========="
                    for m in range(4, len(datosRPC)):
                        if (m+4)%7 == 0:
                            dataRPCtoDb=[]
                            if str(datosRPC[m-6].text) =='':
                                dataRPCtoDb.append('None')
                            else:
                                dataRPCtoDb.append(str(datosRPC[m-6].text))
                            if str(datosRPC[m-3].text) =='':
                                dataRPCtoDb.append(-1)
                            else:
                                dataRPCtoDb.append(RP.time2unix(str(datosRPC[m-3].text), '%Y-%m-%d %H:%M:%S'))
                            if str(datosRPC[m-1].text) =='':
                                dataRPCtoDb.append(-1)
                            else:
                                dataRPCtoDb.append(RP.time2unix(str(datosRPC[m-1].text), '%Y-%m-%d %H:%M:%S'))
                            temp1= [ toDb[0], dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2] ]
                            print temp1
                            IB.ai(toDb[0], dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2])
                        m+=1
            else:
                Nf.write(line)
    f.close()
    IB.dbDisconnect()
    Nf.close()
