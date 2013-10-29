/**
 * @name ICODE-MDA Maps
 * @author Sparta Cheung, Bryan Bagnall, Lynne Tablewski
 * @fileoverview
 * Uses the Google Maps API to display AIS points at their reported locations
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
var map;
var markerArray;
var markersDisplayed = [];
var markersQueried = [];
//var trackArray;
var tracksDisplayedMMSI = [];    //keep track of which MMSI's track is already displayed
var tracksDisplayed = [];
var mainQuery;

//Viewing bounds objects
var queryBounds;
var expandFactor = 0.05;
var boundRectangle = null;
//Marker timing objects
var markerMouseoutTimeout;
var trackMouseoverTimeout;
//Cluster objects
var CLUSTER = true;  //toggle this for CLUSTERing
var markerClusterer;
var mcOptions = {
               gridSize: 60, 
               minimumClusterSize: 50, 
               averageCenter: false
            };
//Track line options
var tracklineIconsOptions = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FFFFFF',
               fillColor:     '#FFFFFF',
               fillOpacity:   1
            };
var tracklineIconsOptionsQ = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#FFFF00',
               fillColor:     '#FFFF00',
               fillOpacity:   1
            };
var tracklineIconsOptionsT = {
               path:          'M -3,0 0,-3 3,0 0,3 z',
               strokeColor:   '#00FF00',
               fillColor:     '#00FF00',
               fillOpacity:   1
            };
var tracklineIconsOptionsL = {
               path:          'M -5,0 0,-5 5,0 0,5 z',
               strokeColor:   '#FF0000',
               fillColor:     '#FF0000',
               fillOpacity:   1
            };
/*
var tracklineOptions = {
               strokeColor:   '#00FF25',
               strokeOpacity: 0.7,
               strokeWeight:  3,
            };
*/
//Weather layer objects
var weatherLayer;
var cloudLayer;
//Heatmap objects
var HEATMAP = true;
var heatmapLayer;
//Other WMS layers
var WMSTILESIZE = 512;
var openlayersWMS;
var wmsOpenLayersOptions = {
      alt: "OpenLayers",
      getTileUrl: WMSOpenLayersGetTileUrl,
      isPng: false,
      maxZoom: 17,
      minZoom: 1,
      name: "OpenLayers",
      tileSize: new google.maps.Size(WMSTILESIZE, WMSTILESIZE)
   };
//Shape drawing objects
var selectedShape;
//KML objects
var KML = false;
var kmlparser;
var kmlparsers = [];
var tempKMLcount = 0;
//Port objects
var Ports = false;
var portIcons = [];
var portCircles = [];
//Sources objects
//var sourcesInt=3;
var sourcesDate="_20130801";
//Distance measurement
var latLng;
var prevlatLng;
var distIcon;
var prevdistIcon;
var distPath;
var distIconsOptions = {
               path:          'M -4,0 0,-4 4,0 0,4 z',
               strokeColor:   '#04B4AE',
               fillColor:     '#04B4AE',
               fillOpacity:   1
            };
var highlightCircle = new google.maps.Circle({
            center:  new google.maps.LatLng(0,0),
            radius: 2000,
            strokeColor: "#FFFF00",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FFFF00",
            fillOpacity: 0.2,
            map: null
         });

/* -------------------------------------------------------------------------------- */
/** Initialize, called on main page load
*/
function initialize() {
   //Set up map properties
   //var centerCoord = new google.maps.LatLng(0,0);
   //var centerCoord = new google.maps.LatLng(32.72,-117.2319);   //Point Loma
   var centerCoord = new google.maps.LatLng(6.0,1.30);   //Lome, Togo
   //var centerCoord = new google.maps.LatLng(-33.0, -71.6);   //Valparaiso, Chile

   //Detect iPhone or Android devices and set map to 100%
   var controlStyle;
   var defaultZoom;
   if (detectMobileBrowser()) {
      controlStyle = google.maps.MapTypeControlStyle.DROPDOWN_MENU;
      defaultZoom = 8;
   }
   else {
      controlStyle = google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
      defaultZoom = 11;
   }
      
   var mapOptions = {
      zoom:              defaultZoom,
      center:            centerCoord,
      scaleControl:      true,
      streetViewControl: false,
      overviewMapControl:true,
      //keyboardShortcuts: false,
      mapTypeId:         google.maps.MapTypeId.HYBRID,
      mapTypeControlOptions: {
         mapTypeIds: [google.maps.MapTypeId.ROADMAP, 
                         google.maps.MapTypeId.SATELLITE, 
                         google.maps.MapTypeId.HYBRID, 
                         google.maps.MapTypeId.TERRAIN,
                         'OpenLayers'
                         ],
				style: controlStyle
			}
	};

	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

   //Set default map layer
   map.setMapTypeId(google.maps.MapTypeId.HYBRID);

   //Clear marker array
   markerArray = [];
   //trackIcons = [];

   //Add drawing toolbar
   addDrawingManager();

   //Map dragged then idle listener
   google.maps.event.addListener(map, 'idle', function() {
      google.maps.event.trigger(map, 'resize'); 
      var idleTimeout = window.setTimeout(
         function() {
            //Check if URL has query
            var queryArgument = Request.QueryString("query").toString();
            //console.log(queryArgument);

            if (queryArgument != null) {
               mainQuery = queryArgument;
               getCurrentAISFromDB(map.getBounds(), queryArgument, null);
            }
            else {
               //Update vessels displayed
               getCurrentAISFromDB(map.getBounds(), null, null);
            }

            //Update ports displayed
            if (Ports) {
               hidePorts();
               showPorts();
            }
         }, 
         2000);   //milliseconds to pause after bounds change

      google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
         window.clearTimeout(idleTimeout);
      });
   });

   //Latlog indicator for current mouse position
   google.maps.event.addListener(map,'mousemove',function(event) {
      document.getElementById('latlong').innerHTML = 
            Math.round(event.latLng.lat()*10000000)/10000000 + ', ' + Math.round(event.latLng.lng()*10000000)/10000000
   });

   //Distance tool
//   enableDistanceTool();

   //TODO: TEST WMS layers
   addWmsLayers();
   //TEST

   //Check for TMACS layer toggle on load
   toggleTMACSHeadWMSLayer();
   toggleTMACSHistoryWMSLayer();

   //Cluster overlay layer
   if (CLUSTER) {
   	markerClusterer = new MarkerClusterer(map, [], mcOptions);
   }
   toggleClusterLayer();

   //Radar layer
   toggleRadarLayer();

   //KML overlay layer
   toggleKMLLayer();

   //Check for port layers
   togglePortLayer();

   //Weather
   toggleWeatherLayer();

   //Heatmap layer
   toggleHeatmapLayer();
}

