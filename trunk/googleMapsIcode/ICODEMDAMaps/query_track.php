<?php
//Start execution time tracker
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$starttime = $mtime; 


//-----------------------------------------------------------------------------
//Database execution
//Keep database connection information secure
require("phpsql_dbinfo.php");


/* ************************************************** */

/* Building DSN */
$dsn =  'DRIVER={'.$odbc_driver.'};'.
		'Server='.$odbc_host.';'.
		'Database='.$ais_database.';'.
		'uid='.$odbc_user.'; pwd='.$odbc_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
   exit("Connection Failed: " . $conn);
}

//Count the number of arguments
if(count($_GET) > 0) {
   /* Check target source, start building the query */
   if(!empty($_GET["source"]) and (string)$_GET["source"] == "LAISIC_AIS_TRACK") {
      $query = "SELECT trkguid, updateguid, trknum, srcguid, datetime as TimeOfFix, lat as Latitude, lon as Longitude, cog, sog, stage, semimajor, semiminor, orientation, holdtime, hitscount, quality, source, inttype, callsign, mmsi, vesselname, imo FROM icodemaps.trackdata WHERE trknum=";
      if (!empty($_GET["trknum"])) {
         $query = $query . (string)$_GET["trknum"];
      }      
   }
   else if(!empty($_GET["source"]) and (string)$_GET["source"] == "LAISIC_RADAR") {
      $query = "SELECT messagetype, mmsi, navstatus, rot, sog, lon as Longitude, lat as Latitude, cog, true_heading, datetime as TimeOfFix, imo, vesselname, vesseltypeint, length, shipwidth, bow, stern, port, starboard, draught, destination, callsign, posaccuracy, eta, posfixtype, streamid, target_status, target_acq, trknum, sourceid FROM icodemaps.radar_laisic_output WHERE trknum=";
      if (!empty($_GET["trknum"])) {
         $query = $query . (string)$_GET["trknum"];
      }
   }
   else if(!empty($_GET["source"]) and (string)$_GET["source"] == "LAISIC_AIS_OBS") {
      $query = "SELECT obsguid, lat as Latitude, lon as Longitude, semiminor, semimajor, orientation, cog, sog, datetime as TimeOfFix, callsign, mmsi, vesselname, imo, streamid FROM icodemaps.aisobservation WHERE mmsi=";
   }
   else {
      $query = "SELECT * FROM vessel_history WHERE mmsi=";
   }

   //Add MMSI to query track for
   if (!empty($_GET["mmsi"])) {
      $query = $query . $_GET["mmsi"];
   }

   //Add history trail length if defined
   if (!empty($_GET["history_trail_length"])) {
      $history_trail_length = $_GET["history_trail_length"];

      if (!empty($_GET["timeend"])) {
         $timeend = $_GET["timeend"];
         $query = $query . " AND TimeOfFix < $timeend";
      }
      if (!empty($_GET["timestart"])) {
         $timestart = $_GET["timestart"];
         $query = $query . " AND TimeOfFix > ($timestart - 60*60*24*$history_trail_length)";
      }
      else {
         $query = $query . " AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*24*$history_trail_length)";
      }
   }

   $query = $query . " ORDER BY TimeOfFix";

   //Add a limit if chosen
   if (!empty($_GET["limit"])) {
      $limit = $_GET["limit"];
      $query = $query . " LIMIT " . $limit;
   }

   if (!empty($_GET["source"])) {
      $source = $_GET["source"];
   }

   //For custom query (used in LAISIC tables)
   if (!empty($_GET["query"])) {
      $query = $_GET["query"];
   }
}
else {   //This case should not happen for track fetching (user must supply MMSI for query)
   $limit = 10;
   $query = $query . " 1193046";
   $query = $query . " ORDER BY TimeOfFix";
   $query = $query . " LIMIT " . $limit;
}

$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()));;
//-----------------------------------------------------------------------------


//End execution time
$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1] + $mtime[0]; 
$endtime = $mtime; 
$totaltime = ($endtime - $starttime); 


// Prevent caching.
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 01 Jan 1996 00:00:00 GMT');

// The JSON standard MIME header.
header('Content-type: application/json');

