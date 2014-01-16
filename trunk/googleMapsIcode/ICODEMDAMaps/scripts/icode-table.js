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
//TODO: change all parallel arrays to using classes
var vesselArray = [];
var LAISICAISTRACKArray = [];
var LAISICRADARArray = [];
var LAISICAISOBSArray = [];

var AISdata;
var LAISICAISTRACKdata;
var LAISICRADARdata;
var LAISICAISOBSdata;

var AIStable;
var LAISICAISTRACKtable;
var LAISICRADARtable;
var LAISICAISOBStable;

var AISdata_index;
var LAISICAISTRACKdata_index;
var LAISICRADARdata_index;
var LAISICAISOBSdata_index;

var NumHistoryTrails;
var HistoryTrailArray = [];      //Array of history trail tabs objects

//Objects for a single history trail tab
function HistoryTrail(trackID, tabIndex, data, dataTable, table) {
   this.trackID = trackID;
   this.tabIndex = tabIndex;
   this.data = data;
   this.dataTable = dataTable;
   this.table = table;
}


/* -------------------------------------------------------------------------------- */
/** Initialize, called on main page load
*/
function initialize() {
   AISdata = new google.visualization.DataTable();
   LAISICAISTRACKdata = new google.visualization.DataTable();
   LAISICRADARdata = new google.visualization.DataTable();
   LAISICAISOBSdata = new google.visualization.DataTable();

   AIStable = new google.visualization.Table(document.getElementById('raw_ais_table'));
   LAISICAISTRACKtable = new google.visualization.Table(document.getElementById('laisic_ais_track_table'));
   LAISICRADARtable = new google.visualization.Table(document.getElementById('laisic_radar_table'));
   LAISICAISOBStable= new google.visualization.Table(document.getElementById('laisic_ais_obs_table'));

   AISdata_index = 0;
   LAISICAISTRACKdata_index = 0;
   LAISICRADARdata_index = 0;
   LAISICAISOBSdata_index = 0;

   //Table click/selection events (for LAISIC debugging)
   handleTableSelection();

   //Add column and set types to all tables
   initializeTable();

   //Load existing queries
   if (localStorage.getItem('query-timestamp') != null) {
      if (localStorage.getItem('query')) {
         getAISFromDB("AIS");
         $('#raw_ais_container').css({"display": "block"});
         $('#laisic_ais_track_container').css({"display": "none"});
         $('#laisic_radar_container').css({"display": "none"});
         $('#laisic_ais_obs_container').css({"display": "none"});
      }
      else if (localStorage.getItem('query-LAISIC_AIS_TRACK') && localStorage.getItem('query-LAISIC_RADAR') && localStorage.getItem('query-LAISIC_AIS_OBS')){ //assume is LAISIC targets for now
         getAISFromDB("LAISIC_AIS_TRACK");
         getAISFromDB("LAISIC_RADAR");
         getAISFromDB("LAISIC_AIS_OBS");
         $('#raw_ais_container').css({"display": "none"});
         $('#laisic_ais_track_container').css({"display": "block"});
         $('#laisic_radar_container').css({"display": "block"});
         $('#laisic_ais_obs_container').css({"display": "block"});
      }
      else {
         //probably cluster query
         drawTable("CLUSTER");
         $('#raw_ais_container').css({"display": "block"});
         $('#laisic_ais_track_container').css({"display": "none"});
         $('#laisic_radar_container').css({"display": "none"});
         $('#laisic_ais_obs_container').css({"display": "none"});
         document.getElementById("query").value = "Cluster query. Nothing to show in tables.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';
      }
   }
   else {
      document.getElementById("query").value = 'Done.';
   }

   //Initialize the number of history trail count
   NumHistoryTrails = 0;

   //Count the number of existing history trails
   for (var i=0; i < localStorage.length; i++) {
      key = localStorage.key(i);
      if (key.indexOf("historytrailquery-") === 0) {
         addHistoryTrailTab(key);      //Add a history trail tab
      }
   }

   document.getElementById('busy_indicator').style.visibility = 'hidden';
}

/* -------------------------------------------------------------------------------- */
/** 
 * Add columns to tables
 */
