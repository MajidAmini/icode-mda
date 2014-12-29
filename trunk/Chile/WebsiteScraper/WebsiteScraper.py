#!/usr/bin/python2.7

"""

@file WebsiteScraper.py
@date Dic 2014

Futuros trabajos: - Agregar parseo a vesseltracker:
                    https://www.vesseltracker.com/es/Home.html

"""

#-*- coding: utf-8 -*-
import sys, time, random, getopt
reload(sys)
sys.setdefaultencoding('utf-8')

sys.path.append('../DB_common/')
import GetInfo
import ICODE_DB
import ICODE_RP

def basicData(datos, metadata, toDb):
    """Extrae desde 'datos' y guarda ordenadamente, usando metadata, en 'toDb'.
    
    Corresponde a la data basica que se encuentra al inicio en marinetraffic.
    
    Devuelve una tupla de 'toDb' y 'aux' como resultado de obtener en forma
    ordenada la extraccion desde 'datos'.
    
    El acceso a los datos se basa en la estructura de los objetos del modulo
    BeautifulSoup.
    
    Parametros:
    datos    -- data recibida del proceso de parsear el html
    metadata -- contiene los nombres de los tipos de 'datos', ej: 'MMSI: '
    toDb     -- aqui se van guardando los datos en forma ordenada y limpia.
     
    """
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
    return toDb, aux

def mediumData(datosLPR, metaDb, toDb, aux):
    """Extrae desde 'datosLPR' y guarda en 'toDb', considera no existencia.
    
    Corresponde a la data de 'Last Position Received' en marinetraffic.
    
    Devuelve una tupla de 'toDb' y 'aux' como resultado de obtener en forma
    ordenada la extraccion desde 'datosLPR'.
    
    El acceso a los datos se basa en la estructura de los objetos del modulo
    BeautifulSoup.
    
    Parametros:
    datosLPR -- data recibida del proceso de parsear el html
    metaDb   -- contiene los nombres de los tipos de 'datos', ej: 'Area: '
                usada para analizar como parsear
    toDb     -- aqui se van guardando los datos en forma ordenada y limpia.
    aux      -- variable auxiliar usada para garantizar que los datos se van
                guardando en forma ordenada
     
    """
    metaDb= mediumMetaData(datosLPR, metaDb)

    if len(datosLPR)!=0:
        toDb, aux= mediumParseData(datosLPR, toDb, aux)
    else:
        for i in range(8):
            if i==0 or i==2 or i==3 or i==5 or i==6:
                toDb.append(-1)
            else:
                toDb.append('None')
        aux=16
    return toDb, aux

def mediumMetaData(datosLPR, metaDb):
    """Guarda en forma ordenada desde 'datosLPR' a 'metaDb'.
    
    Funcion usada para analizar el parseo del programa actual.
    
    Parametros:
    datosLPR -- data recibida del proceso de parsear el html
    metaDb   -- contiene los nombres de los tipos de 'datos', ej: 'Area: '
                usada para analizar como parsear
    
    """
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
    return metaDb

def mediumParseData(datosLPR, toDb, aux):

    """Extrae desde 'datosLPR' en forma limpia y ordenada retornando toDb.

    Llamada por la funcion mediumData.
        
    Devuelve una tupla de 'toDb' y 'aux' como resultado de obtener en forma
    ordenada la extraccion desde 'datosLPR'.
    
    El acceso a los datos se basa en la estructura de los objetos del modulo
    BeautifulSoup.
    
    Parametros:
    datosLPR -- data recibida del proceso de parsear el html
    toDb     -- aqui se van guardando los datos en forma ordenada y limpia.
    aux      -- variable auxiliar usada para garantizar que los datos se van
                guardando en forma ordenada    
    
    """
    RP= ICODE_RP.ICODE_RP()
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
    return toDb, aux

def lastData(datosRPC, extrametaDb, extraDb, aux):
    """Extrae desde 'datosRPC' y guarda ordenadamente, en 'extraDb'.
    
    Corresponde a la data de 'Recent Port Calls' en marinetraffic.
    
    Devuelve una tupla de 'extraDb' y 'aux' como resultado de obtener en forma
    ordenada la extraccion desde 'datosRPC'.
    
    El acceso a los datos se basa en la estructura de los objetos del modulo
    BeautifulSoup.
    
    Parametros:
    datosRPC    -- data recibida del proceso de parsear el html
    extrametaDb -- contiene los nombres de los tipos de 'datos', ej: 'ETA'
                   usada para analizar como parsear
    extraDb     -- aqui se van guardando los datos en forma ordenada y limpia.
    aux         -- variable auxiliar usada para garantizar que los datos se van
                   guardando en forma ordenada
     
    """

    RP= ICODE_RP.ICODE_RP()
    extrametaDb= lastMetaData(extrametaDb, datosRPC)
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
                    temp2= temp1[1].split('] (')
                    extraDb.append(temp1[0])
                    print temp1[0]+ "\n"+str(temp2[1])+"\n"   
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
                    temp2= temp1[1].split('] (')
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
    return extraDb, aux
    
