# Introduction #

A Web Map Service (WMS) is a standard protocol for serving georeferenced map images over the Internet that are generated by a map server using data from a GIS database. Adding WMS server layers to OMAR is simple.


# Details #

## List of Free WMS servers you can use ##
  * http://hyperquad.ucsd.edu/cgi-bin/onearth?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
  * http://128.102.22.115/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
  * http://ogc.bgs.ac.uk/fcgi-bin/exemplars/BGS_Bedrock_and_Superficial_Geology/wms?SERVICE=WMS&REQUEST=GetCapabilities

## Add WMS to OMAR ##
> To add WMS to OMAR, edit the $OMAR\_HOME/grails-app/conf/Config.groovy file. Find the layers portion and edit it to this:
```
    layers = [
            [
                    url: "http://hyperquad.ucsd.edu/cgi-bin/i-cubed",
                    params: [layers: "icubed", format: "image/png", transparent: true, bgcolor: '#99B3CC'],
                    name: "I-Cubed LandSat",
                    options: defaultOptions
            ],
            [
                    url: "http://hyperquad.ucsd.edu/cgi-bin/onearth",
                    params: [layers: "OnEarth", format: "image/png", transparent: true, bgcolor: '#99B3CC'],
                    name: "OnEarth LandSat",
                    options: defaultOptions
            ],
            [
                    url: (useTileCache) ? "http://${serverAddress}/tilecache/tilecache.py" : "http://${serverAddress}/cgi-bin/mapserv${wms.mapServExt}?map=${mapFile}",
                    params: [layers: (useTileCache) ? "omar" : "Reference", format: "image/jpeg"],
                    name: "Reference Data",
                    options: defaultOptions
            ],
            
            [
                  url: "http://vmap0.tiles.osgeo.org/wms/vmap0",
                  params: [layers: "basic", format: "image/png", transparent: true],
                  name: "VMAP",
                  options: defaultOptions
            ]

	]
```