function initializeTable() {
   AISdata.addColumn('number', 'MMSI');
   AISdata.addColumn('string', 'CommsID');
   AISdata.addColumn('number', 'IMONumber');
   AISdata.addColumn('string', 'CallSign');
   AISdata.addColumn('string', 'Name');
   AISdata.addColumn('string', 'VesType');
   AISdata.addColumn('string', 'Cargo');
   AISdata.addColumn('string', 'AISClass');
   AISdata.addColumn('number', 'Length');
   AISdata.addColumn('number', 'Beam');
   AISdata.addColumn('number', 'Draft');
   AISdata.addColumn('number', 'AntOffsetBow');
   AISdata.addColumn('number', 'AntOffsetPort');
   AISdata.addColumn('string', 'Destination');
   AISdata.addColumn('string', 'ETADest');
   AISdata.addColumn('string', 'PosSource');
   AISdata.addColumn('string', 'PosQuality');
   AISdata.addColumn('string', 'FixDTG');
   AISdata.addColumn('number', 'ROT');
   AISdata.addColumn('string', 'NavStatus');
   AISdata.addColumn('string', 'Source');
   AISdata.addColumn('number', 'TimeOfFix');
   AISdata.addColumn('number', 'Latitude');
   AISdata.addColumn('number', 'Longitude');
   AISdata.addColumn('number', 'SOG');
   AISdata.addColumn('number', 'Heading');
   AISdata.addColumn('string', 'RxStnID');
   AISdata.addColumn('number', 'COG');

   //LAISICAISTRACKdata.addColumn('string', 'trkguid');
   //LAISICAISTRACKdata.addColumn('string', 'updateguid');
   LAISICAISTRACKdata.addColumn('string', 'srcguid');
   LAISICAISTRACKdata.addColumn('number', 'trknum');
   LAISICAISTRACKdata.addColumn('number', 'datetime');
   LAISICAISTRACKdata.addColumn('number', 'Latitude');
   LAISICAISTRACKdata.addColumn('number', 'Longitude');
   LAISICAISTRACKdata.addColumn('number', 'COG');
   LAISICAISTRACKdata.addColumn('number', 'SOG');
   LAISICAISTRACKdata.addColumn('string', 'stage');
   LAISICAISTRACKdata.addColumn('number', 'semimajor');
   LAISICAISTRACKdata.addColumn('number', 'semiminor');
   LAISICAISTRACKdata.addColumn('number', 'orientation');
   LAISICAISTRACKdata.addColumn('number', 'holdtime');
   LAISICAISTRACKdata.addColumn('number', 'hitscount');
   LAISICAISTRACKdata.addColumn('number', 'quality');
   //LAISICAISTRACKdata.addColumn('string', 'source');
   LAISICAISTRACKdata.addColumn('string', 'inttype');
   //LAISICAISTRACKdata.addColumn('string', 'callsign');
   LAISICAISTRACKdata.addColumn('number', 'MMSI');
   //LAISICAISTRACKdata.addColumn('string', 'Vesselname');
   LAISICAISTRACKdata.addColumn('number', 'IMO');

   LAISICRADARdata.addColumn('number', 'MMSI');
   LAISICRADARdata.addColumn('number', 'SOG');
   LAISICRADARdata.addColumn('number', 'Latitude');
   LAISICRADARdata.addColumn('number', 'Longitude');
   LAISICRADARdata.addColumn('number', 'COG');
   LAISICRADARdata.addColumn('number', 'DateTime');
   LAISICRADARdata.addColumn('string', 'StreamID');
   LAISICRADARdata.addColumn('string', 'Target Status');
   LAISICRADARdata.addColumn('string', 'Target Acq');
   LAISICRADARdata.addColumn('string', 'Trknum');
   LAISICRADARdata.addColumn('string', 'SourceID');

   LAISICAISOBSdata.addColumn('string', 'obsguid');
   LAISICAISOBSdata.addColumn('number', 'Latitude');
   LAISICAISOBSdata.addColumn('number', 'Longitude');
   LAISICAISOBSdata.addColumn('number', 'semimajor');
   LAISICAISOBSdata.addColumn('number', 'semiminor');
   LAISICAISOBSdata.addColumn('number', 'orientation');
   LAISICAISOBSdata.addColumn('number', 'COG');
   LAISICAISOBSdata.addColumn('number', 'SOG');
   LAISICAISOBSdata.addColumn('number', 'datetime');
   LAISICAISOBSdata.addColumn('string', 'Callsign');
   LAISICAISOBSdata.addColumn('number', 'MMSI');
   LAISICAISOBSdata.addColumn('string', 'Vesselname');
   LAISICAISOBSdata.addColumn('number', 'IMO');
   LAISICAISOBSdata.addColumn('string', 'StreamID');

   //Setup History Trail table after query is performed to determine column names and types

   //Add table events listeners
   addTableListeners();

   autoSelectedLAISICAISTRACKtable();
   autoSelectedLAISICRADARtable();
   autoSelectedLAISICAISOBStable();

   document.getElementById('laisicaistrack_status').innerHTML = '';
   document.getElementById('laisicradar_status').innerHTML = '';
   document.getElementById('laisicaisobs_status').innerHTML = '';
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

   //Query updated, get new vessels
   //if (key == "query" || key == "query-LAISIC_AIS_TRACK" || key == "query-LAISIC_RADAR" || key == "query-LAISIC_AIS_OBS") {
   if (key == "query-timestamp") {
      //Add slight delay
      setTimeout(function(){
         //Grab vessels with new query
         if (localStorage.getItem('query')) {
            getAISFromDB("AIS");
            $('#raw_ais_container').css({"display": "block"});
            $('#laisic_ais_track_container').css({"display": "none"});
            $('#laisic_radar_container').css({"display": "none"});
            $('#laisic_ais_obs_container').css({"display": "none"});
         }
         else if (localStorage.getItem('query-LAISIC_AIS_TRACK') && localStorage.getItem('query-LAISIC_RADAR') && localStorage.getItem('query-LAISIC_AIS_OBS')) { //assume is LAISIC targets for now
            getAISFromDB("LAISIC_AIS_TRACK");
            getAISFromDB("LAISIC_RADAR");
            getAISFromDB("LAISIC_AIS_OBS");
            $('#raw_ais_container').css({"display": "none"});
            $('#laisic_ais_track_container').css({"display": "block"});
            $('#laisic_radar_container').css({"display": "block"});
            $('#laisic_ais_obs_container').css({"display": "block"});
         }
         else {
            //probably cluster query
            drawTable("CLUSTER");
            $('#raw_ais_container').css({"display": "block"});
            $('#laisic_ais_track_container').css({"display": "none"});
            $('#laisic_radar_container').css({"display": "none"});
            $('#laisic_ais_obs_container').css({"display": "none"});
         }
      }, 500);   //small delay to allow maps to write query strings to localStorage
   }
   else if (key.indexOf("historytrailquery") == 0) {
      if (e.newValue != '' && e.newValue != null) {
         addHistoryTrailTab(key);      //Add a history trail tab
      }
      else {
         removeHistoryTrailTab(key);
      }
   }
   else if (key == "refresh") {
      location.reload();
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Adds a history trail tab
 */
function addHistoryTrailTab(key) {
   var historytrailquery = localStorage.getItem(key);
   var trackID = key.substring(18);

   //append to li list
   HistoryTrailTabs.find(".ui-tabs-nav").append('<li><a href="#tabs-'+trackID+'">Track '+trackID+"</a><span class='ui-icon ui-icon-closethick ui-closable-tab'></span></li>");
   //append to div list
   HistoryTrailTabs.append('<div id="tabs-'+trackID+'" class="tabs"><div id="historytrailtable"><div id="historytrail_table-'+trackID+'" class="table_style"></div></div></div>');

   //Initialize the history trail table objects to be pushed into HistoryTrailArray
   var newHistoryTrail = new HistoryTrail();

   var HistoryTraildataTable = new google.visualization.DataTable();
   var HistoryTrailtable = new google.visualization.Table(document.getElementById('historytrail_table-'+trackID));

   //new
   newHistoryTrail.trackID = trackID;
   newHistoryTrail.dataTable = HistoryTraildataTable;
   newHistoryTrail.table = HistoryTrailtable;
   newHistoryTrail.tabIndex = HistoryTrailArray.length;

   //Call the query and fetch the data, then show it by updating the table
   newHistoryTrail.data = showHistoryTrailTable(historytrailquery, trackID, newHistoryTrail.tabIndex, newHistoryTrail);

   HistoryTrailArray.push(newHistoryTrail);

   //Refresh the tabs to reflect newly added tab
   HistoryTrailTabs.tabs("refresh");
   //Make newest tab active
   HistoryTrailTabs.tabs({active: newHistoryTrail.tabIndex});

   NumHistoryTrails++;
}

/* -------------------------------------------------------------------------------- */
function removeHistoryTrailTab(key) {
   if (NumHistoryTrails > 0) {
      console.debug(key);
      var trackID = key.substring(18);

      $("li[aria-controls='tabs-" + trackID + "']").remove();
      $("#tabs-" + trackID).remove();

      HistoryTrailTabs.tabs("refresh");

      var deleteIndex;
      $.each(HistoryTrailArray, function(index, HistoryTrail){
         if (HistoryTrail.trackID == trackID) {
            deleteIndex = index;
         }
      });

      console.log('Removing history trail ' + trackID + ' of index: ' + deleteIndex);
      HistoryTrailArray.splice(deleteIndex, 1);

      localStorage.removeItem('historytrailquery-' + trackID);
      localStorage.removeItem('historytrailtype-' + trackID);

      NumHistoryTrails--;
      HistoryTrailTabs.tabs( "refresh" );
   }
   if (NumHistoryTrails == 0) {
      console.log('All history trails deleted, hiding table now.');

      //Loop through tabs' li and div and remove them
      $.each($('li[role="tab"]'), function() {
         this.remove();
      });
      $.each($('.tabs'), function() {
         this.remove();
      });
      HistoryTrailTabs.tabs( "refresh" );

      hideHistoryTrailTable();
   }
}

/* -------------------------------------------------------------------------------- */
function showHistoryTrailTable(historytrailquery, trackID, historytrailindex, newHistoryTrail) {
   document.getElementById('data_container').style.width = "60%";
   document.getElementById('historytrail_container').style.visibility = "visible";
   document.getElementById('historytrail_container').style.width = "39%";

   var phpWithArg = "query_track.php?source=" + localStorage.getItem('historytrailtype-'+trackID) + "_HistoryTrail&query=" + historytrailquery;
   console.log(phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         console.log('showHistoryTrailTable(): ' + response.query);
         console.log('showHistoryTrailTable(): ' + 'track history size = ' + response.resultcount);

         //document.getElementById('historytrail_container').innerHTML = response.query;

         var data = [];
         $.each(response.vessels, function(key,vessel) {
            data.push(vessel);
         });

         //new
         newHistoryTrail.data = data;

         drawTable('HistoryTrail-' + localStorage.getItem('historytrailtype-'+trackID), historytrailindex);

         document.getElementById('busy_indicator').style.visibility = 'hidden';
      }) //end .done()
      .fail(function() { 
         console.log('getAISFromDB(): ' +  'No response from track query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';

         return; 
      }); //end .fail()
}

/* -------------------------------------------------------------------------------- */
function hideHistoryTrailTable() {
   document.getElementById('data_container').style.width = "100%";
   document.getElementById('historytrail_container').style.visibility = "hidden";
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear AIS table
 */
function clearAISTable() {
   //Clear the table display
   console.log("Clearing AIS table.");
   AIStable.clearChart();
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear AIS data
 */
function clearAISdata() {
   //Clear the table display
   console.log("Clearing AIS data.");
   vesselArray = [];
   AISdata_index = 0;
   AISdata.removeRows(0,AISdata.getNumberOfRows());
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC AIS TRACK table
 */
function clearLAISICAISTRACKTable() {
   //Clear the table display
   console.log("Clearing LAISIC AIS TRACK table.");
   LAISICAISTRACKtable.clearChart();
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC AIS TRACK data
 */
function clearLAISICAISTRACKdata() {
   //Clear the table display
   console.log("Clearing LAISIC AIS TRACK data.");
   LAISICAISTRACKArray = [];
   LAISICAISTRACKdata_index = 0;
   LAISICAISTRACKdata.removeRows(0,LAISICAISTRACKdata.getNumberOfRows());
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC RADAR table
 */
function clearLAISICRADARTable() {
   //Clear the table display
   console.log("Clearing LAISIC RADAR table.");
   LAISICRADARtable.clearChart();
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC RADAR table
 */
function clearLAISICRADARdata() {
   //Clear the table display
   console.log("Clearing LAISIC RADAR data.");
   LAISICRADARArray = [];
   LAISICRADARdata_index = 0;
   LAISICRADARdata.removeRows(0,LAISICRADARdata.getNumberOfRows());
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC AIS OBS table
 */
function clearLAISICAISOBSTable() {
   //Clear the table display
   console.log("Clearing LAISIC AIS OBS table.");
   LAISICAISOBStable.clearChart();
}

/* -------------------------------------------------------------------------------- */
/** 
 * Clear LAISIC AIS OBS data
 */
function clearLAISICAISOBSdata() {
   //Clear the table display
   console.log("Clearing LAISIC AIS OBS data.");
   LAISICAISOBSArray = [];
   LAISICAISOBSdata_index = 0;
   LAISICAISOBSdata.removeRows(0,LAISICAISOBSdata.getNumberOfRows());
}

/* -------------------------------------------------------------------------------- */
/** 
 * Handle clicking/selection events in LAISIC table
 * e: StorageEvent object
 */
function drawTable(sourceType, historytrailindex) {
   var i;

   var HistoryTraildata_index;         //index for row of history trail for a specific history trail

   switch (sourceType) {
      case "AIS":
         clearAISTable();
         clearLAISICAISTRACKTable();
         clearLAISICRADARTable();
         clearLAISICAISOBSTable();
         //clearHistoryTrailTable();

         clearLAISICAISTRACKdata();
         clearLAISICRADARdata();
         clearLAISICAISOBSdata();
         //clearHistoryTraildata();

         for (i=0; i < vesselArray.length; i++){
            var vessel = vesselArray[i];

            AISdata.addRows(1);
            AISdata.setCell(AISdata_index, 0, parseInt(vessel.mmsi));
            //commsid
            AISdata.setCell(AISdata_index, 2, parseInt(vessel.imo));
            AISdata.setCell(AISdata_index, 3, vessel.callsign);
            AISdata.setCell(AISdata_index, 4, vessel.vesselname);
            AISdata.setCell(AISdata_index, 5, vessel.vesseltypeint);
            //cargo
            //aisclass
            AISdata.setCell(AISdata_index, 8, parseFloat(vessel.length));
            AISdata.setCell(AISdata_index, 9, parseFloat(vessel.shipwidth));
            AISdata.setCell(AISdata_index, 10, parseFloat(vessel.draught));
            AISdata.setCell(AISdata_index, 11, parseFloat(vessel.bow));
            AISdata.setCell(AISdata_index, 12, parseFloat(vessel.port));
            AISdata.setCell(AISdata_index, 13, vessel.destination);
            AISdata.setCell(AISdata_index, 14, vessel.eta);
            AISdata.setCell(AISdata_index, 15, vessel.posfixtype);
            AISdata.setCell(AISdata_index, 16, vessel.posaccuracy);
            //fixdtg
            AISdata.setCell(AISdata_index, 18, parseFloat(vessel.rot));
            AISdata.setCell(AISdata_index, 19, vessel.navstatus);
            //source
            AISdata.setCell(AISdata_index, 21, parseInt(vessel.datetime));
            AISdata.setCell(AISdata_index, 22, parseFloat(vessel.lat));
            AISdata.setCell(AISdata_index, 23, parseFloat(vessel.lon));
            AISdata.setCell(AISdata_index, 24, parseFloat(vessel.sog));
            AISdata.setCell(AISdata_index, 25, parseFloat(vessel.true_heading));
            AISdata.setCell(AISdata_index, 26, vessel.streamid);
            AISdata.setCell(AISdata_index, 27, parseFloat(vessel.cog));
            AISdata_index++;
         }
         break;
      case "LAISIC_AIS_TRACK":
         clearLAISICAISTRACKTable();
         for (i=0; i < LAISICAISTRACKArray.length; i++){
            var vessel = LAISICAISTRACKArray[i];

            LAISICAISTRACKdata.addRows(1);
            //LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 0, vessel.trkguid);
            //LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 1, vessel.updateguid);
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 0, vessel.srcguid);
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 1, parseInt(vessel.trknum));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 2, parseInt(vessel.datetime));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 3, parseFloat(vessel.lat));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 4, parseFloat(vessel.lon));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 5, parseFloat(vessel.cog));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 6, parseFloat(vessel.sog));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 7, vessel.stage);
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 8, parseFloat(vessel.semimajor));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 9, parseFloat(vessel.semiminor));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 10, parseFloat(vessel.orientation));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 11, parseFloat(vessel.holdtime));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 12, parseFloat(vessel.hitscount));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 13, parseFloat(vessel.quality));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 14, vessel.inttype);
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 15, parseInt(vessel.mmsi));
            LAISICAISTRACKdata.setCell(LAISICAISTRACKdata_index, 16, parseInt(vessel.imo));
            LAISICAISTRACKdata_index++;
         }
         break;
      case "LAISIC_RADAR":
         clearLAISICRADARTable();
         for (i=0; i < LAISICRADARArray.length; i++){
            var vessel = LAISICRADARArray[i];

            LAISICRADARdata.addRows(1);
            LAISICRADARdata.setCell(LAISICRADARdata_index, 0, parseInt(vessel.mmsi));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 1, parseFloat(vessel.sog));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 2, parseFloat(vessel.lat));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 3, parseFloat(vessel.lon));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 4, parseFloat(vessel.cog));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 5, parseInt(vessel.datetime));
            LAISICRADARdata.setCell(LAISICRADARdata_index, 6, vessel.streamid);
            LAISICRADARdata.setCell(LAISICRADARdata_index, 7, vessel.target_status);
            LAISICRADARdata.setCell(LAISICRADARdata_index, 8, vessel.target_acq);
            LAISICRADARdata.setCell(LAISICRADARdata_index, 9, vessel.trknum);
            LAISICRADARdata.setCell(LAISICRADARdata_index, 10, vessel.sourceid);
            LAISICRADARdata_index++;
         }
         break;
      case "LAISIC_AIS_OBS":
         clearLAISICAISOBSTable();
         for (i=0; i < LAISICAISOBSArray.length; i++){
            var vessel = LAISICAISOBSArray[i];

            LAISICAISOBSdata.addRows(1);
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 0, vessel.obsguid);
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 1, parseFloat(vessel.lat));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 2, parseFloat(vessel.lon));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 3, parseFloat(vessel.semimajor));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 4, parseFloat(vessel.semiminor));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 5, parseFloat(vessel.orientation));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 6, parseFloat(vessel.cog));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 7, parseFloat(vessel.sog));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 8, parseInt(vessel.datetime));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 9, vessel.callsign);
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 10, parseInt(vessel.mmsi));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 11, vessel.vesselname);
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 12, parseInt(vessel.imo));
            LAISICAISOBSdata.setCell(LAISICAISOBSdata_index, 13, vessel.streamid);
            LAISICAISOBSdata_index++;
         }
         break;
      case "HistoryTrail-AIS":
         //Setup table columns and data according to the type of trail/track being received
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'MMSI');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'TimeOfFix');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Latitude');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Longitude');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'SOG');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Heading');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'RxStnID');

         HistoryTraildata_index = 0;
         for (i=0; i < HistoryTrailArray[historytrailindex].data.length; i++){
            var vessel = HistoryTrailArray[historytrailindex].data[i];

            HistoryTrailArray[historytrailindex].dataTable.addRows(1);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 0, parseInt(vessel.mmsi));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 1, parseInt(vessel.datetime));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 2, parseFloat(vessel.lat));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 3, parseFloat(vessel.lon));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 4, parseFloat(vessel.sog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 5, parseInt(vessel.true_heading));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 6, vessel.streamid);

            HistoryTraildata_index++;
         }

         break;
      case "HistoryTrail-LAISIC_AIS_OBS":
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'obsguid');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'lat');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'lon');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'semimajor');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'semiminor');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'orientation');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'COG');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'SOG');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'datetime');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'callsign');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'MMSI');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'vesselname');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'imo');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'streamid');

         HistoryTraildata_index = 0;
         for (i=0; i < HistoryTrailArray[historytrailindex].data.length; i++){
            var vessel = HistoryTrailArray[historytrailindex].data[i];

            HistoryTrailArray[historytrailindex].dataTable.addRows(1);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 0, vessel.obsguid);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 1, parseFloat(vessel.lat));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 2, parseFloat(vessel.lon));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 3, parseFloat(vessel.semimajor));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 4, parseFloat(vessel.semiminor));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 5, parseFloat(vessel.orientation));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 6, parseFloat(vessel.cog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 7, parseFloat(vessel.sog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 8, parseInt(vessel.datetime));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 9, vessel.callsign);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 10, parseInt(vessel.mmsi));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 11, vessel.vesselname);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 12, parseInt(vessel.imo));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 13, vessel.streamid);

            HistoryTraildata_index++;
         }

         break;
      case "HistoryTrail-LAISIC_RADAR":
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'MMSI');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'TimeOfFix');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Latitude');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Longitude');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'SOG');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'COG');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'StreamID');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Heading');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'Target_Status');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'Target_Acq');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'Trknum');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'SourceID');

         HistoryTraildata_index = 0;
         
         for (i=0; i < HistoryTrailArray[historytrailindex].data.length; i++){
            var vessel = HistoryTrailArray[historytrailindex].data[i];

            HistoryTrailArray[historytrailindex].dataTable.addRows(1);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 0, parseInt(vessel.mmsi));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 1, parseInt(vessel.datetime));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 2, parseFloat(vessel.lat));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 3, parseFloat(vessel.lon));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 4, parseFloat(vessel.sog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 5, parseFloat(vessel.cog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 6, vessel.streamid);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 7, parseFloat(vessel.true_heading));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 8, vessel.target_status);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 9, vessel.target_acq);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 10, parseInt(vessel.trknum));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 11, vessel.sourceid);
            HistoryTraildata_index++;
         }

         break;
      case "HistoryTrail-LAISIC_AIS_TRACK":
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'trkguid');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'updateguid');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'trknum');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'srcguid');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'datetime');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'lat');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'lon');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'cog');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'sog');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'stage');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'semimajor');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'semiminor');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'orientation');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'holdtime');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'hitscount');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'quality');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'source');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'inttype');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'callsign');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'mmsi');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('string', 'vesselname');
         HistoryTrailArray[historytrailindex].dataTable.addColumn('number', 'imo');

         HistoryTraildata_index = 0;
         for (i=0; i < HistoryTrailArray[historytrailindex].data.length; i++){
            var vessel = HistoryTrailArray[historytrailindex].data[i];

            HistoryTrailArray[historytrailindex].dataTable.addRows(1);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 0, vessel.trkguid);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 1, vessel.updateguid);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 2, parseInt(vessel.trknum));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 3, vessel.srcguid);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 4, parseInt(vessel.datetime));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 5, parseFloat(vessel.lat));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 6, parseFloat(vessel.lon));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 7, parseFloat(vessel.cog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 8, parseFloat(vessel.sog));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 9, vessel.stage);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 10, parseFloat(vessel.semimajor));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 11, parseFloat(vessel.semiminor));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 12, parseFloat(vessel.orientation));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 13, parseInt(vessel.holdtime));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 14, parseInt(vessel.hitscount));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 15, parseFloat(vessel.quality));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 16, vessel.source);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 17, vessel.inttype);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 18, vessel.callsign);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 19, parseInt(vessel.mmsi));
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 20, vessel.vesselname);
            HistoryTrailArray[historytrailindex].dataTable.setCell(HistoryTraildata_index, 21, parseInt(vessel.imo));
            HistoryTraildata_index++;
         }

         break;
      case "CLUSTER":
         clearAISTable();
         clearAISdata();

         clearLAISICAISTRACKTable();
         clearLAISICRADARTable();
         clearLAISICAISOBSTable();
         clearHistoryTrailTable();

         clearLAISICAISTRACKdata();
         clearLAISICRADARdata();
         clearLAISICAISOBSdata();
         clearHistoryTraildata();

         console.log("Cluster query, nothing to show in tables.");
         break;
      default:
         //unknown case
         console.log("Unknown case");
   }

   //Refresh the table drawing
   AIStable.draw(AISdata, {showRowNumber: true});
   LAISICAISTRACKtable.draw(LAISICAISTRACKdata, {showRowNumber: true});
   LAISICRADARtable.draw(LAISICRADARdata, {showRowNumber: true});
   LAISICAISOBStable.draw(LAISICAISOBSdata, {showRowNumber: true});
   //TODO: fix array indices
   /*
   $.each(HistoryTrailtableArray, function(){
      this.draw(HistoryTraildataArray[i], {showRowNumber: true});
   });
   */
   for (var i=0; i < NumHistoryTrails; i++) {
      //console.log('Drawing history table ' + i);
      HistoryTrailArray[i].table.draw(HistoryTrailArray[i].dataTable, {showRowNumber: true});
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get AIS data from XML, which is from database, with bounds.
 *
 * Optional callback argument (4th argument)
 */
function addTableListeners() {
   //Add selection listeners
   google.visualization.events.addListener(AIStable, 'select', function() {
         var row = AIStable.getSelection();
         //console.log('You selected ' + AISdata.getValue(row, 0));
         console.log('You selected ' + row.length + ' elements.');

         //Reset all to visible if nothing selected, or to not-visible if more than 0 selected
         var visible = (row.length == 0) ? 1 : 0;

         for (var i=0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (key.indexOf("vessel-") === 0) {
               localStorage[key] = visible;
            }
         }

         for (var i=0; i < row.length; i++) {
            var mmsi = AISdata.getValue(row[i].row, 0);
            //console.log(row[i].row + ' ' + mmsi);
            localStorage["vessel-" + mmsi] = 1;
         }
     });

   //LAISICAISTRACKtable listener
   google.visualization.events.addListener(LAISICAISTRACKtable, 'select', function() {
         var row = LAISICAISTRACKtable.getSelection();
         console.log('You selected ' + row.length + ' elements in LAISICAISTRACKtable');
         document.getElementById('laisicaistrack_status').innerHTML = 'This table currently selected.';         
         //Reset all to visible if nothing selected, or to not-visible if row is selected
         var visible = (row.length == 0) ? 1 : 0;
         if (visible) {
            LAISICRADARtable.setSelection(null);
            LAISICAISOBStable.setSelection(null);
            autoSelectedLAISICRADARtable();
            autoSelectedLAISICAISOBStable();

            document.getElementById('laisicaistrack_status').innerHTML = '';
            document.getElementById('laisicradar_status').innerHTML = '';
            document.getElementById('laisicaisobs_status').innerHTML = '';
         }

         //Handle map target visibility
         for (var i=0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (key.indexOf("laisicaistrack-") === 0) {
               localStorage[key] = visible;
            }
         }

         //Set other table's selection by associating with current table's selection
         for (var i=0; i < row.length; i++) {
            var trknum = LAISICAISTRACKdata.getValue(row[i].row, 1);
            var mmsi = LAISICAISTRACKdata.getValue(row[i].row, 15);
            localStorage["laisicaistrack-" + trknum] = 1;
            
            var selectionArray = [];
            for (var j=0; j < LAISICRADARdata.getNumberOfRows(); j++) {
               var radarmmsi = LAISICRADARdata.getValue(j, 0);
               if (radarmmsi == mmsi) {
                  selectionArray.push({row:j, column: null});
               }
            }
            LAISICRADARtable.setSelection(selectionArray);
            autoSelectedLAISICRADARtable();

            selectionArray = [];
            var srcguid = LAISICAISTRACKdata.getValue(row[i].row, 0);
            for (var j=0; j < LAISICAISOBSdata.getNumberOfRows(); j++) {
               var obsguid = LAISICAISOBSdata.getValue(j, 0);
               if (obsguid == srcguid) {
                  selectionArray.push({row:j, column: null});
               }
            }
            LAISICAISOBStable.setSelection(selectionArray);
            autoSelectedLAISICAISOBStable();
         }
   });

   //LAISICRADARtable listener
   google.visualization.events.addListener(LAISICRADARtable, 'select', function() {
         var row = LAISICRADARtable.getSelection();
         console.log('You selected ' + row.length + ' elements in LAISICRADARtable');
         document.getElementById('laisicradar_status').innerHTML = 'This table currently selected.';

         //Reset all to visible if nothing selected, or to not-visible if row is selected
         var visible = (row.length == 0) ? 1 : 0;
         if (visible) {
            LAISICAISTRACKtable.setSelection(null);
            LAISICAISOBStable.setSelection(null);
            autoSelectedLAISICAISTRACKtable();
            autoSelectedLAISICAISOBStable();

            document.getElementById('laisicaistrack_status').innerHTML = '';
            document.getElementById('laisicradar_status').innerHTML = '';
            document.getElementById('laisicaisobs_status').innerHTML = '';
         }

         for (var i=0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (key.indexOf("laisicradar-") === 0) {
               localStorage[key] = visible;
            }
         }

         //Set other table's selection by associating with current table's selection
         for (var i=0; i < row.length; i++) {
            var trknum = LAISICRADARdata.getValue(row[i].row, 9); //use trknum for RADAR
            localStorage["laisicradar-" + trknum] = 1;
            var mmsi = LAISICRADARdata.getValue(row[i].row, 0);
            
            var selectionArray = [];
            for (var j=0; j < LAISICAISTRACKdata.getNumberOfRows(); j++) {
               var aistrackmmsi = LAISICAISTRACKdata.getValue(j, 15);
               if (aistrackmmsi == mmsi) {
                  selectionArray.push({row:j, column: null});
                  break;
               }
            }
            LAISICAISTRACKtable.setSelection(selectionArray);
            autoSelectedLAISICAISTRACKtable();

            if (selectionArray.length == 1) {
               selectionArray = [];
               var srcguid = LAISICAISTRACKdata.getValue(j, 0);
               for (var j=0; j < LAISICAISOBSdata.getNumberOfRows(); j++) {
                  var obsguid = LAISICAISOBSdata.getValue(j, 0);
                  if (obsguid == srcguid) {
                     selectionArray.push({row:j, column: null});
                  }
               }
               LAISICAISOBStable.setSelection(selectionArray);
            }
            else {
               console.log('No or multiple matches to LAISIC AIS OBS by MMSI!');
            }
            autoSelectedLAISICAISOBStable();
         }
   });

   //LAISICAISOBStable listener
   google.visualization.events.addListener(LAISICAISOBStable, 'select', function() {
         var row = LAISICAISOBStable.getSelection();
         console.log('You selected ' + row.length + ' elements in LAISICAISOBStable');
         document.getElementById('laisicaisobs_status').innerHTML = 'This table currently selected.';

         //Reset all to visible if nothing selected, or to not-visible if row is selected
         var visible = (row.length == 0) ? 1 : 0;
         if (visible) {
            LAISICAISTRACKtable.setSelection(null);
            LAISICRADARtable.setSelection(null);
            autoSelectedLAISICAISTRACKtable();
            autoSelectedLAISICRADARtable();

            document.getElementById('laisicaistrack_status').innerHTML = '';
            document.getElementById('laisicradar_status').innerHTML = '';
            document.getElementById('laisicaisobs_status').innerHTML = '';
         }

         for (var i=0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (key.indexOf("laisicaisobs-") === 0) {
               localStorage[key] = visible;
            }
         }

         //Set other table's selection by associating with current table's selection
         for (var i=0; i < row.length; i++) {
            var obsguid = LAISICAISOBSdata.getValue(row[i].row, 0); //use obsguid for AIS OBS
            localStorage["laisicaisobs-" + obsguid] = 1;

            var selectionArray = [];
            var obsguid = LAISICAISOBSdata.getValue(row[i].row, 0);
            for (var j=0; j < LAISICAISTRACKdata.getNumberOfRows(); j++) {
               var srcguid = LAISICAISTRACKdata.getValue(j, 0);
               if (srcguid == obsguid) {
                  selectionArray.push({row:j, column: null});
                  break;
               }
            }
            LAISICAISTRACKtable.setSelection(selectionArray);
            autoSelectedLAISICAISTRACKtable();

            if (selectionArray.length == 1) {
               selectionArray = [];
               var mmsi = LAISICAISTRACKdata.getValue(j, 15);
               for (var j=0; j < LAISICRADARdata.getNumberOfRows(); j++) {
                  var radarmmsi = LAISICRADARdata.getValue(j, 0);
                  if (radarmmsi == mmsi) {
                     selectionArray.push({row:j, column: null});
                  }
               }
               LAISICRADARtable.setSelection(selectionArray);
            }
            else {
               console.log('No or multiple matches to LAISIC AIS OBS by MMSI!');
            }
            autoSelectedLAISICRADARtable();
         }
   });
}

/* -------------------------------------------------------------------------------- */
function autoSelectedLAISICAISTRACKtable() {
   var row = LAISICAISTRACKtable.getSelection();
   //console.log('Auto selected ' + row.length + ' elements in LAISICAISTRACKtable');
   document.getElementById('laisicaistrack_status').innerHTML = '';
   
   //Reset all to visible if nothing selected, or to not-visible if more than 0 selected
   var visible = (LAISICAISTRACKtable.getSelection().length == 0 &&
                  LAISICRADARtable.getSelection().length == 0 &&
                  LAISICAISOBStable.getSelection().length == 0
                  ) ? 1 : 0;

   //Look for all "laisicaistrack-" variables in localStorage and set all to 1 or 0
   for (var i=0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf("laisicaistrack-") == 0) {
         localStorage[key] = visible;
      }
   }

   var count = 0;
   document.getElementById('laisicaistrack_status').innerHTML = 'Matching row: ';
   for (var i=0; i < row.length; i++) {
      var trknum = LAISICAISTRACKdata.getValue(row[i].row, 1);
      localStorage["laisicaistrack-" + trknum] = 1;
      count++;
      if (row.length > 1 && i > 0) {
         document.getElementById('laisicaistrack_status').innerHTML += ', ';
      }
      document.getElementById('laisicaistrack_status').innerHTML += row[i].row + 1;

      //auto scroll to first matching row
      if (i == 0) {
         var lineheight = parseInt(getStyle('laisic_ais_track_table','line-height'));
         document.getElementById('laisic_ais_track_table').scrollTop = row[i].row * (lineheight+13) + lineheight;
      }
   }
   if (row.length == 0) {
      document.getElementById('laisicaistrack_status').innerHTML = '0 rows matching.';
   }
}