def lastMetaData(extrametaDb, datosRPC):
    """Guarda en forma ordenada desde 'datosRPC' a 'extrametaDb'.
    
    Funcion usada para analizar el parseo del programa actual.
    
    Parametros:
    datosRPC    -- data recibida del proceso de parsear el html
    extrametaDb -- contiene los nombres de los tipos de 'datos', ej: 'ETA'
                   usada para analizar como parsear
    
    """

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
    return extrametaDb    

def annexedData(mmsi, datosRPC, dataRPCtoDb, IB):
    """Guarda directamente en la database la extraccion desde datosRPC.
    
    Guarda en la tabla de datos anexa la informacion relativa a todos los
    puertos recorridos, asocia a un barco mediante MMSI diferentes puertos.
    
    Por cada vuelta en el 'for' guarda un puerto diferente.
    
    Parametros:
    datosRPC    -- fuente de datos con los puertos asociados a un barco
    dataRPCtoDb -- variable que guarda los datos en forma ordenada
    IB          -- Base de datos en la cual se guarda 'dataRPCtoDb'
    mmsi        -- corresonde al mmsi del barco actual
    
    """
    RP= ICODE_RP.ICODE_RP()
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
            temp1= [ mmsi, dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2] ]
            print temp1
            IB.ai( mmsi, dataRPCtoDb[0], dataRPCtoDb[1], dataRPCtoDb[2])
        m+=1

class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg

def main(argv = None):
    """Website Scraper para marinetraffic que guarda en una base de datos.
    
    A partir de un archivo de texto o una base de datos, toma el numero 
    correspondiente al MMSI de un AIS para conectarse via http con la pagina
    web www.marinetraffic.com. Descarga el html completo y lo parsea para
    obtener toda la informacion relevante al barco, como sus datos basicos,
    ultima posicion recibida, informacion de rutas relacionadas y puertos 
    anteriores en los que haya estado.
    
    La descarga del html y el objeto para parsear de tipo 'BeautifulSoup' son
    obtenidos a partir de GetInfo.py.
    
    El manejo de las bases de datos es a partir de ICODE_DB.
    
    Utilidades, como transformar el formato hora comun a hora unix es a partir
    de ICODE_RP.
    
    Los barcos no encontrados en marinetraffic son guardados en out.txt.
    
    Parametros:
    sys.argv[1] -- Archivo del cual se extraeran los valores mmsi
    sys.argv[2] -- Nombre de la tabla de datos que se creara con los datos de
                   marinetraffic y nombre base de la tabla de datos anexa con
                   los puertos en que ha estado un barco ej:
                   test -- nombre de tabla principal con los datos
                   PortCallstest -- nombre de la tabla de datos anexa
    sys.argv[3] -- Toma los valores 0 o 1. Con '0' toma los datos desde un
                   archivo de texto.  Con '1' toma los datos desde una base de
                   datos.
    
    """
    if argv is None:
        argv = sys.argv
    try:
        try:
            opts, args = getopt.getopt(argv[1:], "h", ["help"])
        except getopt.error, msg:
            raise Usage(msg)
    #   Conexion con la base de datos y creacion de las tablas.