/* -------------------------------------------------------------------------------- */
function detectMobileBrowser() {
   var check = false;

   (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
   
   return check; 
}


/* -------------------------------------------------------------------------------- */
/** 
 * Get AIS data from XML, which is from database, with bounds.
 *
 * Optional callback argument (4th argument)
 */
function getCurrentAISFromDB(bounds, customQuery, forceUpdate, callback) {
   //Set buffer around map bounds to expand queried area slightly outside viewable area
   var latLonBuffer = expandFactor * map.getZoom();
   prevZoom = map.getZoom();

   var ne = bounds.getNorthEast();
   var sw = bounds.getSouthWest();

   var viewMinLat = sw.lat();
   var viewMaxLat = ne.lat();
   var viewMinLon = sw.lng();
   var viewMaxLon = ne.lng();

   var minLat = viewMinLat - latLonBuffer;
   var maxLat = viewMaxLat + latLonBuffer;
   var minLon = viewMinLon - latLonBuffer;
   var maxLon = viewMaxLon + latLonBuffer;

   //Set up queryBounds, which is extended initial or changed view bounds
   if (queryBounds == null) {
      //Initialize queryBounds if first time running
      queryBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(minLat, minLon), 
            new google.maps.LatLng(maxLat, maxLon));
      //Draw bounds rectangle to let user know they are zooming outside of the bounds
      if (boundRectangle != null) {
         boundRectangle.setMap(null);
      }
      boundRectangle = new google.maps.Rectangle({
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: '#FF0000',
          fillOpacity: 0,
          map: map,
          bounds: queryBounds,
          clickable: false,
      });
   }
   else {
      //Handle the case when no URL query, but moved within bounds
      if (customQuery == null && !forceUpdate && queryBounds.contains(ne) && queryBounds.contains(sw)) {
         //TODO: update result count to match what is actually within current view

         console.log('Moved to within query bounds, not requerying. (without custom query)');
         return;
      }
      //Handle the case when URL query exists, but moved within bounds
      else if (customQuery != null && !forceUpdate && queryBounds.contains(ne) && queryBounds.contains(sw)) {
         console.log('Moved to within query bounds, not requerying. (with custom query)');
         return;
      }
      //Handle the case when moved outside of bounds
      else {
         queryBounds = new google.maps.LatLngBounds(
               new google.maps.LatLng(minLat, minLon), 
               new google.maps.LatLng(maxLat, maxLon));
         //Draw bounds rectangle to let user know they are zooming outside of the bounds
         if (boundRectangle != null) {
            boundRectangle.setMap(null);
         }
         boundRectangle = new google.maps.Rectangle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#FF0000',
            fillOpacity: 0,
            map: map,
            bounds: queryBounds,
          clickable: false,
         });
      }
   }

   console.log("Refreshing target points...");
   document.getElementById("query").value = "QUERY RUNNING...";
   document.getElementById('stats_nav').innerHTML = '';
   document.getElementById('busy_indicator').style.visibility = 'visible';

   //var infoWindow = new google.maps.InfoWindow();
   var infoBubble = new google.maps.InfoWindow({ 
      disableAutoPan: true
   });
   /*
   var infoBubble = new InfoBubble({
       disableAnimation: true,
       disableAutoPan: true,
       arrowStyle:     2,
       padding:        '5px',
       borderRadius:   8,
       maxWidth:       800,
       maxHeight:      800,
   });
   */

   var phpWithArg;
   var sources = "sources=" + sourcesDate;//sourcesInt; //0-all, 1-aisonly, 2-radaronly, etc
   var boundStr = "&minlat=" + Math.round(minLat*1000)/1000 + "&maxlat=" + Math.round(maxLat*1000)/1000 + "&minlon=" + Math.round(minLon*1000)/1000 + "&maxlon=" + Math.round(maxLon*1000)/1000;

   if (!customQuery) {
      //Check if a query has been previously made, and use it to preserve previous query but just change the bounds to current view now
      if (mainQuery != null) {
         phpWithArg = "query_current_vessels.php?query=" + mainQuery + boundStr;
      }
      else {
         //No custom query, do default query
         //phpWithArg = "query_current_vessels.php?" + sources + boundStr;
         phpWithArg = "query_current_vessels.php?" + sources + boundStr;
      }
   }
   else {
      //TODO: need a more robust condition for keyword search
      if (customQuery.length < 20) {
         //customQuery is really a keyword search
         phpWithArg = "query_current_vessels.php?" + sources + boundStr + "&keyword=" + customQuery;
      }
      //TODO for handling case when trying to display specific vessels or LAISIC outputs
      /*
      else if ( ... ) {
      }
      */
      else {
         //Custom SQL query statement
         //phpWithArg = "query_current_vessels.php?query=" + customQuery;
         phpWithArg = "query_current_vessels.php?query=" + customQuery + boundStr;
      }
   }

   //Debug query output
   console.log('getCurrentAISFromDB(): ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         console.log('getCurrentAISFromDB(): ' + response.query);
         //Show the query and put it in the form
         document.getElementById("query").value = response.query;

         //Vessel list window
         document.getElementById('vessellist').innerHTML = 
                                 '<h3>Current Vessels List:</h3><br>' + 
                                 '<b>MMSI - Vesselname</b><br><hr>';

         //if (!customQuery) {
            mainQuery = response.basequery;
         //}

         //Delete previous markers
         if (boundStr != null) {
            console.log('Clearing previous markers and tracks');
            clearMarkerArray();
            clearOutBoundMarkers();
            clearAllTracks();
         }

         markersDisplayed = [];
         markersQueried = [];

//         document.getElementById('selectable').innerHTML = "";

         //Prepare to grab PHP results as JSON objects
         $.each(response.vessels, function(key,vessel) {
               var messagetype = vessel.messagetype;
               var mmsi = vessel.mmsi;
               var navstatus = vessel.navstatus;
               var rot = vessel.rot;
               var sog = vessel.sog;
               var lon = vessel.lon;
               var lat = vessel.lat;
               var point = new google.maps.LatLng(
                     parseFloat(vessel.lat),
                     parseFloat(vessel.lon));
               var cog = vessel.cog;
               var true_heading = vessel.true_heading;
               var datetime = vessel.datetime;
               var imo = vessel.imo;
               var vesselname = vessel.vesselname;
               var vesseltypeint = vessel.vesseltypeint;
               var length = vessel.length;
               var shipwidth = vessel.shipwidth;
               var bow = vessel.bow;
               var stern = vessel.stern;
               var port = vessel.port;
               var starboard = vessel.starboard;
               var draught = vessel.draught;
               var destination = vessel.destination;
               var callsign = vessel.callsign;
               var posaccuracy = vessel.posaccuracy;
               var eta = vessel.eta;
               var posfixtype = vessel.posfixtype;
               var streamid = vessel.streamid;
               var safety_rating = vessel.safety_rating;
               var security_rating = vessel.security_rating;
               var risk_score_safety = vessel.risk_score_safety;
               var risk_score_security = vessel.risk_score_security;
               if (imo != null) {
                  imgURL = 'http://photos2.marinetraffic.com/ais/showphoto.aspx?mmsi=' + mmsi + '&imo=' + imo;
               }
               else {
                  imgURL = 'http://photos2.marinetraffic.com/ais/showphoto.aspx?mmsi=' + mmsi;
               }

               var title;
               if (vesselname != null && vesselname != '') {
                  title = vesselname;
               }
               else {
                  if (streamid == 'shore-radar' || (streamid == 'r166710001' && vesseltypeint != 999)) {
                     title = 'Radar Track ID: ' + mmsi;
                  }
                  else if (vesseltypeint == 999) {
                     title = 'LAISIC Fusion: ' + mmsi;
                  }
                  else {
                     title = 'MMSI or RADAR ID: ' + mmsi;
                  }
               }

               var htmlTitle = 
                  '<div id="content">'+
//                  '<div id="siteNotice">'+
//                  '</div>'+
                  '<h2 id="firstHeading" class="firstHeading">' + title + '</h1>' +
                  '<div id="bodyContent">';
               var htmlLeft = 
                  '<div id="content-left">' +
                  '<a href="https://marinetraffic.com/ais/shipdetails.aspx?MMSI=' + mmsi + '"  target="_blank"> '+
                  '<img width=180px src="' + imgURL + '">' + 
                  '</a><br>' + 
                     '<div id="content-sub" border=1>' +
                     '<b>MMSI</b>: ' + mmsi + '<br>' +
                     '<b>IMO</b>: ' + imo + '<br>' +
                     '<b>Vessel Type</b>: ' + vesseltypeint + '<br>' +
                     '<b>Last Message Type</b>: ' + messagetype + '<br>' +
                     '</div>' +
                     '<div>' + 
                     '<a id="showtracklink" link="" href="javascript:void(0);" onClick="getTrack(\'' + mmsi + '\', \'' + vesseltypeint + '\', \'' + streamid + '\', \'' + datetime + '\');">Show vessel track history</a>' +
                     '</div>' +
                  '</div>';
               var htmlRight = 
                  '<div id="content-right">' +
                     '<div id="content-sub" border=1>' +
                        //'<b>Report Date</b>: ' + datetime + '<br>' +
                        '<b>Report Date</b>: <br>' + toHumanTime(datetime) + '<br>' +
                        '<b>Lat</b>: ' + lat + '<br>' +
                        '<b>Lon</b>: ' + lon + '<br>' +
                        '<b>Navigation Status</b>: ' + navstatus + '<br>' +
                        '<b>Speed Over Ground</b>: ' + sog + '<br>' + 
                        '<b>Course Over Ground</b>: ' + cog + '<br>' + 
                        '<b>Length x Width</b>: ' + length + ' x ' + shipwidth + '<br>'+
                        '<b>Draught</b>: ' + draught  + '<br>'+
                        '<b>Destination</b>: ' + destination + '<br>'+
                        '<b>ETA</b>: ' + eta + '<br>'+
                        '<b>Source</b>: ' + streamid + '<br>'+
	                '<b>Risk Security</b>: ' + risk_score_security + '<br>'+	
	                '<b>Risk Safety</b>: ' + risk_score_safety + '<br>'+	
                     '</div>' +
                  '</div>'+

                  '</div>'+
                  '</div>';

               var html = htmlTitle + htmlLeft + htmlRight;

               var iconColor = getIconColor(vesseltypeint, streamid);
               

               //Ship shape
               var vw = 5; //vesselwidth
               var vl = 10; //vesselwidth
               var markerpath = 'M 0,'+vl+' '+vw+','+vl+' '+vw+',-3 0,-'+vl+' -'+vw+',-3 -'+vw+','+vl+' z';
               //Indented arrow
               //var markerpath = 'M 0,5 4,8 0,-8 -4,8 z';
               //Arrow
               //var markerpath = 'M 0,8 4,8 0,-8 -4,8 z';
               
               //Slightly different style for vessels with valid risk score
               if (risk_score_safety != null || risk_score_security != null) {
                  var riskColorSafety = getRiskColor(vesseltypeint, streamid, safety_rating);
                  var riskColorSecurity = getRiskColor(vesseltypeint, streamid, security_rating);
                  var marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         markerpath, //'M 0,8 4,8 4,-3 0,-8 -4,-3 -4,8 z', //middle rear
                        //strokeColor:  iconColor,
                        strokeColor:  riskColorSafety,
                        strokeWeight: 3,
                        fillColor:    iconColor,
                        fillOpacity:  0.6,
                        rotation:     true_heading
                     }
                  });
               }
               else {   //regular style for vessels with no risk info
                  var marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         markerpath, //'M 0,8 4,8 4,-3 0,-8 -4,-3 -4,8 z', //middle rear
                        strokeColor:  iconColor,
                        //strokeColor:  riskColor,
                        strokeWeight: 0,
                        fillColor:    iconColor,
                        fillOpacity:  0.8,
                        rotation:     true_heading
                     }
                  });
               }               

               //Try new marker shape for LAISIC (type 999) contacts
               if (vesseltypeint == 999) {
                  marker = new google.maps.Marker({
                     position: point,
                     icon: {
                        path:         'm -6 0 6 -6 6 6 -6 6 z m 12 0 l 8 0',
                        strokeColor:  iconColor,
                        strokeWeight: 2,
                        fillColor:    iconColor,
                        fillOpacity:  0.6,
                        rotation:     true_heading-90 //-90 degrees to account for SVG drawing rotation
                     }
                  });
               }

               //Create infoBubble for marker
               markerInfoBubble(marker, infoBubble, html, mmsi, vesselname, vesseltypeint, streamid, datetime);
               markerArray.push(marker);

               markersDisplayed.push({
                  mmsi: mmsi, 
                  vesseltypeint: vesseltypeint,
                  streamid: streamid,
                  datetime: datetime,
                  lat: lat,
                  lon: lon
               });

               markersQueried.push({
                  mmsi: mmsi, 
                  vesseltypeint: vesseltypeint,
                  streamid: streamid,
                  datetime: datetime,
                  lat: lat,
                  lon: lon
               });

               //Display current vessel list to vessellist div window
               if (vesselname == '') {
                  document.getElementById('vessellist').innerHTML += '<a onmouseover="highlightMMSI(' + mmsi + ')" onmouseout="hideHighlightMMSI()" href="#">' + mmsi + ' - (no vessel name)</a ><hr>';
               }
               else {
                  document.getElementById('vessellist').innerHTML += '<a onmouseover="highlightMMSI(' + mmsi + ')" onmouseout="hideHighlightMMSI()" href="#">' + mmsi + ' - ' + vesselname + '</a ><hr>';
               }

               //Display current vessel to selectable results list