/* -------------------------------------------------------------------------------- */
function autoSelectedLAISICRADARtable() {
   var row = LAISICRADARtable.getSelection();
   //console.log('Auto selected ' + row.length + ' elements in LAISICRADARtable');
   document.getElementById('laisicradar_status').innerHTML = '';
   
   //Reset all to visible if nothing selected, or to not-visible if more than 0 selected
   var visible = (LAISICAISTRACKtable.getSelection().length == 0 &&
                  LAISICRADARtable.getSelection().length == 0 &&
                  LAISICAISOBStable.getSelection().length == 0
                  ) ? 1 : 0;

   for (var i=0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf("laisicradar-") == 0) {
         localStorage[key] = visible;
      }
   }

   var count = 0;
   document.getElementById('laisicradar_status').innerHTML = 'Matching row: ';
   for (var i=0; i < row.length; i++) {
      var trknum = LAISICRADARdata.getValue(row[i].row, 9); //use trknum for RADAR
      //console.log(row[i].row + ' ' + mmsi);
      localStorage["laisicradar-" + trknum] = 1;
      count++;
      if (row.length > 1 && i > 0) {
         document.getElementById('laisicradar_status').innerHTML += ', ';
      }
      document.getElementById('laisicradar_status').innerHTML += row[i].row + 1;

      //auto scroll to first matching row
      if (i == 0) {
         var lineheight = parseInt(getStyle('laisic_radar_table','line-height'));
         document.getElementById('laisic_radar_table').scrollTop = row[i].row * (lineheight+4) + lineheight;
      }
   }
   if (row.length == 0) {
      document.getElementById('laisicradar_status').innerHTML = '0 rows matching.';
   }
}

