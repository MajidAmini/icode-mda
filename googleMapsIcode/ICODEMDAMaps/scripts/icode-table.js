/**
 * @name ICODE-MDA Tables
 * @author Sparta Cheung, Bryan Bagnall, Lynne Tablewski
 * @fileoverview
 * Table to be used with ICODE-MDA Maps
 */

/* -------------------------------------------------------------------------------- */
/**
 *  Global objects 
 */
 var vesselArray = [];
 var data;
 var AIStable;
 var LAISICAIStable;
 var ais_table_index;

/* -------------------------------------------------------------------------------- */
/** Initialize, called on main page load
*/
function initialize() {
   data = new google.visualization.DataTable();
   AIStable = new google.visualization.Table(document.getElementById('raw_ais_table'));
   LAISICAIStable = new google.visualization.Table(document.getElementById('laisic_ais_track_table'));
   LAISICRADARtable = new google.visualization.Table(document.getElementById('laisic_radar_table'));
   LAISICAISOBStable= new google.visualization.Table(document.getElementById('laisic_ais_obs_table'));

   ais_table_index = 0;

   //Table click/selection events (for LAISIC debugging)
   handleTableSelection();

   initializeTable();
   drawTable();

   if (localStorage.getItem('query') != null) {
      var query = new String(localStorage.getItem('query'));
      //document.getElementById("query").value = query;
      getAISFromDB(query);
   }
   else {
      document.getElementById("query").value = 'Done.';
   }
   document.getElementById('busy_indicator').style.visibility = 'hidden';
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 */
function handleTableSelection() {
   //test localstorage
   function storageEventHandler(e) {
      if (!e) {
         e = window.event; 
      }
      mapsUpdated(e);
   }
   if (window.addEventListener) {
      window.addEventListener("storage", storageEventHandler, false);
   } 
   else {
      window.attachEvent("onstorage", storageEventHandler);
   };
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 * e: StorageEvent object
 */
function mapsUpdated(e) {
   key = new String(e.key);
   if (key == "query") {
      var query = new String(localStorage.getItem('query'));
      //document.getElementById("query").value = query;
      //Clear vesselArray
      vesselArray = [];
   
      //Clear the table display
      console.log("Clearing table.");
      AIStable.clearChart();
      LAISICAIStable.clearChart();
      LAISICRADARtable.clearChart();
      LAISICAISOBStable.clearChart();

      data.removeRows(0, data.getNumberOfRows());
      ais_table_index = 0;

      getAISFromDB(query);
   }
   if (key.indexOf("vessel") === 0) {
      /*
      //Add to array
      vesselArray.push(key);

      //Get the name of the changed vessel MMSI
      value = new String(localStorage.getItem(key));
      data.addRows(1);
      data.setCell(ais_table_index, 0, parseInt(key.substr(7)));
      ais_table_index = ais_table_index + 1;
      AIStable.draw(data, {showRowNumber: true});
      */
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 * e: StorageEvent object
 */
function initializeTable() {
  data.addColumn('number', 'MMSI');
  data.addColumn('string', 'CommsID');
  data.addColumn('number', 'IMONumber');
  data.addColumn('string', 'CallSign');
  data.addColumn('string', 'Name');
  data.addColumn('string', 'VesType');
  data.addColumn('string', 'Cargo');
  data.addColumn('string', 'AISClass');
  data.addColumn('number', 'Length');
  data.addColumn('number', 'Beam');
  data.addColumn('number', 'Draft');
  data.addColumn('number', 'AntOffsetBow');
  data.addColumn('number', 'AntOffsetPort');
  data.addColumn('string', 'Destination');
  data.addColumn('string', 'ETADest');
  data.addColumn('string', 'PosSource');
  data.addColumn('string', 'PosQuality');
  data.addColumn('string', 'FixDTG');
  data.addColumn('number', 'ROT');
  data.addColumn('string', 'NavStatus');
  data.addColumn('string', 'Source');
  data.addColumn('number', 'TimeOfFix');
  data.addColumn('number', 'Latitude');
  data.addColumn('number', 'Longitude');
  data.addColumn('number', 'SOG');
  data.addColumn('number', 'Heading');
  data.addColumn('string', 'RxStnID');
  data.addColumn('number', 'COG');
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 * e: StorageEvent object
 */
function drawTable() {
  for (var i=0; i < vesselArray.length; i++){
     var vessel = vesselArray[i];

     data.addRows(1);
     data.setCell(ais_table_index, 0, parseInt(vessel.mmsi));
     //commsid
     data.setCell(ais_table_index, 2, parseInt(vessel.imo));
     data.setCell(ais_table_index, 3, vessel.callsign);
     data.setCell(ais_table_index, 4, vessel.vesselname);
     data.setCell(ais_table_index, 5, vessel.vesseltypeint);
     //cargo
     //aisclass
     data.setCell(ais_table_index, 8, parseFloat(vessel.length));
     data.setCell(ais_table_index, 9, parseFloat(vessel.shipwidth));
     data.setCell(ais_table_index, 10, parseFloat(vessel.draught));
     data.setCell(ais_table_index, 11, parseFloat(vessel.bow));
     data.setCell(ais_table_index, 12, parseFloat(vessel.port));
     data.setCell(ais_table_index, 13, vessel.destination);
     data.setCell(ais_table_index, 14, vessel.eta);
     data.setCell(ais_table_index, 15, vessel.posfixtype);
     data.setCell(ais_table_index, 16, vessel.posaccuracy);
     //fixdtg
     data.setCell(ais_table_index, 18, parseFloat(vessel.rot));
     data.setCell(ais_table_index, 19, vessel.navstatus);
     //source
     data.setCell(ais_table_index, 21, parseInt(vessel.datetime));
     data.setCell(ais_table_index, 22, parseFloat(vessel.lat));
     data.setCell(ais_table_index, 23, parseFloat(vessel.lon));
     data.setCell(ais_table_index, 24, parseFloat(vessel.sog));
     data.setCell(ais_table_index, 25, parseFloat(vessel.true_heading));
     data.setCell(ais_table_index, 26, vessel.streamid);
     data.setCell(ais_table_index, 27, parseFloat(vessel.cog));
     ais_table_index = ais_table_index + 1;
  }

  AIStable.draw(data, {showRowNumber: true});
  LAISICAIStable.draw(data, {showRowNumber: true});
  LAISICRADARtable.draw(data, {showRowNumber: true});
  LAISICAISOBStable.draw(data, {showRowNumber: true});

  google.visualization.events.addListener(AIStable, 'select', function() {
        var row = AIStable.getSelection();
        //console.log('You selected ' + data.getValue(row, 0));
        console.log('You selected ' + row.length + ' elements.');

        var visible;
        if (row.length == 0) {
           visible = 1;
        }
        else {
           visible = 0;
        }

        for (var i=0; i < localStorage.length; i++) {
           key = localStorage.key(i);
           if (key.indexOf("vessel-") === 0) {
              localStorage[key] = visible;
           }
        }

        for (var i=0; i < row.length; i++) {
           var mmsi = data.getValue(row[i].row,0);
           //console.log(row[i].row + ' ' + mmsi);
           localStorage["vessel-" + mmsi] = 1;
        }
     });
}


/* -------------------------------------------------------------------------------- */
/** 
 * Get AIS data from XML, which is from database, with bounds.
 *
 * Optional callback argument (4th argument)
 */
function getAISFromDB(query) {
   console.log("Refreshing target points...");
   document.getElementById("query").value = "QUERY RUNNING...";
   document.getElementById('stats_nav').innerHTML = '';
   document.getElementById('busy_indicator').style.visibility = 'visible';


   var phpWithArg;
   phpWithArg = "query_current_vessels.php?query=" + query;

   //Debug query output
   console.log('getAISFromDB(): ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         console.log('getAISFromDB(): ' + response.query);
         //Show the query and put it in the form
         document.getElementById("query").value = response.query;

         //Prepare to grab PHP results as JSON objects
         $.each(response.vessels, function(key,vessel) {
            vesselArray.push(vessel);
         });

         drawTable();

         document.getElementById('busy_indicator').style.visibility = 'hidden';
         document.getElementById('stats_nav').innerHTML = 
            response.resultcount + " results<br>" + 
            Math.round(response.exectime*1000)/1000 + " secs";
      }) //end .done()
      .fail(function() { 
         console.log('getAISFromDB(): ' +  'No response from track query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
         return; 
      }); //end .fail()
}