//               document.getElementById('selectable').innerHTML += '<li class="ui-widget-content">' + mmsi + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + imo + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + vesselname + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + vesseltypeint + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + datetime + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + lat + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + lon + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + sog + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + cog + '</li>';
               //document.getElementById('selectable').innerHTML += '<li class="ui-widget-content"><table><col class="width20" /><col class="width20" /><col class="width40" /><col class="width20" /><td>' + mmsi + '</td><td>' + imo + '</td><td>' + vesselname + '</td><td>' + vesseltypeint + '</td></table></li>';
               /*
               var messagetype = vessel.messagetype;
               var navstatus = vessel.navstatus;
               var rot = vessel.rot;
               var sog = vessel.sog;
               var lon = vessel.lon;
               var lat = vessel.lat;
               var point = new google.maps.LatLng(
                     parseFloat(vessel.lat),
                     parseFloat(vessel.lon));
               var cog = vessel.cog;
               var true_heading = vessel.true_heading;
               var datetime = vessel.datetime;
               var vesselname = vessel.vesselname;
               var vesseltypeint = vessel.vesseltypeint;
               var length = vessel.length;
               var shipwidth = vessel.shipwidth;
               var bow = vessel.bow;
               var stern = vessel.stern;
               var port = vessel.port;
               var starboard = vessel.starboard;
               var draught = vessel.draught;
               var destination = vessel.destination;
               var callsign = vessel.callsign;
               var posaccuracy = vessel.posaccuracy;
               var eta = vessel.eta;
               var posfixtype = vessel.posfixtype;
               var streamid = vessel.streamid;
               */
         });

         //Display the appropriate layer according to the sidebar checkboxes
         if (CLUSTER) {
            if (document.getElementById("HeatmapLayer").checked) {
               addHeatmap();
            }
            else {
               markerClusterer.addMarkers(markerArray);
            }
            console.log('getCurrentAISFromDB(): ' + "Number of markers = " + markerClusterer.getTotalMarkers());
            console.log('getCurrentAISFromDB(): ' + "Number of clusters = " + markerClusterer.getTotalClusters());
         }
         else {
            if (document.getElementById("HeatmapLayer").checked) {
               addHeatmap();
            }
            else {
               showOverlays();   //Display the markers individually
            }
         }

         //Check if user wants to display all tracks (from URL request)
         // Need to be careful if user has "queryTracks=all" in the URL request, then starts clicking around on LAISIC outputs, etc.  All tracks will be queried unintentionally.
         var trackDisplayArgument = Request.QueryString("queryTracks").toString();
         if (trackDisplayArgument == 'all') {
            queryAllTracks();
            document.getElementById("queryalltracks").checked = true;
         }


         console.log('getCurrentAISFromDB(): ' + "Total number of markers = " + markerArray.length);


         //Intended for optional callback argument (to call queryAllTracks() after displaying markers)
         if (callback && typeof(callback) === "function") {
            callback();
         }

         document.getElementById('busy_indicator').style.visibility = 'hidden';
         document.getElementById('stats_nav').innerHTML = 
            response.resultcount + " results<br>" + 
            Math.round(response.exectime*1000)/1000 + " secs";         
      }) //end .done()
      .fail(function() { 
         console.log('getCurrentAISFromDB(): ' +  'No response from track query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
      }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to attach information associated with marker, or call track 
 * fetcher to get track line
 */
function markerInfoBubble(marker, infoBubble, html, mmsi, vesselname, vesseltypeint, streamid, datetime) {
   //Listener for click on marker to display infoBubble
	google.maps.event.addListener(marker, 'click', function () {
      infoBubble.setContent(html);
      infoBubble.open(map, marker);

      /*
      google.maps.event.addListener(marker, 'mouseover', function() {
         window.clearTimeout(markerMouseoutTimeout);
      });

      google.maps.event.addListener(marker, 'mouseout', function() {
         markerMouseoutTimeout = window.setTimeout(
            function closeInfoWindow() { 
               infoBubble.removeTab(1);
               infoBubble.removeTab(0);
               infoBubble.close(); 
            }, 
            3000);   //milliseconds
      });
      */

      //Close the infoBubble if user clicks outside of infoBubble area
      google.maps.event.addListenerOnce(map, 'click', function() {
         infoBubble.setMap(null);
         infoBubble.close(); 
      });
   });

   //Listener for mouseover marker to display tracks
   google.maps.event.addListener(marker, 'mouseover', function() {
      //Hover display name
      if (vesselname.length != 0 && vesselname != null) {
         marker.setTitle(vesselname.trim());
      }
      else {
         marker.setTitle(mmsi);
      }

      //Display ship details in sidebar
      //var $html = $(html);
      //document.getElementById('shipdetails').innerHTML = $html.find('#content-right').html();
      document.getElementById('shipdetails').innerHTML = html;
      document.getElementById('shipdetails').style.visibility = 'visible';

      /* MOVED GET TRACK BEHAVIOR TO A HYPERLINK INSTEAD OF HOVER TRIGGER
      //Delay, then get and display track
      trackMouseoverTimeout = window.setTimeout(
         function displayTracks() {
            getTrack(mmsi, vesseltypeint, streamid, datetime);
         },
         1000);   //milliseconds
      */

      google.maps.event.addListenerOnce(marker, 'mouseout', function() {
         window.clearTimeout(trackMouseoverTimeout);
         document.getElementById('shipdetails').style.visibility = 'hidden';
      });
   });
}

/* -------------------------------------------------------------------------------- */
function clearTrack(trackline, trackIcons, dashedLines) {
   if (trackline != null && trackIcons != null) {
      trackline.setMap(null);
      trackline = null;
      var trackIcon;
      console.log('Deleting track and ' + trackIcons.length + ' track icons.');
      var dashedLine;
      while (dashedLines.length > 0) {
         dashedLine = dashedLines.pop();
         dashedLine.setMap(null);
      }
      while (trackIcons.length > 0) {
         trackIcon = trackIcons.pop();
         trackIcon.setMap(null);
      }
      if (tracksDisplayed.length == 1) {
         deleteTrackTimeControl();
      }
      
      document.getElementById("queryalltracks").checked = false;
      document.getElementById("queryalltracks").removeAttribute("checked");
   }
}

/* -------------------------------------------------------------------------------- */
function clearAllTracks() {
   for (var i=0; i < tracksDisplayed.length; i++) {
      clearTrack(tracksDisplayed[i].trackline, tracksDisplayed[i].trackIcons, tracksDisplayed[i].dashedLines);
      tracksDisplayedMMSI[i] = null;
      tracksDisplayed[i] = null;
   }
   tracksDisplayedMMSI = [];
   tracksDisplayed = [];
   deleteTrackTimeControl();
}

/* -------------------------------------------------------------------------------- */
function toggleQueryAllTracks() {
   if (document.getElementById("queryalltracks").checked) {
      queryAllTracks();
   }
   else {
      clearAllTracks();
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to query and show all tracks within view bounds
 **/
function queryAllTracks() {
   //console.log(tracksDisplayedMMSI.length);
   //console.log(tracksDisplayed.length);

   var bounds = map.getBounds();

   var ne = bounds.getNorthEast();
   var sw = bounds.getSouthWest();

   var viewMinLat = sw.lat();
   var viewMaxLat = ne.lat();
   var viewMinLon = sw.lng();
   var viewMaxLon = ne.lng();

   var viewBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(viewMinLat, viewMinLon), 
            new google.maps.LatLng(viewMaxLat, viewMaxLon));

   //for (var i=0; i < Math.min(30,markersDisplayed.length); i++) {
   for (var i=0; i < markersDisplayed.length; i++) {
      var markerLatLng = new google.maps.LatLng(
                                    markersDisplayed[i].lat, 
                                    markersDisplayed[i].lon);
      console.log(markersDisplayed[i].lat + ' ' + markersDisplayed[i].lon);
      
      if (viewBounds.contains(markerLatLng) || Request.QueryString("queryTracks").toString() == 'all') {
         getTrack(markersDisplayed[i].mmsi, 
                  markersDisplayed[i].vesseltypeint, 
                  markersDisplayed[i].streamid, 
                  markersDisplayed[i].datetime);
      }
   }
}

/* -------------------------------------------------------------------------------- */
/**
 * Function to get track from track query PHP script
 */
function getTrack(mmsi, vesseltypeint, streamid, datetime) {
   //Check if track is already displayed or not
   // and that it is not a LAISIC track (vesseltypeint 999)
   if ($.inArray(mmsi, tracksDisplayedMMSI) == -1 && vesseltypeint != 999) {
      document.getElementById("query").value = "QUERY RUNNING FOR TRACK...";
      document.getElementById('stats_nav').innerHTML = '';
      document.getElementById('busy_indicator').style.visibility = 'visible';
      var phpWithArg = "query_track.php?streamid=" + streamid + "&mmsi=" + mmsi;


      //Grab date from track head
      phpWithArg = phpWithArg + "&date=" + toDate(datetime);

      //Debug query output
      console.log('GETTRACK(): ' + phpWithArg);

      var trackline = new google.maps.Polyline();

      $.getJSON(
            phpWithArg, // The server URL 
            { }
            ) //end .getJSON()
               .done(function (response) {
                  document.getElementById("query").value = response.query;
                  console.log('GETTRACK(): ' + response.query);
                  console.log('GETTRACK(): ' + 'track history size = ' + response.resultcount);

                  if (response.resultcount > 0) {
                     var trackHistory = new Array();
                     var trackPath = new Array();
                     var trackIcons = new Array();
                     var dashedLines = new Array();
                     var prev_target_status = null;
                     var target_status;
                     var trackTargetStatus = new Array();

                     /*
                     //Change text of showtrack link in the infowindow
                     $('a#showtracklink').text('Hide vessel track');
                     $('a#showtracklink').attr('onclick', "$('a#showtracklink').text('Show vessel track history');getTrack(\'" + mmsi + "\', \'" + vesseltypeint + "\', \'" + streamid + "\', \'" + datetime + "\');");
                     */
                     

                     //Loop through each time point of the same vessel
                     $.each(response.vessels, function(key,vessel) {
                        prev_target_status = null;
                        trackHistory.push(vessel);

                        var mmsi = vessel.mmsi;
                        var lat = vessel.lat;
                        var lon = vessel.lon;
                        var datetime = vessel.datetime;
                        var sog = vessel.sog;
                        var cog = vessel.cog;
                        //var streamid = vessel.streamid;
                        var true_heading= vessel.true_heading;

                        if (vessel.target_status != null) {
                           prev_target_status = target_status;
                           target_status = vessel.target_status;
                           trackTargetStatus.push(target_status);
                        }

                        trackPath[key] = new google.maps.LatLng(lat, lon);

                        //Check if previous target was 'lost' radar tracking
                        if (prev_target_status == 'L' && key > 0) {
                           //Draw dashed line to indicate disconnected path
                           var dashedPath = [];
                           dashedPath.push(trackPath[key-1]);
                           dashedPath.push(trackPath[key]);

                           var lineSymbol = {
                              path:         'M 0,-1 0,1',
                              strokeColor:        '#FFFFFF',
                              strokeOpacity: 1,
                              scale:         4
                           };                           

                           var dashedLine = new google.maps.Polyline({
                              path: dashedPath,
                               strokeOpacity: 0,
                               icons: [{
                                  icon:   lineSymbol,
                               offset: '0',
                               repeat: '20px'
                               }],
                               map: map                               
                           });
                           dashedLines.push(dashedLine);
                        }

                        //Display different colored icons for radar target statuses
                        if (target_status == 'Q') {
                           if (prev_target_status != null) {
                              //Draw dashed line to indicate disconnected path
                              var dashedPath = [];
                              dashedPath.push(trackPath[key-1]);
                              dashedPath.push(trackPath[key]);

                              var lineSymbol = {
                                 path:         'M 0,-1 0,1',
                                 strokeColor:  '#FFFFFF',
                                 strokeOpacity: 1,
                                 scale:         4
                              };                           

                              var dashedLine = new google.maps.Polyline({
                                 path: dashedPath,
                                  strokeOpacity: 0,
                                  icons: [{
                                     icon:      lineSymbol,
                                  offset:    '0',
                                  repeat:    '20px'
                                  }],
                                  map: map                               
                              });
                              dashedLines.push(dashedLine);
                           }

                           var tracklineIcon = new google.maps.Marker({icon: tracklineIconsOptionsQ});
                        }
                        else if (target_status == 'T') {
                           var tracklineIcon = new google.maps.Marker({icon: tracklineIconsOptionsT});
                        }
                        else if (target_status == 'L') {
                           var tracklineIcon = new google.maps.Marker({icon: tracklineIconsOptionsL});
                        }
                        else { //Display normal track icon for non-radar tracks
                           var tracklineIcon = new google.maps.Marker({icon: tracklineIconsOptions});
                        }
                        tracklineIcon.setPosition(trackPath[key]);
                        tracklineIcon.setMap(map);
                        if (target_status == false) {
                           tracklineIcon.setTitle('MMSI: ' + mmsi + '\nDatetime: ' + toHumanTime(datetime) + '\nDatatime (unixtime): ' + datetime + '\nLat: ' + lat + '\nLon: ' + lon + '\nHeading: ' + true_heading + '\nSOG: ' + sog + '\nCOG: ' + cog + '\nStreamID: ' + streamid);
                        }
                        else {
                           tracklineIcon.setTitle('MMSI: ' + mmsi + '\nDatetime: ' + toHumanTime(datetime) + '\nDatatime (unixtime): ' + datetime + '\nLat: ' + lat + '\nLon: ' + lon + '\nHeading: ' + true_heading + '\nSOG: ' + sog + '\nCOG: ' + cog + '\ntarget_status: ' + target_status + '\nStreamID: ' + streamid);
                        }

                        trackIcons.push(tracklineIcon);


                        //Add listener to delete track if right click on icon
                        google.maps.event.addListener(tracklineIcon, 'rightclick', function() {
                           clearTrack(trackline, trackIcons, dashedLines);
                           var deleteIndex = $.inArray(mmsi, tracksDisplayedMMSI);
                           tracksDisplayedMMSI.splice(deleteIndex, 1);
                           tracksDisplayed.splice(deleteIndex, 1);
                        });

                        //Add listener to project to predicted location if click on icon (dead reckoning)
                        google.maps.event.addListener(tracklineIcon, 'mousedown', function() {
                           if (sog != -1 && (key+1) < trackHistory.length) {
                              var time = (trackHistory[key+1].datetime - trackHistory[key].datetime)/60/60; //Grab next chronological time and compare time difference
                              if (time == 0 && (key+2) < 0) {
                                 time = (trackHistory[key+2].datetime - trackHistory[key].datetime)/60/60;
                              }
                              var d = (sog*1.852)*time; //convert knots/hr to km/hr
                              var R = 6371; //km

                              var lat1 = parseFloat(lat)*Math.PI/180;
                              var lon1 = parseFloat(lon)*Math.PI/180;
                              var brng = parseFloat(true_heading)*Math.PI/180;
                              //console.log(lat1);
                              //console.log(lon1);
                              //console.log(d);
                              //console.log(brng);

                              var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );

                              var lon2 = lon1 + Math.atan2(
                                 Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
                                 Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

                              lat2 = lat2 * 180/Math.PI;
                              lon2 = lon2 * 180/Math.PI;

                              //console.log(lat2);
                              //console.log(lon2);
                              var prediction = new google.maps.Marker({
                                 position: new google.maps.LatLng(lat2,lon2),
                                  map:         map,
                                  icon: {
                                     path:        'M 0,8 4,8 0,-8 -4,8 z',
                                     strokeColor: '#0000FF',
                                     fillColor:   '#0000FF',
                                     fillOpacity: 0.6,
                                     rotation:    true_heading,
                                  }
                              });

                              var predictionCircle = new google.maps.Circle({
                                  center:         new google.maps.LatLng(lat,lon),
                                  radius:         d*1000,
                                  strokeColor:    '#0000FF',
                                  strokeOpacity:  0.8,
                                  strokeWeight:   1,
                                  fillColor:      '#0000FF',
                                  fillOpacity:    0.2,
                                  map: map
                              });


                              google.maps.event.addListener(predictionCircle, 'mouseup', function() {
                                 prediction.setMap(null);
                                 predictionCircle.setMap(null);
                              });
                              google.maps.event.addListener(prediction, 'mouseup', function() {
                                 prediction.setMap(null);
                                 predictionCircle.setMap(null);
                              });
                              google.maps.event.addListener(tracklineIcon, 'mouseup', function() {
                                 prediction.setMap(null);
                                 predictionCircle.setMap(null);
                              });
                              google.maps.event.addListener(map, 'mouseup', function() {
                                 prediction.setMap(null);
                                 predictionCircle.setMap(null);
                              });
                           }
                        });
                     });

                     var tracklineOptions = {
                        strokeColor:   getIconColor(vesseltypeint, streamid), 
                        strokeOpacity: 0.7,
                        strokeWeight:  4,
                     };

                     trackline.setOptions(tracklineOptions);
                     trackline.setPath(trackPath);
                     trackline.setMap(map);

                     console.log("trackicons: " + trackIcons.length);

                     //Keep track of which MMSI has tracks displayed
                     tracksDisplayedMMSI.push(mmsi);
                     var track = {
                        mmsi: mmsi,
                        trackHistory: trackHistory,
                        trackline: trackline,
                        dashedLines: dashedLines,
                        trackIcons: trackIcons,
                        trackTargetStatus: trackTargetStatus
                     };

                     tracksDisplayed.push(track);

                     //Set up track time slider
                     createTrackTimeControl(map, 251, tracksDisplayed);

                     //Add listener to delete track if right click on track line 
                     google.maps.event.addListener(trackline, 'rightclick', function() {
                        clearTrack(trackline, trackIcons, dashedLines);
                        var deleteIndex = $.inArray(mmsi, tracksDisplayedMMSI);
                        tracksDisplayedMMSI.splice(deleteIndex, 1);
                        tracksDisplayed.splice(deleteIndex, 1);
                     });
                  }

                  document.getElementById('busy_indicator').style.visibility = 'hidden';
                  document.getElementById('stats_nav').innerHTML = response.resultcount + " results<br>" + Math.round(response.exectime*1000)/1000 + " secs";
               }) //end .done()
            .fail(function() { 
               console.log('GETTRACK(): ' +  'No response from track query; error in php?'); 
               document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
               document.getElementById('busy_indicator').style.visibility = 'hidden';
               return; 
            }); //end .fail()
   }
   else {
      console.log('Track for ' + mmsi + ' is already displayed.');
   }
}

/* -------------------------------------------------------------------------------- */
function appendLaisicView() {
   /*
   var radartablelist = $('#radartablelist');
   radartablelist.change( function() {
      var bounds = map.getBounds();
      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();

      var minLat = sw.lat();
      var maxLat = ne.lat();
      var minLon = sw.lng();
      var maxLon = ne.lng();

      var boundStr = " WHERE lat BETWEEN " + Math.round(minLat*1000)/1000 + " AND " + Math.round(maxLat*1000)/1000 + " AND lon BETWEEN " + Math.round(minLon*1000)/1000 + " AND " + Math.round(maxLon*1000)/1000;

      //alert('changed to ' + $(this).val());
      //Query the table
      getCurrentAISFromDB(map.getBounds(), "SELECT * FROM (SELECT * FROM " + $(this).val() + " UNION SELECT messagetype, mmsi, navstatus, rot, sog, lon, lat, cog, true_heading, datetime, imo, vesselname, vesseltypeint, length, shipwidth, bow, stern, port, starboard, draught, destination, callsign, posaccuracy, eta, posfixtype, streamid FROM upload_table) VESSELS" + boundStr, true);
   });

   var currenttablelist = $('#currenttablelist');
   currenttablelist.change( function() {
      var bounds = map.getBounds();
      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();

      var minLat = sw.lat();
      var maxLat = ne.lat();
      var minLon = sw.lng();
      var maxLon = ne.lng();

      var boundStr = " WHERE lat BETWEEN " + Math.round(minLat*1000)/1000 + " AND " + Math.round(maxLat*1000)/1000 + " AND lon BETWEEN " + Math.round(minLon*1000)/1000 + " AND " + Math.round(maxLon*1000)/1000;

      //alert('changed to ' + $(this).val());
      //Query the table
      getCurrentAISFromDB(map.getBounds(), "SELECT * FROM (SELECT * FROM " + $(this).val() + " UNION SELECT messagetype, mmsi, navstatus, rot, sog, lon, lat, cog, true_heading, datetime, imo, vesselname, vesseltypeint, length, shipwidth, bow, stern, port, starboard, draught, destination, callsign, posaccuracy, eta, posfixtype, streamid FROM upload_table) VESSELS" + boundStr, true);
   });

   */

   //Listen for common date dropdown change
   var currenttablelist = $('#commondatelist');
   currenttablelist.change( function() {
      /*
      var bounds = map.getBounds();
      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();

      var minLat = sw.lat();
      var maxLat = ne.lat();
      var minLon = sw.lng();
      var maxLon = ne.lng();

      var boundStr = " WHERE lat BETWEEN " + Math.round(minLat*1000)/1000 + " AND " + Math.round(maxLat*1000)/1000 + " AND lon BETWEEN " + Math.round(minLon*1000)/1000 + " AND " + Math.round(maxLon*1000)/1000;
      */


      sourcesDate = "_" + $(this).val();

      //alert('changed to ' + $(this).val());
      //Query the table
      getCurrentAISFromDB(map.getBounds(), "SELECT * FROM (SELECT * FROM radar_vessels_" + $(this).val() + " UNION SELECT * FROM current_vessels_" + $(this).val() + " UNION SELECT messagetype, mmsi, navstatus, rot, sog, lon, lat, cog, true_heading, datetime, imo, vesselname, vesseltypeint, length, shipwidth, bow, stern, port, starboard, draught, destination, callsign, posaccuracy, eta, posfixtype, streamid FROM upload_table) VESSELS", true);
   });}

/* -------------------------------------------------------------------------------- */
function refreshLayers() {
	clearOverlays();
	clearMarkerArray();
   getCurrentAISFromDB(map.getBounds(), null, true);
}

/* -------------------------------------------------------------------------------- */
function enteredQuery() {
   var entered_query = document.getElementById("query").value;
   console.log(entered_query);

   //Trim white space
   $.trim(entered_query);

   //Create "startsWith" function
   if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
         return this.indexOf(str) == 0;
      };
   }

   //Use startsWith function to find the "SELECT" statement
   if (entered_query.startsWith('SELECT')) {
      getCurrentAISFromDB(map.getBounds(), entered_query, true);
   }
   else {
      getCurrentAISFromDB(map.getBounds(), entered_query, true);
   }
}

/* -------------------------------------------------------------------------------- */
function typeSelectUpdated() {
   console.log('Types select updated');
   var types = getTypesSelected();

   //var entered_query = document.getElementById("query").value;
   var entered_query = mainQuery;

   if ($.inArray(999, types) == -1) {
      entered_query = entered_query + " AND vesseltypeint IN (";
   
      for (var i=0; i < types.length; i++) {
         entered_query = entered_query + types[i];
         if (i != types.length-1) {
            entered_query = entered_query + ",";
         }
      }
      entered_query = entered_query + ")";
      getCurrentAISFromDB(map.getBounds(), entered_query, true);
   }
   else {
      getCurrentAISFromDB(map.getBounds(), null, true);
   }
}

/* -------------------------------------------------------------------------------- */
function highlightMMSI(mmsi) {
   for (var i=0; i < markersDisplayed.length; i++) {
      if (markersDisplayed[i].mmsi == mmsi) {
         highlightCircle.setCenter(new google.maps.LatLng(markersDisplayed[i].lat, markersDisplayed[i].lon));
         highlightCircle.setMap(map);
      }
   }
}

/* -------------------------------------------------------------------------------- */
function hideHighlightMMSI() {
   highlightCircle.setMap(null);
}

/* -------------------------------------------------------------------------------- */
function typeSelectedAllShips() {
   setAllTypesChecked();
   typeSelectUpdated();
}

/* -------------------------------------------------------------------------------- */
function setAllTypesChecked() {
   if ( document.getElementById("All Ships").checked ) {
      console.log('setting all check boxes true');
      document.getElementById("0-Unspecified Ships").checked = true;
      document.getElementById("30-Fishing").checked = true;
      document.getElementById("31-Towing").checked = true;
      document.getElementById("32-Big Tow").checked = true;
      document.getElementById("33-Dredge").checked = true;
      document.getElementById("35-Military").checked = true;
      document.getElementById("37-Pleasure Craft").checked = true;
      document.getElementById("50-Pilot").checked = true;
      document.getElementById("51-Search and Rescue").checked = true;
      document.getElementById("52-Tug").checked = true;
      document.getElementById("55-Law Enforcement").checked = true;
      document.getElementById("6x-Passenger Vessels").checked = true;
      document.getElementById("7x-Cargo Vessels").checked = true;
      document.getElementById("8x-Tankers").checked = true;
   }
}

/* -------------------------------------------------------------------------------- */
function getTypesSelected() {
	var types = [];

   //Check if any of the specific types are unchecked
   var checkboxtype = document.getElementsByClassName("checkboxtype");
   for (var i=0; i < checkboxtype.length; i++) {
      //If there are any unchecked types, then uncheck the "All Ships" checkbox as well
      if (checkboxtype[i].checked == false) {
         document.getElementById("All Ships").checked = false;
         document.getElementById("All Ships").removeAttribute('checked');
      }
   }

   //Now, check which boxes are still checked
   if(document.getElementById("0-Unspecified Ships").checked) {
      types.push(0);
   }
   if(document.getElementById("30-Fishing").checked) {
      types.push(30);
   }
   if(document.getElementById("31-Towing").checked) {
      types.push(31);
   }
   if(document.getElementById("32-Big Tow").checked) {
      types.push(32);
   }
   if(document.getElementById("33-Dredge").checked) {
      types.push(33);
   }
   if(document.getElementById("35-Military").checked) {
      types.push(35);
   }
   if(document.getElementById("37-Pleasure Craft").checked) {
      types.push(37);
   }
   if(document.getElementById("50-Pilot").checked) {
      types.push(50);
   }
   if(document.getElementById("51-Search and Rescue").checked) {
      types.push(51);
   }
   if(document.getElementById("52-Tug").checked) {
      types.push(52);
   }
   if(document.getElementById("55-Law Enforcement").checked) {
      types.push(55);
   }
   if(document.getElementById("6x-Passenger Vessels").checked) {
      types.push(60);   //covers 60-69
      types.push(61);
      types.push(62);
      types.push(63);
      types.push(64);
      types.push(65);
      types.push(66);
      types.push(67);
      types.push(68);
      types.push(69);
   }
   if(document.getElementById("7x-Cargo Vessels").checked) {
      types.push(70);   //covers 70-79
      types.push(71);
      types.push(72);
      types.push(73);
      types.push(74);
      types.push(75);
      types.push(76);
      types.push(77);
      types.push(78);
      types.push(79);
   }
   if(document.getElementById("8x-Tankers").checked) {
      types.push(80);   //covers 80-89
      types.push(81);
      types.push(82);
      types.push(83);
      types.push(84);
      types.push(85);
      types.push(86);
      types.push(87);
      types.push(88);
      types.push(89);
   }

   //Default to all ships if no types selected
   if (types.length == 0 || document.getElementById("All Ships").checked) {
      types.push(999);
      document.getElementById("All Ships").checked = true;
      setAllTypesChecked();
   }

   return types;
}

/* -------------------------------------------------------------------------------- */
function getIconColor(vesseltypeint, streamid) {
   var color;
   if (streamid == 'shore-radar' || (streamid == 'r166710001' && vesseltypeint != 999)) {
      //color = '#FE2E2E';
      color = '#F078FF';  //pink
      return color;
   }
         
   if (vesseltypeint >= 70 && vesseltypeint <= 79) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint >= 80 && vesseltypeint <= 89) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint >= 60 && vesseltypeint <= 69) {
      color = '#01DF01'; 
      //return "shipicons/lightgreen1_90.png";
   }
   else if (vesseltypeint == 0) {
      color = '#F78181';
      //return "shipicons/pink0.png";
   }
   else if (vesseltypeint == 55) {
      color = '#0000FF'; 
      //return "shipicons/blue1_90.png";
   }
   else if (vesseltypeint == 35) {
      color = '#0000FF'; 
      //return "shipicons/blue1_90.png";
   }
   else if (vesseltypeint == 31) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 32) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 52) {
      color = '#DF7401'; 
      //return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 33) {
      color = '#DF7401'; 
		//return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 50) {
      color = '#DF7401'; 
		//return "shipicons/brown1_90.png";
   }
   else if (vesseltypeint == 37) {
      color = '#8904B1'; 
		//return "shipicons/magenta1_90.png";
   }
   else if (vesseltypeint == 30) {
      color = '#01DFD7'; 
		//return "shipicons/cyan1_90.png";
   }
   else if (vesseltypeint == 51) {
      //color = '#FF0000'; 
      color = '#BE3C14'; 
		//return "shipicons/red1_90.png";
   }
   else if (vesseltypeint == 999) { //currently used for LAISIC outputs
      color = '#A901DB'; 
      //color = '#A4A4A4'; 
		//return "shipicons/lightgray1_90.png";
   }
   else {
      color = '#FFFFFF';
		//return "shipicons/white0.png";
   }
   return color;
}