/* -------------------------------------------------------------------------------- */
function getStyle(el, styleprop){
	el = document.getElementById(el);
	if(window.getComputedStyle){
		return document.defaultView.getComputedStyle(el, null).getPropertyValue(styleprop);
	}
	else if(el.currentStyle){
		return el.currentStyle[styleprop.encamel()];
	}
	return null;
}

/* -------------------------------------------------------------------------------- */
function autoSelectedLAISICAISOBStable() {
   var row = LAISICAISOBStable.getSelection();
   //console.log('Auto selected ' + row.length + ' elements in LAISICAISOBStable');
   document.getElementById('laisicaisobs_status').innerHTML = '';
   
   //Reset all to visible if nothing selected, or to not-visible if more than 0 selected
   var visible = (LAISICAISTRACKtable.getSelection().length == 0 &&
                  LAISICRADARtable.getSelection().length == 0 &&
                  LAISICAISOBStable.getSelection().length == 0
                  ) ? 1 : 0;

   for (var i=0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf("laisicaisobs-") == 0) {
         localStorage[key] = visible;
      }
   }

   var count = 0;
   document.getElementById('laisicaisobs_status').innerHTML = 'Matching row: ';
   for (var i=0; i < row.length; i++) {
      var obsguid = LAISICAISOBSdata.getValue(row[i].row, 0); //use trknum for RADAR
      //console.log(row[i].row + ' ' + mmsi);
      localStorage["laisicaisobs-" + obsguid] = 1;
      count++;
      if (row.length > 1 && i > 0) {
         document.getElementById('laisicaisobs_status').innerHTML += ', ';
      }
      document.getElementById('laisicaisobs_status').innerHTML += row[i].row + 1;

      //auto scroll to first matching row
      if (i == 0) {
         var lineheight = parseInt(getStyle('laisic_ais_obs_table','line-height'));
         document.getElementById('laisic_ais_obs_table').scrollTop = row[i].row * (lineheight+4) + lineheight;
      }
   }
   if (row.length == 0) {
      document.getElementById('laisicaisobs_status').innerHTML = '0 rows matching.';
   }
}

