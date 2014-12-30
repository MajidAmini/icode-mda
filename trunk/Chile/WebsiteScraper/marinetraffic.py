#!/usr/bin/python2.7

"""

@file marinetraffic.py
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
import WebsiteScraper
import ICODE_DB
import ICODE_RP

class Usage(Exception):
    def __init__(self, msg):
        self.msg = msg

def main(argv = None):
    """Un Website Scraper para marinetraffic que guarda en una base de datos.
    
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
    
    Excepciones:
    IndexError  -- Si no fueron entregados los 3 argumentos para que el
                   programa funcione.
        
    """
    if argv is None:
        argv = sys.argv
    try:
        try:
            opts, args = getopt.getopt(argv[1:], "h", ["help"])
        except getopt.error, msg:
            raise Usage(msg)
        IB = ICODE_DB.ICODE_DB()
        IB.dbConnection('127.0.0.1', 'root', 'icoderoot', 'ICODE')
        IB.createTable(args[1], """(MMSI int primary key, Flag varchar (25), AISType varchar (20), IMO int, CallSign varchar (10), GrossTonnage int, DeadWeight int, Length double, Breadth double, YearBuilt int, Status varchar (25), InfoReceived int, Area varchar (25), Latitude double, Longitude double, StatusLPR varchar (30), Speed double, Course double, AISSource varchar (40), Destination varchar (30),ETA int, LastKnownPort varchar (30), LastKnownPortdate int, PreviousPort varchar (30), PreviousPortdate int, Draught double, SpeedRecordedMax double, SpeedRecordedAverage double, InfoReceivedVRI int)""")
        IB.createTable(args[1]+'PortCalls',
                        """(id SERIAL NOT NULL AUTO_INCREMENT primary key, MMSI int, Port varchar (25), Arrival int, Departure int)""")

        Obj=GetInfo.GetInfo()
    #   Crea archivo para datos fuera de www.marinetraffic.com durante ejecucion.
        Nf= open("outMarineTraffic.txt", 'w')
    #   Variable que lleva el registro del numero actual de iteracion.    
        k=0
        if int(args[2]) == 0:        
            f= open(args[0], 'r')
            for line in f:
                k += 1
                print("Iteracion #"+str(k))
                WebsiteScraper.WebsiteScraper(line, IB, args, Obj, Nf)
            f.close()
        elif int(args[2]) == 1:        
            Array_mmsi = IB.readfromDB(args[0], 'MMSI')
            for cell in Array_mmsi:
                temp = str(cell)
                mmsi = temp[1:10]
                k += 1
                print("Iteracion #"+str(k))
                WebsiteScraper.WebsiteScraper(mmsi, IB, args, Obj, Nf)
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