/* -------------------------------------------------------------------------------- */
function getRiskColor(vesseltypeint, streamid, risk_rating) {
   var color;
   if (streamid == 'shore-radar' || (streamid == 'r166710001' && vesseltypeint != 999)) {
      color = '#F078FF';  //pink
      return color;
   }
   
   if (vesseltypeint == 999) { //currently used for LAISIC outputs
      color = '#A901DB'; 
   }
   else if (risk_rating == "L") { // Green Outline for Vessel
      color = '#00F014';
   }
   else if (risk_rating == "M") { // Yellow Outline for Vessel
      color = '#F0FF78';
   }
   else if (risk_rating == "H" ) { // Red Outline for Vessel
      color = '#FF0014';
   }
   else
   {
      color = '#FFFFFF';
   }
   return color;
}

/* -------------------------------------------------------------------------------- */
//Shows any overlays currently in the array
function showOverlays() {
	if (markerArray) {
		for (i in markerArray) {
			markerArray[i].setMap(map);
		}
	}
}

/* -------------------------------------------------------------------------------- */
function tipDisplay(marker, info_window) {
	this.marker = marker;
	this.info_window = info_window;
}

/* -------------------------------------------------------------------------------- */
function clearMap() {
	clearOverlays();
	clearMarkerArray();
}

