/**
 * @name Setup Alerts
 * @author Sparta Cheung, Bryan Bagnall
 * @fileoverview
 * Script to handle setting up alerts
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
var alertPolyon;
var alertPolyonString;
var alertMarkers = [];
var alertPath;

/* -------------------------------------------------------------------------------- */
/**
 * Setup and initalize the alert setup mode
 **/
function setupAlertInitialize() {
   //Don't initialize if the alert dialog window is already opened
   if ($('#setup-alert-modal').dialog("isOpen")) {
      return;
   }

   $('#setup-alert-modal')
   .load('setup-alerts.html', function() {
        $("#dialog").dialog("open");
    })
   .dialog('open');

   //Hide the panel menu to give more room on the maps
   $('#panel').toggle(false);

   initializePolygon();

   //Add listeners to drawing events
   google.maps.event.addListener(map, 'click', addPoint);


   //Listen for end setup mode
   $('#setup-alert-modal').bind('dialogclose', function(event) {
      google.maps.event.clearListeners(map, 'click');
      deletePolygon();
      $('#panel').toggle(true);
   });
}

/* -------------------------------------------------------------------------------- */
/**
 * End the "setup alert" mode
 **/
function setAlertEnd() {
   $('#setup-alert-modal').dialog('close');

   deletePolygon();

   //Show the panel menu to give more room on the maps
   $('#panel').toggle(true);
}

/* -------------------------------------------------------------------------------- */
/**
 * Initialize the polygon
 **/
function initializePolygon() {
   alertPath = new google.maps.MVCArray;

   //Prepare the alertPolygon
   alertPolyon = new google.maps.Polygon({
      strokeWeight: 3,
      fillColor: '#5555FF',
      fillOpacity: 0.2,
      strokeColor: '#5555FF',
      strokeOpacity: 0.8,
      geodesic: true
   });
   alertPolyon.setMap(map);
   alertPolyon.setPaths(new google.maps.MVCArray([alertPath]));
}

/* -------------------------------------------------------------------------------- */
/**
 * Reset and erase the polygon
 **/
function resetPolygon() {
   if (alertPolyon != null) {
      alertPolyon.setMap(null);
      alertPolyon = null;
   }
   initializePolygon();

   //Erase alertMarkers
   for (var i=0; i < alertMarkers.length; i++) {
      alertMarkers[i].setMap(null);
   }
   alertMarkers = [];

   updatePolygonField();
}

/* -------------------------------------------------------------------------------- */
function deletePolygon() {
   alertPath = [];

   if (alertPolyon != null) {
      alertPolyon.setMap(null);
      alertPolyon = null;
   }

   //Erase alertMarkers
   for (var i=0; i < alertMarkers.length; i++) {
      alertMarkers[i].setMap(null);
   }
   alertMarkers = [];
}

/* -------------------------------------------------------------------------------- */
/**
 * Add a polygon vertex
 **/
function addPoint(event) {
   alertPath.insertAt(alertPath.length, event.latLng);

   computeArea();

   var marker = new google.maps.Marker({
      position: event.latLng,
      map: map,
      draggable: true,
      icon: 'http://maps.google.com/mapfiles/ms/micons/purple-dot.png'
   });
   alertMarkers.push(marker);
   marker.setTitle("#" + alertPath.length);

   google.maps.event.addListener(marker, 'rightclick', function() {
      marker.setMap(null);
      for (var i = 0, I = alertMarkers.length; i < I && alertMarkers[i] != marker; ++i);
      alertMarkers.splice(i, 1);
      alertPath.removeAt(i);
      updatePolygonField();
   });

   google.maps.event.addListener(marker, 'dragend', function() {
      for (var i = 0, I = alertMarkers.length; i < I && alertMarkers[i] != marker; ++i);
      alertPath.setAt(i, marker.getPosition());
      
      computeArea();

      updatePolygonField();
   });

   updatePolygonField();
}

/* -------------------------------------------------------------------------------- */
/**
 * Compute the area of the drawn polygon
 **/
function computeArea() {
   var area = google.maps.geometry.spherical.computeArea(alertPath);
   console.log('area = ' + area);

   return area;
}

/* -------------------------------------------------------------------------------- */
/**
 * Update the polygon definition in the textarea field of the form
 **/
function updatePolygonField()
{
   var formdataObject = document.forms['alert_definition'];
   var formdataElement = formdataObject.elements["alertpolygon"];
   //var formdataElement = $('#alertpolygon');

   if(alertPath.getLength() < 3){
      formdataElement.value = '';
      return;
   }
   var coords = '';
   for(var i = 0; i < alertPath.getLength(); i++){
      var point = alertPath.getAt(i);
      coords += point.lng();
      coords += ' ';
      coords += point.lat();
      coords += ',';
   }

   var point = alertPath.getAt(0); 
   coords += point.lng();     //WKT format is (LON, LAT)
   coords += ' ';
   coords += point.lat();     //WKT format is (LON, LAT)

   //Save polygon string definition
   alertPolyonString = 'POLYGON((';
   alertPolyonString += coords;
   alertPolyonString += '))';

   coords = coords.replace(/,/g,",\n");
   formdataElement.value = coords;

   //Increase the size of the textarea showing the coordinates of the alertPolygon
   //$('#polygon').attr('rows', alertPath.length+1);
}

/* -------------------------------------------------------------------------------- */
function saveAlert(){
   //Obtain user's ROI polygon definition
   //TODO: check area of polygon to limit size to prevent long queries
   if (computeArea() > 3000000000) {
      alert('Please draw a smaller polygon.');
      return;
   }       
   var phpWithArg = 'query_setup_alert.php?alertPolygon="' + alertPolyonString + '"';

   //Obtain user's criteria
   var field = $('#alertfield').val();
   var operation = $('#alertoperation').val();
   var value = $('#alertvalue').val();

   if (field == "all" || value == "") {
      //User wants all vessels entering ROI, don't add any vessel contraints
   }
   else {
      //User has specific vessel criteria defined
      phpWithArg += '&field=' + $('#alertfield').val();
      phpWithArg += '&operation=' + $('#alertoperation').val();
      phpWithArg += '&value=' + $('#alertvalue').val();
   }

   var entering = $('#alertentering');
   var exiting = $('#alertexiting');

   if (entering.is(':checked')) {
      phpWithArg += '&entering=true';
   }
   if (exiting.is(':checked')) {
      phpWithArg += '&exiting=true';
   }

   //TODO: check if email is valid and sanitize before using
   phpWithArg += '&email="' + $('#emailaddress').val() + '"';

   //TODO: add pre-built SQL query statement field
   var prebuiltquery = '';

   phpWithArg += '&query="' + prebuiltquery + '"';



   console.log(phpWithArg);

   //Call the PHP script to insert new alert row to alert database
   $.getJSON(
         phpWithArg, 
         function (){ 
            console.log('success');
         }
      )
   .done(function (response) {
      console.log('saveAlert(): ' + response.query);


      //Exit the "setup alert" mode
      setAlertEnd();
   }) // END .done()
   .fail(function() {
      console.log('saveAlert(): ' +  'No response from alert database; error in php?'); 
      return;
   }); //END .fail()
}
