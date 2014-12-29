#!/usr/bin/python2.7

#-*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import urllib2

class GetInfo:
    """Clase encargada de descargar y parsear vía http una página web.
    
    Esta Clase es llamada por main.py (o WebsiteScrapper.py) para descargar el
    contenido web y entregar las secciones con datos, además del tipo de Objeto
    BeautifulSoup para continuar con un parseo más fino.
    
    Métodos:
    init     -- Inicializa vacío el objeto.
    
    OpenUrl  -- Descarga el html completo correspondiente al MMSI entregado, 
                desde marinetraffic.    
    
    ReadInfo -- Parsea en forma parcial en html descargado, entregando sólo las 
                secciones que contienen información.    
    
    """
    def __init__(self):
    """Constructor de GetInfo.
    
    """
        return

    def OpenUrl(self, MMSI):
    """Abre el código fuente de la página y lo retorna.
    
    Se conecta a una dirección estática de marinetraffic en la que se encuentran
    todos los barcos, a esta dirección se le concatena el número mmsi, de esta
    forma se llega directo a los datos del barco dentro de marinetraffic.
    
    Una ves descargada se guarda en source y se decodifica al formato utf8.
    
    Parámetros:
    self -- Parámetro por defecto, corresponde al objeto que convoca
    MMSI -- Número identificador del barco
    
    Excepciones:
    URLError -- En caso de no conexión, por no respuesta o dirección no 
                existente.
    
    """
        self.req = urllib2.Request('http://www.marinetraffic.com/en/ais/details/ships/' + MMSI, headers={'User-Agent' : "Magic Browser"}) 
        try:
            self.con = urllib2.urlopen(self.req)
            self.source = self.con.read()
            self.source = self.source.decode('utf8')
            self.con.close()
            
        except urllib2.URLError, e:
            print e.reason
            return None
        else:
            return self.source
            
    def ReadInfo(self, source, table):
    """A partir de un código fuente html parsea por secciones de datos.
    
    Usa BeautifulSoup para parsear el html descargado en secciones de datos, son
    4 secciones en total.
    
    La sección con los datos básicos.
    La sección con los datos de Last Position Received en marinetraffic.
    La sección con los datos de Voyage Related Info en marinetraffic.
    La sección con los datos de Recent Port Call en marinetraffic.
    
    Retorna data_ el cual contiene una de las secciones de acuerdo al parámetro
    table.
    
    Parámetros:
    self   -- Parámetro por defecto, corresponde al objeto que convoca
    source -- Código fuente html del cual se extraerán los datos
    table  -- Parámetro que indica cual de las secciones de datos se extraerán:
              1 -- Datos básicos
              2 -- Last Position Received
              3 -- Voyage Related Info
              4 -- Recent Port Call
            
    """
		self.parsed_html = BeautifulSoup(source)

		if table==1:
			self.data_= BeautifulSoup(str(self.parsed_html.body.find_all("div", attrs={'class':'col-xs-6'})))
		if table==2:
			self.data_= BeautifulSoup(str(self.parsed_html.body.find_all("div", attrs={'class':'group-ib'})))
		if table==3:
			self.data_= BeautifulSoup(str(self.parsed_html.body.find_all(attrs={'class':'table table-striped table-condensed voyage-related'})))
		if table==4:
			self.data_= BeautifulSoup(str(self.parsed_html.body.find_all(attrs={'class':'table table-striped table-condensed'})))
		return self.data_