/* -------------------------------------------------------------------------------- */
//Removes the overlays from the map, but keeps them in the array
function clearOverlays() {
	if (markerArray) {
		for (i in markerArray) {
			markerArray[i].setMap(null);
		}
	}
}

/* -------------------------------------------------------------------------------- */
//
function clearMarkerArray() {
	if (markerArray) {
      if (CLUSTER) {
         markerClusterer.removeMarkers(markerArray);
      }

		for (i in markerArray) {
			markerArray[i].setMap(null);
         markerArray[i] = null;
		}
		markerArray.length = 0;
      markerArray = [];
	}
}

/* -------------------------------------------------------------------------------- */
//TODO: need to update to clear only out of bound markers
function clearOutBoundMarkers() {
	if (markerArray) {
      if (CLUSTER) {
         markerClusterer.removeMarkers(markerArray);
      }

		for (i in markerArray) {
			markerArray[i].setMap(null);
         markerArray[i] = null;
		}
		markerArray.length = 0;
         markerArray = [];
	}
}

/* -------------------------------------------------------------------------------- */
function toggleRadarLayer() {
   //Disabled until sources usage is fixed
   /*
   if (document.getElementById("RadarLayer").checked) {
      sourcesInt = 3;
      getCurrentAISFromDB(map.getBounds(), null, true);
   }
   else {
      sourcesInt = 1;
      getCurrentAISFromDB(map.getBounds(), null, true);
   }
   */
}

