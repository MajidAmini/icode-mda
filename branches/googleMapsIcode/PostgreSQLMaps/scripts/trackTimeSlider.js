// TrackTime slider control --------------------------------------------------------------
// Source: https://github.com/gavinharriss/google-maps-v3-trackTime-control
/*******************************************************************************
  Copyright (c) 2010-2012. Gavin Harriss
  Site: http://www.gavinharriss.com/
  Originally developed for: http://www.topomap.co.nz/

  Licences: Creative Commons Attribution 3.0 New Zealand License
  http://creativecommons.org/licenses/by/3.0/nz/
 ******************************************************************************/
var mapLabelArray = [];
var mapCurrTimeLabel;

function createTrackTimeControl(map, initial, tracks) {
   var closest = [];
   var closest_index = [];
   var timediff = [];

   var sliderImageUrl = "icons/trackTime-slider.png";

   // Create main div to hold the control.
   var trackTimeDiv = document.createElement('DIV');
   trackTimeDiv.setAttribute("style", "margin:5px;overflow-x:hidden;overflow-y:hidden;background:url(" + sliderImageUrl + ") no-repeat;width:265px;height:21px;cursor:pointer;");
   trackTimeDiv.setAttribute("title","view vessel history");

   // Create knob
   var trackTimeKnobDiv = document.createElement('DIV');
   trackTimeKnobDiv.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;background:url(" + sliderImageUrl + ") no-repeat -265px 0;width:14px;height:21px;");
   trackTimeDiv.appendChild(trackTimeKnobDiv);

   var clearTrackDiv = document.createElement('DIV');
   clearTrackDiv.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;vertical-align:top;width:94px;height:26px;");
   clearTrackDiv.innerHTML = '<a href="#" class="link" onclick="clearAllTracks();">Clear all tracks</a>';

   var titleDiv = document.createElement('DIV');
   titleDiv.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;vertical-align:top;width:100px;height:26px;");
   titleDiv.innerHTML = '<b>Track Timeline</b>';

   var timeDiv = document.createElement('DIV');
   timeDiv.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;vertical-align:top;text-align:right;width:150px;height:26px;");
   timeDiv.setAttribute("id", "currentTime");
   //timeDiv.innerHTML = '<b>Track Timeline</b>';


   var trackTimeCtrlKnob = new ExtDraggableObject(trackTimeKnobDiv, {
      restrictY: true,
      container: trackTimeDiv
   });


   for (var i=0; i < tracks.length; i++) {
      //Create the text label once for this track
      var mapLabel = new MapLabel({
         text: '',
         //position: new google.maps.LatLng(5.9,1.30),
         map: map,
         fontSize: 14,
         align: 'left'
      });
      mapLabelArray.push(mapLabel);
   }

   google.maps.event.addDomListener(titleDiv, "click", function () {
      console.debug('Playback tracks history');
      var m=0;
      trackTimeCtrlKnob.setValueX(m);
      myLoop();

      function myLoop () {  
         var playbackTimeout = window.setTimeout(function () {
            m++;
            //console.log(m);
            if (m < 250) {
               trackTimeCtrlKnob.setValueX(m);
               setTrackTime(trackTimeCtrlKnob.valueX(), tracks, closest, closest_index, timediff);
               setClosestMarker(tracks, closest, closest_index, timediff);
               myLoop();
            }
         }
         , 500);  //milliseconds to wait between steps
         google.maps.event.addListenerOnce(map, "click", function () {
            window.clearTimeout(playbackTimeout);
         });
         google.maps.event.addDomListenerOnce(titleDiv, "click", function () {
            window.clearTimeout(playbackTimeout);
         });
         google.maps.event.addDomListener(trackTimeDiv, "mousedown", function (e) {
            var left = findPosLeft(this);
            var x = e.pageX - left - 5; // - 5 as we're using a margin of 5px on the div
            m = x;
            trackTimeCtrlKnob.setValueX(x);
            setTrackTime(x, tracks, closest, closest_index, timediff);
            //Update the closest icon
            setClosestMarker(tracks, closest, closest_index, timediff);
         });
      }
   });

   //Add listeners
   google.maps.event.addListener(trackTimeCtrlKnob, "drag", function () {
      setTrackTime(trackTimeCtrlKnob.valueX(), tracks, closest, closest_index, timediff);
      //Update the closest icon
      setClosestMarker(tracks, closest, closest_index, timediff);

      //Handle the case where user clicks then drags mouse off slider
      google.maps.event.addListener(map, "mouseup", function (e) {
         clearClosestMarker(tracks, closest, closest_index, timediff);
      });
   });

   google.maps.event.addDomListener(trackTimeDiv, "mousedown", function (e) {
      var left = findPosLeft(this);
      var x = e.pageX - left - 5; // - 5 as we're using a margin of 5px on the div
      trackTimeCtrlKnob.setValueX(x);
      setTrackTime(x, tracks, closest, closest_index, timediff);
      //Update the closest icon
      setClosestMarker(tracks, closest, closest_index, timediff);
   });

   google.maps.event.addDomListener(trackTimeDiv, "mouseover", function (e) {
      setClosestMarker(tracks, closest, closest_index, timediff);
   });

   google.maps.event.addDomListener(trackTimeDiv, "mouseout", function (e) {
      clearClosestMarker(tracks, closest, closest_index, timediff);
   });

   //Check if previous track slider already exists
   deleteTrackTimeControl();
   map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(titleDiv);
   map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(timeDiv);
   map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(trackTimeDiv);
   map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(clearTrackDiv);

   // Set initial value
   var initialValue = initial;
   trackTimeCtrlKnob.setValueX(initialValue);
   setTrackTime(initialValue, tracks, closest, closest_index, timediff);
}