#        if args[1] == '--help':
#            help(main)
#            return 0
        IB = ICODE_DB.ICODE_DB()
        IB.dbConnection('127.0.0.1', 'root', 'icoderoot', 'ICODE')
        IB.createTable(args[1], """(MMSI int primary key, Flag varchar (25), AISType varchar (20), IMO int, CallSign varchar (10), GrossTonnage int, DeadWeight int, Length double, Breadth double, YearBuilt int, Status varchar (25), InfoReceived int, Area varchar (25), Latitude double, Longitude double, StatusLPR varchar (30), Speed double, Course double, AISSource varchar (40), Destination varchar (30),ETA int, LastKnownPort varchar (30), LastKnownPortdate int, PreviousPort varchar (30), PreviousPortdate int, Draught double, SpeedRecordedMax double, SpeedRecordedAverage double, InfoReceivedVRI int)""")
        IB.createTable('PortCalls'+args[1],
                        """(id SERIAL NOT NULL AUTO_INCREMENT primary key, MMSI int, Port varchar (25), Arrival int, Departure int)""")

    #   Crea archivo para datos fuera de www.marinetraffic.com durante ejecucion.
        Nf= open("out.txt", 'w')

    #   Crea e inicializa el objeto GetInfo.
        Obj=GetInfo.GetInfo()

        if int(args[2]) == 0:
        
    #       Lee desde el archivo entregado
            f= open(args[0], 'r')
            
    #       Variable que lleva el registro del numero actual de iteracion.    
            k=0
            for line in f:

    #           Herramienta para debuggear saber en cual barco se encuentra de la lista.
                k+= 1
                print("Iteracion #"+str(k))

    #           Comprobar que el MMSI no se encuentra guardado ya en la base de datos.        
                sql='WHERE MMSI= '+str(line)
                if IB.readfromDB(args[1], '*', sql)== []:

    #               Calcula, imprime y duerme por una cantidad random de segundos.
                    sleep_time= random.randint(1, 3)
                    print("Sleeping for "+str(sleep_time)+" seconds")
                    time.sleep(sleep_time)

    #               Descarga el html desde www.marinetraffic.com
                    Source= Obj.OpenUrl(line)
                    if Source != None:

    #                   Herramienta para debuggear.
                        mmsi= int(line)
                        print ("MMSI: "+ str(mmsi))

    #                   Setea con la informacion del parseo las variables.
                        DataBasic= Obj.ReadInfo(Source, 1)
                        DataLastPositionRecibe= Obj.ReadInfo(Source, 2)
                        DataVoyageRelatedInfo= Obj.ReadInfo(Source, 3)
                        DataRecentPortCall= Obj.ReadInfo(Source, 4)

    #                   Extrae datos basicos de un barco en marinetraffic.
                        datos= DataBasic.body.find_all("b")
                        metadata= DataBasic.body.find_all("span")
                        toDb= []
                        toDb, aux = basicData(datos, metadata, toDb)
                        
    #                   Extrae datos desde Last Position Received en marinetraffic. 
                        datosLPR= DataLastPositionRecibe.body.find_all("span")
                        metaDb= []
                        toDb, aux = mediumData(datosLPR, metaDb, toDb, aux)

    #                   Extrae datos desde Voyage Related Info en marinetraffic.
                        datosRPC= DataVoyageRelatedInfo.body.find_all("td")
                        extrametaDb=[]
                        extraDb=[]
                        
    #                   Guarda en la base de datos la informacion obtenida. 
                        if (len(datosRPC)!= 0):
                            extraDb, aux= lastData(datosRPC, extrametaDb, extraDb, aux)
                            print "=========== toDb =========== \n" + str(toDb)
                            print "=========== extraDb ======== \n" + str(extraDb)
                            
                            IB.uploadToDB(args[1], [toDb+extraDb])
                        else:
                            print "=========== toDb =========== \n" + str(toDb)
                            print "=========== extraDb ======== \n" + str(extraDb)

                            IB.uploadToDB(args[1],
                            [toDb+['None', -1, 'None', -1, 'None', -1, -1, -1, -1, -1]])
                        
    #                   Extrae y guarda en la base de datos desde marinetraffic
    #                   la informacion contenida en Recent Port Call.                 
                        datosRPC= DataRecentPortCall.body.find_all("span")
                        dataRPCtoDb=[]
                        if len(datosRPC)!=0:
                            print "=========== RPCtoDb ==========="
                            annexedData( toDb[0], datosRPC, dataRPCtoDb, IB)
                    else:
    #                   Si el barco no fue encontrado se guarda su mmsi.            
                        Nf.write(line)
            f.close()
        elif int(args[2]) == 1:
        
            IB.readfromDB(args[0],,)
    #	    QuerySelect= query_sql.query_sql()
    #	    Array_MMSI=  QuerySelect.SelectMMSI()    

    #	    for cell in Array_MMSI:
    #		    temp=   str(cell)
    #		    mmsi=   temp[1:10]
    #		    Source= Obj.OpenUrl(mmsi)
    #		    if Source != None:
    #            # aqui procedimiento para rellenar        
        else:
            print "Valor de parametro no valido."
        IB.dbDisconnect()
        Nf.close()
        return 1
    except Usage, e:
        print >>sys.stderr, err.msg
        print >>sys.stderr, "for help use --help"
        return 2
    except IndexError, err:
        print "argv[]: " + str(err)
        print >>sys.stderr, "Redireccionando al archivo de ayuda. . ."
        time.sleep(3)
        help(main)
        return 3
        
if __name__ == "__main__":
    sys.exit(main())