/* -------------------------------------------------------------------------------- */
function toggleKMLLayer() {
   if (document.getElementById("KMLLayer") && document.getElementById("KMLLayer").checked) {
   tempKMLcount++;
      KML = true;
      showKML();
   }
   else if (document.getElementById("KMLLayer")){
      //Delete the KML layer
      KML = false;
      //kmlparser.hideDocument(kmlparser.docs);
      if (kmlparser.docs) {
         for (var i in kmlparser.docs[0].markers) {
            kmlparser.docs[0].markers[i].setMap(null);
         }
         kmlparser.docs[0].markers = [];
         kmlparser.docs[0].overlays[0].setMap(null);
         kmlparser.docs[0].overlays[0] = null;
         kmlparser.docs[0] = null
      }
      //Delete the opacity slider control
      //TODO: make sure to pop the correct object
      map.controls[google.maps.ControlPosition.RIGHT_TOP].pop();
   }
   else {
      //Do nothing, KMLLayer div not found
   }
}

/* -------------------------------------------------------------------------------- */
function showUploadedKML(datetime) {
   console.log('Showing KML');
   kmlparser = new geoXML3.parser({
      map:               map,
      singleInfoWindow:  true
   });
   kmlparser.parse('kml/' + datetime + '/doc.kml');
   kmlparsers.push(kmlparser);
}

/* -------------------------------------------------------------------------------- */
function deleteKMLLayer(index) {
   console.log('deleting kml layer');
   console.log(index);
   //while(kmlparsers.length > 0) {
      //tempkmlparser = kmlparsers.pop();
      tempkmlparser = kmlparsers[index];

      if (tempkmlparser.docs) {
         for (var i in tempkmlparser.docs[0].markers) {
            tempkmlparser.docs[0].markers[i].setMap(null);
         }
         tempkmlparser.docs[0].markers = [];
         tempkmlparser.docs[0].overlays[0].setMap(null);
         tempkmlparser.docs[0].overlays[0] = null;
         tempkmlparser.docs[0] = null
      }
      //Delete the opacity slider control
      //TODO: make sure to pop the correct object
      map.controls[google.maps.ControlPosition.RIGHT_TOP].pop();
      map.controls[google.maps.ControlPosition.RIGHT_TOP].pop();

      tempkmlparser = kmlparsers.splice(index,1);
   //}
}

/* -------------------------------------------------------------------------------- */
function showKML() {
   kmlparser = new geoXML3.parser({
      map:               map,
      singleInfoWindow:  true,
   });

   if (tempKMLcount % 2 == 1)
      kmlparser.parse('kml/tsx.kml');
   else //if (tempKMLcount % 2 == 2)
      kmlparser.parse('kml/ghana.kml');
   //else if (tempKMLcount % 3 == 0)
   //   kmlparser.parse('kml/doc.kml');
}

/* -------------------------------------------------------------------------------- */
function togglePortLayer() {
   if (document.getElementById("PortLayer") && document.getElementById("PortLayer").checked) {
      Ports = true;
      showPorts();
   }
   else {
      Ports = false;
      hidePorts();
   }
}

