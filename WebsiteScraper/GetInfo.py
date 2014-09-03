#!/usr/bin/python2.7

#-*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import urllib2

class GetInfo:
    def __init__(self):
        return

    # Abrir el codigo fuente de la pagina y retornarlo
    def OpenUrl(self, MMSI): 
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