/* -------------------------------------------------------------------------------- */
/** 
 * Get AIS data from XML, which is from database, with bounds.
 *
 * Optional callback argument (4th argument)
 */
function getAISFromDB(sourceType) {
   console.log("Refreshing target points...");
   document.getElementById("query").value = "QUERY RUNNING...";
   document.getElementById('stats_nav').innerHTML = '';
   document.getElementById('busy_indicator').style.visibility = 'visible';

   var query;
   var phpWithArg;

   switch (sourceType) {
      case "AIS":
         query = new String(localStorage.getItem('query'));
         phpWithArg = "query_current_vessels.php?query=" + query;
         phpWithArg += "&source=AIS";
         break;
      case "LAISIC_AIS_TRACK":
         query = new String(localStorage.getItem('query-LAISIC_AIS_TRACK'));
         phpWithArg = "query_current_vessels.php?query=" + query;
         phpWithArg += "&source=LAISIC_AIS_TRACK";
         break;
      case "LAISIC_RADAR":
         query = new String(localStorage.getItem('query-LAISIC_RADAR'));
         phpWithArg = "query_current_vessels.php?query=" + query;
         phpWithArg += "&source=LAISIC_RADAR";
         break;
      case "LAISIC_AIS_OBS":
         query = new String(localStorage.getItem('query-LAISIC_AIS_OBS'));
         phpWithArg = "query_current_vessels.php?query=" + query;
         phpWithArg += "&source=LAISIC_AIS_OBS";
         break;
      case "CLUSTER":
         console.log("Cluster query. Nothing to show in tables.");
         return;
      default:
         console.log("Unknown query source: " + sourceType);
         phpWithArg = "no source type provided";
   }

   //Debug query output
   console.log('getAISFromDB(): ' + phpWithArg);

   //Call PHP and get results as markers
   $.getJSON(
         phpWithArg, // The server URL 
         { }
      ) //end .getJSON()
      .done(function (response) {
         //Prepare to grab PHP results as JSON objects
         console.log("sourceType: " + sourceType);
         switch (sourceType) {
            case "AIS":
               var query = new String(localStorage.getItem('query'));

               console.log('getAISFromDB(): ' + response.query);
               //Show the query and put it in the form
               document.getElementById("query").value = response.query;

               clearAISdata();
               $.each(response.vessels, function(key,vessel) {
                  vesselArray.push(vessel);
               });

               document.getElementById('stats_nav').innerHTML = 
               response.resultcount + " results<br>" + 
               Math.round(response.exectime*1000)/1000 + " secs";
               break;
            case "LAISIC_AIS_TRACK":
               var query = new String(localStorage.getItem('query-LAISIC_AIS_TRACK'));

               console.log('getAISFromDB(): ' + response.query);
               //Show the query and put it in the form
               document.getElementById("query").value = "LAISIC query (AIS Track, RADAR, AIS OBS)";

               clearLAISICAISTRACKdata();
               $.each(response.vessels, function(key,vessel) {
                  LAISICAISTRACKArray.push(vessel);
               });
               break;
            case "LAISIC_RADAR":
               var query = new String(localStorage.getItem('query-LAISIC_RADAR'));

               console.log('getAISFromDB(): ' + response.query);
               //Show the query and put it in the form
               document.getElementById("query").value = "LAISIC query (AIS Track, RADAR, AIS OBS)";

               clearLAISICRADARdata();
               $.each(response.vessels, function(key,vessel) {
                  LAISICRADARArray.push(vessel);
               });
               break;
            case "LAISIC_AIS_OBS":
               var query = new String(localStorage.getItem('query-LAISIC_AIS_OBS'));

               console.log('getAISFromDB(): ' + response.query);
               //Show the query and put it in the form
               document.getElementById("query").value = "LAISIC query (AIS Track, RADAR, AIS OBS)";

               clearLAISICAISOBSdata();
               $.each(response.vessels, function(key,vessel) {
                  LAISICAISOBSArray.push(vessel);
               });
               break;
            default:
               console.log("Unknown query source: " + sourceType);
               phpWithArg = "no source type provided";
         }

         drawTable(sourceType);

         document.getElementById('busy_indicator').style.visibility = 'hidden';
      }) //end .done()
      .fail(function() { 
         console.log('getAISFromDB(): ' +  'No response from track query; error in php?'); 
         document.getElementById("query").value = "ERROR IN QUERY.  PLEASE TRY AGAIN.";
         document.getElementById('busy_indicator').style.visibility = 'hidden';

         return; 
      }); //end .fail()
}