/* -------------------------------------------------------------------------------- */
function showPorts() {
   document.getElementById("query").value = "QUERY RUNNING FOR PORTS...";
   document.getElementById('stats_nav').innerHTML = '';
   document.getElementById('busy_indicator').style.visibility = 'visible';

   var bounds = map.getBounds();
   var ne = bounds.getNorthEast();
   var sw = bounds.getSouthWest();
   var minLat = sw.lat();
   var maxLat = ne.lat();
   var minLon = sw.lng();
   var maxLon = ne.lng();
   var boundStr = "&minlat=" + Math.round(minLat*1000)/1000 + "&maxlat=" + Math.round(maxLat*1000)/1000 + "&minlon=" + Math.round(minLon*1000)/1000 + "&maxlon=" + Math.round(maxLon*1000)/1000

   var phpWithArg = "query_ports.php?" + boundStr;
   //Debug query output
   console.log('SHOWPORTS(): ' + phpWithArg);

   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         document.getElementById("query").value = response.query;
         console.log('SHOWPORTS(): ' + response.query);
         console.log('SHOWPORTS(): ' + 'number of ports = ' + response.resultcount);

         $.each(response.ports, function(key,port) {
            var port_name = port.port_name;
            var country_name = port.country_name;
            var lat = port.lat;
            var lon = port.lon;

            port_location = new google.maps.LatLng(lat, lon);
            var portIcon = new google.maps.Marker({icon: 'icons/anchor_port.png'});
            portIcon.setPosition(port_location);
            portIcon.setMap(map);
            portIcon.setTitle('Port Name: ' + port_name + '\nCountry: ' + country_name + '\nLat: ' + lat + '\nLon: ' + lon);

            portCircle = new google.maps.Circle({
               center:  port_location,
                        radius: 25000,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        fillColor: "#FF0000",
                        fillOpacity: 0.15,
                        map: map
            });

            portIcons.push(portIcon);
            portCircles.push(portCircle);
         });

         document.getElementById('busy_indicator').style.visibility = 'hidden';
         document.getElementById('stats_nav').innerHTML = response.resultcount + " results<br>" + Math.round(response.exectime*1000)/1000 + " secs";
      }) //end .done()
      .fail(function() { 
         console.log('SHOWPORTS(): ' +  'No response from port query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
      }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
function hidePorts() {
   var portIcon;
   var portCircle;
   for (i=0; i< portIcons.length; i++) {
      portIcon = portIcons[i];
      portIcon.setMap(null);
      portCircle = portCircles[i];
      portCircle.setMap(null);
   }
   portIcons = [];
   portCircles = [];
}

/* -------------------------------------------------------------------------------- */
function toggleClusterLayer() {
   if (document.getElementById("ClusterLayer") && document.getElementById("ClusterLayer").checked) {
      clearOverlays();
      CLUSTER = true;
      markerClusterer.addMarkers(markerArray);
   }
   else {
      CLUSTER = false;
      markerClusterer.removeMarkers(markerArray);
      showOverlays();   //Display the markers individually
   }
}

/* -------------------------------------------------------------------------------- */
function toggleHeatmapLayer() {
   if (document.getElementById("HeatmapLayer") && document.getElementById("HeatmapLayer").checked) {
      markerClusterer.removeMarkers(markerArray);
      addHeatmap();
   }
   else if (document.getElementById("HeatmapLayer")) {
      if (typeof heatmapLayer != 'undefined' && heatmapLayer != null) {
         heatmapLayer.setMap(null);
         markerClusterer.addMarkers(markerArray);
      }
   }
   else {
      //Do nothing, no heatmap div found
   }
}

/* -------------------------------------------------------------------------------- */
//adds an example heat map
//this could be for example a probability of pirate attack map
function addHeatmap() {
   var heatmapData = new Array();

   for(var i=0; i<markerArray.length; i++) {
      heatmapData[i] = markerArray[i].getPosition();
   }

   heatmapLayer = new google.maps.visualization.HeatmapLayer({
     data: heatmapData
   });

   heatmapLayer.setMap(map);
}

/* -------------------------------------------------------------------------------- */
function toggleWeatherLayer() {
   if (document.getElementById("WeatherLayer") && document.getElementById("WeatherLayer").checked) {
      addWeatherLayer();
   }
   else if (document.getElementById("WeatherLayer")) {
      if (typeof weatherLayer != 'undefined' && whetherLayer != null) {
         weatherLayer.setMap(null);
         cloudLayer.setMap(null);
      }
   }
   else {
      //Do nothing, no WeatherLayer div found
   }
}

/* -------------------------------------------------------------------------------- */
function addWeatherLayer() {
	weatherLayer = new google.maps.weather.WeatherLayer({
		temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
	});
	weatherLayer.setMap(map);

	cloudLayer = new google.maps.weather.CloudLayer();
	cloudLayer.setMap(map);	
}

/* -------------------------------------------------------------------------------- */
//Adds a drawing manager to the map for adding custom shapes and placemarks
//to your map
function addDrawingManager() {
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: null,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT,
			drawingModes: [
			               google.maps.drawing.OverlayType.MARKER,
			               google.maps.drawing.OverlayType.CIRCLE,
			               google.maps.drawing.OverlayType.POLYGON,
			               google.maps.drawing.OverlayType.POLYLINE,
			               google.maps.drawing.OverlayType.RECTANGLE
			               ]
		},
		circleOptions: {
			fillColor: '#ffff00',
			fillOpacity: 0.3,
			strokeWeight: 2,
			strokeColor: '#ffff00',
         strokeOpacity: 0.8,
			clickable: true,
			editable: false,
			zIndex: 1
		},
		polygonOptions: {
			fillColor: '#ffff00',
			fillOpacity: 0.3,
			strokeWeight: 2,
			strokeColor: '#ffff00',
         strokeOpacity: 0.8,
			clickable: true,
			editable: false,
			zIndex: 1 
		},
		polylineOptions: {
			fillColor: '#ffff00',
			fillOpacity: 0.3,
			strokeWeight: 3,
			strokeColor: '#ffff00',
         strokeOpacity: 0.8,
			clickable: true,
			editable: false,
			zIndex: 1 
		},
      rectangleOptions: {
			fillColor: '#ffff00',
			fillOpacity: 0.3,
			strokeWeight: 2,
			strokeColor: '#ffff00',
         strokeOpacity: 0.8,
			clickable: true,
			editable: false,
			zIndex: 1 
		}
	});
	drawingManager.setMap(map);

   //map.controls[google.maps.ControlPosition.TOP_LEFT].push();

   google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
      //if (event.type != google.maps.drawing.OverlayType.MARKER) {
         // Switch back to non-drawing mode after drawing a shape.
         drawingManager.setDrawingMode(null);

         var newShape = event.overlay;
         newShape.type = event.type;
         //delete shape if user right clicks on the shape
         google.maps.event.addListener(newShape, 'rightclick', function (e) {
            newShape.setMap(null);
         });

         //make shape editable if user left clicks on the shape
         google.maps.event.addListener(newShape, 'click', function (e) {
            setSelection(newShape);
         });
         google.maps.event.addListener(map, 'click', clearSelection);
      //}
   });
}

/* -------------------------------------------------------------------------------- */
function clearSelection() {
   if (selectedShape) {
      selectedShape.setEditable(false);
      selectedShape = null;
   }
}

/* -------------------------------------------------------------------------------- */
function setSelection(shape) {
   clearSelection();
   selectedShape = shape;
   shape.setEditable(true);
}

/* -------------------------------------------------------------------------------- */
function setMapCenterToCenterOfMass(map, tips) {
   lat_mean=0;
   lon_mean=0;
   N=tips.length;
   for(var i=0;i<N;i++)
	{
		lat_mean = lat_mean+tips[i].lat/N;
		lon_mean = lon_mean+tips[i].lon/N;
	}
	var centerCoord = new google.maps.LatLng(lat_mean, lon_mean);
	map.setCenter(centerCoord);
}

/* -------------------------------------------------------------------------------- */
function toggleDistanceTool() {
   if (document.getElementById("distancetooltoggle").value == 'Enable distance tool') {
      enableDistanceTool();
      document.getElementById("distancetooltoggle").value = 'Disable distance tool';
   }
   else {
      disableDistanceTool();
      document.getElementById("distancetooltoggle").value = 'Enable distance tool';
   }
}

/* -------------------------------------------------------------------------------- */
function enableDistanceTool() {
   //Distance label
   mapLabel = new MapLabel({
            text: '',
            //position: new google.maps.LatLng(5.9,1.30),
            map: map,
            fontSize: 14,
            align: 'left'
   });
   
   google.maps.event.addListener(map,'rightclick',function(event) {
      prevlatLng = latLng;
      latLng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
      //Delete previous marker
      if (prevdistIcon != null) {
         prevdistIcon.setMap(null);
      }
      prevdistIcon = distIcon;
      distIcon = new google.maps.Marker({position: latLng, map: map, icon: distIconsOptions});

      //Get the distance on second click
      if (prevlatLng != null) {
         var dist = google.maps.geometry.spherical.computeDistanceBetween(prevlatLng, latLng);
         distIcon.setTitle('' + Math.round(dist*100)/100 + 'm');
         prevdistIcon.setTitle('' + Math.round(dist*100)/100 + 'm');
         if (distPath != null) {
            distPath.setMap(null);
         }
         distPath = new google.maps.Polyline({
            map:           map,
            path:          [prevlatLng, latLng],
            strokeColor:   "#04B4AE",
            strokeOpacity: 1.0,
            strokeWeight:  5,
         });
         console.log('Distance between two clicks: ' + Math.round(dist*100)/100 + ' meters');

         //Set distance label
         mapLabel.set('text', Math.round((dist/1000)*1000)/1000 + ' km (' + Math.round((dist/1000)/1.852*1000)/1000 + ' nm)');
         mapLabel.set('map', map);
         mapLabel.bindTo('position', distIcon);

         google.maps.event.addListener(distPath,'click',function() {
            deleteDistTool();
         });
         google.maps.event.addListener(distIcon,'click',function() {
            deleteDistTool();
         });
         google.maps.event.addListener(prevdistIcon,'click',function() {
            deleteDistTool();
         });
         google.maps.event.addListener(distPath,'rightclick',function() {
            deleteDistTool();
         });
         google.maps.event.addListener(distIcon,'rightclick',function() {
            deleteDistTool();
         });
         google.maps.event.addListener(prevdistIcon,'rightclick',function() {
            deleteDistTool();
         });

         function deleteDistTool() {
            distPath.setMap(null);
            distPath = null;
            distIcon.setMap(null);
            prevdistIcon.setMap(null);
            distIcon = null;
            prevdistIcon = null;
            prevlatLng = null;
            latLng = null;
            mapLabel.set('map', null);
         }
      }
   });
}