//echo json_encode(array(query => $query));s
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Output JSON object per row
   if ($source === "LAISIC_AIS_TRACK") {
      $vessel = array(mmsi=>odbc_result($result,"MMSI"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      sog=>odbc_result($result,"SOG"),
                      cog=>odbc_result($result,"COG"),
                      semimajor=>odbc_result($result,"semimajor"),
                      semiminor=>odbc_result($result,"semiminor"),
                      orientation=>odbc_result($result,"orientation"),
                      streamid=>odbc_result($result,"RxStnID"),
                      true_heading=>odbc_result($result,"Heading"),
                      target_status=>odbc_result($result,"target_status")
            );
      array_push($vesselarray, $vessel);
   }
   else if ($source === "LAISIC_AIS_TRACK_HistoryTrail") {
      $vessel = array(trkguid=>odbc_result($result,"trkguid"),
                      updateguid=>odbc_result($result,"updateguid"),
                      trknum=>odbc_result($result,"trknum"),
                      srcguid=>odbc_result($result,"srcguid"),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      cog=>odbc_result($result,"COG"),
                      sog=>odbc_result($result,"SOG"),
                      stage=>odbc_result($result,"stage"),
                      semimajor=>odbc_result($result,"semimajor"),
                      semiminor=>odbc_result($result,"semiminor"),
                      orientation=>odbc_result($result,"orientation"),
                      holdtime=>odbc_result($result,"holdtime"),
                      hitscount=>odbc_result($result,"hitscount"),
                      quality=>odbc_result($result,"quality"),
                      source=>odbc_result($result,"source"),
                      inttype=>odbc_result($result,"inttype"),
                      callsign=>odbc_result($result,"callsign"),
                      mmsi=>odbc_result($result,"MMSI"),
                      vesselname=>odbc_result($result,"vesselname"),
                      imo=>odbc_result($result,"imo"),
            );
      array_push($vesselarray, $vessel);
   }
   else if ($source === "LAISIC_RADAR" || $source === "LAISIC_RADAR_HistoryTrail") {
      $vessel = array(mmsi=>odbc_result($result,"MMSI"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      sog=>odbc_result($result,"SOG"),
                      cog=>odbc_result($result,"COG"),
                      streamid=>odbc_result($result,"StreamID"),
                      true_heading=>odbc_result($result,"true_heading"),
                      target_status=>odbc_result($result,"target_status"),
                      target_acq=>odbc_result($result,"target_acq"),
                      trknum=>odbc_result($result,"trknum"),
                      sourceid=>odbc_result($result,"sourceid")
            );
      array_push($vesselarray, $vessel);
   }
   else if ($source === "LAISIC_AIS_OBS") {
      $vessel = array(mmsi=>odbc_result($result,"MMSI"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      sog=>odbc_result($result,"SOG"),
                      cog=>odbc_result($result,"COG"),
                      streamid=>odbc_result($result,"RxStnID"),
                      true_heading=>odbc_result($result,"Heading"),
                      target_status=>odbc_result($result,"target_status")
            );
      array_push($vesselarray, $vessel);
   }
   else if ($source === "LAISIC_AIS_OBS_HistoryTrail") {
      $vessel = array(obsguid=>odbc_result($result,"obsguid"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      semimajor=>addslashes(odbc_result($result,"semimajor")),
                      semiminor=>addslashes(odbc_result($result,"semiminor")),
                      orientation=>addslashes(odbc_result($result,"orientation")),
                      cog=>odbc_result($result,"COG"),
                      sog=>odbc_result($result,"SOG"),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      callsign=>odbc_result($result,"callsign"),
                      mmsi=>odbc_result($result,"MMSI"),
                      vesselname=>odbc_result($result,"vesselname"),
                      imo=>odbc_result($result,"imo"),
                      streamid=>odbc_result($result,"streamid")
            );
      array_push($vesselarray, $vessel);
   }
   else {
      $vessel = array(mmsi=>odbc_result($result,"MMSI"),
                      datetime=>odbc_result($result,"TimeOfFix"),
                      lat=>addslashes(odbc_result($result,"Latitude")),
                      lon=>addslashes(odbc_result($result,"Longitude")),
                      sog=>odbc_result($result,"SOG"),
                      true_heading=>odbc_result($result,"Heading"),
                      streamid=>odbc_result($result,"RxStnID"),
            );
      array_push($vesselarray, $vessel);
   }
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, vessels => $vesselarray);
echo json_encode($data);
?>