function deleteTrackTimeControl() {
   while (map.controls[google.maps.ControlPosition.BOTTOM_CENTER].length != 0) {
      map.controls[google.maps.ControlPosition.BOTTOM_CENTER].pop();
   }
}

function setClosestMarker(tracks, closest, closest_index, timediff) {
   //Loop through each displayed track
   for (var i=0; i < tracks.length; i++) {
      if (tracks[i] == null)
         break;
      //Work on the latest track that was pushed to the tracks (aka tracksDisplayed) array
      var track = tracks[i].trackHistory;
      var trackIcons = tracks[i].trackIcons;

      if (closest[i] != null && closest_index[i] != null) {
         //Change color of closest marker if it is too far off in time (30mins)
         if (timediff[i] < 60*30) {
            trackIcons[closest_index[i]].setIcon({
               path:        'M 0,8 4,8 0,-8 -4,8 z',
               strokeColor: '#404040',
               fillColor:   '#404040',
               fillOpacity: 0.7,
               rotation:    track[closest_index[i]].true_heading
            });
         }
         else {
            trackIcons[closest_index[i]].setIcon({
               path:        'M 0,8 4,8 0,-8 -4,8 z',
               strokeColor: '#a0a0a0',
               fillColor:   '#a0a0a0',
               fillOpacity: 0.6,
               rotation:    track[closest_index[i]].true_heading
            });
         }

         mapLabelArray[i].set('text', toHumanTime(track[closest_index[i]].datetime));
         mapLabelArray[i].set('map', map);

         mapLabelArray[i].bindTo('position', trackIcons[closest_index[i]]);
      }
   }
}

function clearClosestMarker(tracks, closest, closest_index, timediff) {
   //Loop through each displayed track
   for (var i=0; i < tracks.length; i++) {
      if (tracks[i] == null)
         break;
      //Work on the latest track that was pushed to the tracks (aka tracksDisplayed) array
      var track = tracks[i].trackHistory;
      var trackIcons = tracks[i].trackIcons;

      //Return the track icon back to its original style
      if (closest[i] != null && closest_index[i] != null) {
         if (tracks[i].trackTargetStatus[closest_index[i]] == 'T') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsT);
         }
         else if (tracks[i].trackTargetStatus[closest_index[i]] == 'Q') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsQ);
         }
         else if (tracks[i].trackTargetStatus[closest_index[i]] == 'L') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsL);
         }
         else {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptions);
         }
         mapLabelArray[i].setMap(null);
      }
   }
}

function setTrackTime(pixelX, tracks, closest, closest_index, timediff) {
   //Loop through each displayed track
   for (var i=0; i < tracks.length; i++) {
      if (tracks[i] == null)
         break;
      //Work on the latest track that was pushed to the tracks (aka tracksDisplayed) array
      var track = tracks[i].trackHistory;
      var trackIcons = tracks[i].trackIcons;

      var MAX_X_VALUE = 251;  //change this if slider image is changed
      //console.log('Slider x value: ' + pixelX);

      /* Original
      var minTime = parseInt(track[track.length-1].datetime);
      var maxTime = parseInt(track[0].datetime);
      */
      //Round to nearest whole day
      var minTime = parseInt(Math.round(track[track.length-1].datetime/86400)*86400-86400);
      var maxTime = parseInt(Math.round(track[track.length-1].datetime/86400)*86400);

      var timeDiff = maxTime - minTime;

      var scale = timeDiff / MAX_X_VALUE;

      //console.log(minTime);
      //console.log(maxTime);
      //console.log(scale);
      //console.log(pixelX);
      //console.log('Current slider value: ' + Math.round(minTime + pixelX*scale));
      //console.log(trackIcons.length);

      var goal = Math.round(minTime + pixelX*scale);


      $("#currentTime").html(toHumanTime(goal));

      //Clear previously drawn marker and label
      if (closest[i] != null && closest_index[i] != null) {
         if (tracks[i].trackTargetStatus[closest_index[i]] == 'T') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsT);
         }
         else if (tracks[i].trackTargetStatus[closest_index[i]] == 'Q') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsQ);
         }
         else if (tracks[i].trackTargetStatus[closest_index[i]] == 'L') {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptionsL);
         }
         else {
            trackIcons[closest_index[i]].setIcon(tracklineIconsOptions);
         }
         if (mapLabelArray[i] != null) {
            mapLabelArray[i].setMap(null);
         }
         timediff[i] = 99999999;
         closest_index[i] = null;
         closest[i] = null;
      }

      for (var j=0; j < track.length; j++) {
         //console.log(i + ' : ' + track[i].datetime);
         if (closest[i] == null || Math.abs(parseInt(track[j].datetime) - goal) < Math.abs(closest[i] - goal)) {
            closest[i] = parseInt(track[j].datetime);
            closest_index[i] = j;
            timediff[i] = Math.abs(goal - closest[i]);
         }
      }

      //console.log('Closest node time: ' + closest[i]);
      //console.log('Closest node index: ' + closest_index[i]);
   }
}

function findPosLeft(obj) {
   var curleft = 0;
   if (obj.offsetParent) {
      do {
         curleft += obj.offsetLeft;
      } while (obj = obj.offsetParent);
      return curleft;
   }
   return undefined;
}