/* -------------------------------------------------------------------------------- */
function disableDistanceTool() {
   if (distPath != null) {
      distPath.setMap(null);
      distPath = null;
   }
   if (distIcon != null) {
      distIcon.setMap(null);
      distIcon = null;
   }
   if (prevdistIcon != null) {
      prevdistIcon.setMap(null);
      prevdistIcon = null;
   }
   prevlatLng = null;
   latLng = null;
   if (mapLabel != null) {
      mapLabel.set('map', null);
      mapLabel.setMap(null);
   }
   google.maps.event.clearListeners(map,'rightclick');
}

/* -------------------------------------------------------------------------------- */
function addWmsLayers() {
   openlayersWMS = new google.maps.ImageMapType(wmsOpenLayersOptions);
   map.mapTypes.set('OpenLayers', openlayersWMS);
}

/* -------------------------------------------------------------------------------- */
function WMSOpenLayersGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
   var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);
   //The user will enter the address to the public WMS layer here.  The data must be in WGS84
   var baseURL = "http://demo.cubewerx.com/cubewerx/cubeserv.cgi?";
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image%2Fjpeg"; //type of image returned  or image/jpeg
   //The layer ID.  Can be found when using the layers properties tool in ArcMap or from the WMS settings 
   var layers = "Foundation.GTOPO30";
   //projection to display. This is the projection of google map. Don't change unless you know what you are doing.  
   //Different from other WMS servers that the projection information is called by crs, instead of srs
   var crs = "EPSG:4326"; 
   //With the 1.3.0 version the coordinates are read in LatLon, as opposed to LonLat in previous versions
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var service = "WMS";
   //the size of the tile, must be 256x256
   var width = "256";
   var height = "256";
   //Some WMS come with named styles.  The user can set to default.
   var styles = "default";
   //Establish the baseURL.  Several elements, including &EXCEPTIONS=INIMAGE and &Service are unique to openLayers addresses.
   var url = baseURL + "Layers=" + layers + "&version=" + version + "&EXCEPTIONS=INIMAGE" + "&Service=" + service + "&request=" + request + "&Styles=" + styles + "&format=" + format + "&CRS=" + crs + "&BBOX=" + bbox + "&width=" + width + "&height=" + height;
   return url;
}

/* -------------------------------------------------------------------------------- */
function toggleTMACSHeadWMSLayer() {
   var wmsTMACSheadOptions = {
      alt: "TMACS",
      getTileUrl: WMSTMACSHeadGetTileUrl,
      isPng: true,
      maxZoom: 17,
      minZoom: 1,
      name: "TMACS",
      tileSize: new google.maps.Size(WMSTILESIZE, WMSTILESIZE)
   };

   //For interval timer:
   /*
// set interval
var tid = setInterval(mycode, 2000);
function mycode() {
  // do some stuff...
  // no need to recall the function (it's an interval, it'll loop forever)
}
function abortTimer() { // to be called when you want to stop the timer
  clearInterval(tid);
}
    */

   //Track head
   if (document.getElementById("TMACShead") && document.getElementById("TMACShead").checked) {
      //TMACS WMS
      tmacsHeadWMS = new google.maps.ImageMapType(wmsTMACSheadOptions);
      map.overlayMapTypes.insertAt(0, tmacsHeadWMS);
      //map.overlayMapTypes.push(tmacsHeadWMS);
   }
   else {
      map.overlayMapTypes.setAt(0,null);
      //map.overlayMapTypes.removeAt(0);
   }
}

/* -------------------------------------------------------------------------------- */
function toggleTMACSHistoryWMSLayer() {
   var wmsTMACShistoryOptions = {
      alt: "TMACS",
      getTileUrl: WMSTMACSHistoryGetTileUrl,
      isPng: true,
      maxZoom: 17,
      minZoom: 1,
      name: "TMACS",
      tileSize: new google.maps.Size(WMSTILESIZE, WMSTILESIZE)
   };

   //Track history
   if (document.getElementById("TMACShistory") && document.getElementById("TMACShistory").checked) {
      //TMACS WMS
      tmacsHistoryWMS = new google.maps.ImageMapType(wmsTMACShistoryOptions);
      map.overlayMapTypes.insertAt(1, tmacsHistoryWMS);
      //map.overlayMapTypes.push(tmacsHistoryWMS);
   }
   else {
      map.overlayMapTypes.setAt(1,null);
      //map.overlayMapTypes.removeAt(0);
   }
}


/* -------------------------------------------------------------------------------- */
function WMSTMACSHeadGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * WMSTILESIZE / zpow, (tile.y + 1) * WMSTILESIZE / zpow);
   var lr = new google.maps.Point((tile.x + 1) * WMSTILESIZE / zpow, (tile.y) * WMSTILESIZE / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);

   var baseURL = "http://baseWMSurl";  //URL hidden
   var endURL = "&LAYERS=0&STYLES=default&BGCOLOR=0xddddff&EXCEPTIONS=application/vnd.ogc.se_inimage&SYMBOLS=ntds&FONTSIZE=medium&FONTSTYLE=plain&MDP=1067&UPDATESEQUENCE=40&TRANSPARENT=true";
   var crs = "EPSG:4326"; 
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var width = WMSTILESIZE.toString();
   var height = WMSTILESIZE.toString();
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image/png"; //type of image returned  or image/jpeg

   var url = baseURL + "VERSION=" + version + "&REQUEST=" + request + "&CRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&FORMAT=" + format + endURL;

   //console.log(url);
   return url;
}

/* -------------------------------------------------------------------------------- */
function WMSTMACSHistoryGetTileUrl(tile, zoom) {
   var projection = window.map.getProjection();
   var zpow = Math.pow(2, zoom);
   var ul = new google.maps.Point(tile.x * WMSTILESIZE / zpow, (tile.y + 1) * WMSTILESIZE / zpow);
   var lr = new google.maps.Point((tile.x + 1) * WMSTILESIZE / zpow, (tile.y) * WMSTILESIZE / zpow);
   var ulw = projection.fromPointToLatLng(ul);
   var lrw = projection.fromPointToLatLng(lr);

   var baseURL = "http://baseWMSurl";  //URL hidden
   var endURL = "&LAYERS=1&STYLES=default&BGCOLOR=0xddddff&EXCEPTIONS=application/vnd.ogc.se_inimage&SYMBOLS=ntds&FONTSIZE=medium&FONTSTYLE=plain&MDP=1067&UPDATESEQUENCE=40&TRANSPARENT=true";
   var crs = "EPSG:4326"; 
   var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
   var width = WMSTILESIZE.toString();
   var height = WMSTILESIZE.toString();
   var version = "1.3.0";
   var request = "GetMap";
   var format = "image/png"; //type of image returned  or image/jpeg

   var url = baseURL + "VERSION=" + version + "&REQUEST=" + request + "&CRS=" + crs + "&BBOX=" + bbox + "&WIDTH=" + width + "&HEIGHT=" + height + "&FORMAT=" + format + endURL;
   console.log(url);
   return url;
}

/* -------------------------------------------------------------------------------- */
function microtime (get_as_float) {
  // http://kevin.vanzonneveld.net
  // +   original by: Paulo Freitas
  // *     example 1: timeStamp = microtime(true);
  // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
  var now = new Date().getTime() / 1000;
  var s = parseInt(now, 10);

  return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

/* -------------------------------------------------------------------------------- */
function sleep(dur) {
 var d = new Date().getTime() + dur;
  while(new Date().getTime() <= d ) {
    //Do nothing
  }
}

/* -------------------------------------------------------------------------------- */
function toHumanTime(unixtime) {
   var date = new Date(unixtime * 1000);
   var humanTime = date.toLocaleString("en-US",{timeZone: "UTC"});
   return humanTime;
}

/* -------------------------------------------------------------------------------- */
function toDate(unixtime) {
   var date = new Date(unixtime * 1000);
   var dateonly = date.getUTCFullYear() + pad(date.getUTCMonth()+1,2) + pad(date.getUTCDate(),2);
   return dateonly;
}

/* -------------------------------------------------------------------------------- */
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

/* -------------------------------------------------------------------------------- */
// Avoid `console` errors in browsers that lack a console, such as IE in non-developer mode
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

