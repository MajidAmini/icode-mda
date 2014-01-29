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

if(count($_GET) > 0) { 
   if (!empty($_GET["source"])) { 
      $source = (string)$_GET["source"];

      switch ($source) {
         case "LAISIC_AIS_TRACK":
            $fromSources = "(SELECT trkguid, trknum, updateguid, srcguid, datetime, lat as Latitude, lon as Longitude, cog, sog, stage, semimajor, semiminor, orientation, holdtime, hitscount, quality, source, inttype, callsign, mmsi, vesselname, imo FROM " . $laisic_database . ".trackdata_mem_track_heads) VESSELS";
            break;
         case "LAISIC_RADAR":
            $fromSources = "(SELECT mmsi, sog, lon as Longitude, lat as Latitude, cog, datetime, streamid, target_status, target_acq, trknum, sourceid FROM " . $laisic_database . ".radar_laisic_output_mem_track_heads) VESSELS";
            break;
         case "LAISIC_AIS_OBS":
            $fromSources = "(SELECT obsguid, lat as Latitude, lon as Longitude, semimajor, semiminor, orientation, cog, sog, datetime, callsign, mmsi, vesselname, imo, streamid FROM " . $laisic_database . ".aisobservation_mem_track_heads) VESSELS";
            break;
         default: //AIS
            if (empty($_GET["risk"])) {
               //No risk query:
               $fromSources = "(SELECT `MMSI`, `CommsID`, `IMONumber`, `CallSign`, `Name`, `VesType`, `Cargo`, `AISClass`, `Length`, `Beam`, `Draft`, `AntOffsetBow`, `AntOffsetPort`, `Destination`, `ETADest`, `PosSource`, `PosQuality`, `FixDTG`, `ROT`, `NavStatus`, `Source`, `TimeOfFix`, `Latitude`, `Longitude`, `SOG`, `Heading`, `RxStnID`, `COG` FROM vessels_memory WHERE (`MMSI`, `TimeOfFix`) IN ( SELECT `MMSI`, max(`TimeOfFix`) FROM $ais_database.vessels_memory GROUP BY MMSI)) VESSELS";
            }
            else {
               //With risk query:
               $fromSources = "(SELECT `MMSI`, `CommsID`, `IMONumber`, `CallSign`, `Name`, `VesType`, `Cargo`, `AISClass`, `Length`, `Beam`, `Draft`, `AntOffsetBow`, `AntOffsetPort`, `Destination`, `ETADest`, `PosSource`, `PosQuality`, `FixDTG`, `ROT`, `NavStatus`, `Source`, `TimeOfFix`, `Latitude`, `Longitude`, `SOG`, `Heading`, `RxStnID`, `COG` FROM vessels_memory WHERE (`MMSI`, `TimeOfFix`) IN ( SELECT `MMSI`, max(`TimeOfFix`) FROM $ais_database.vessels_memory GROUP BY MMSI)) VESSELS LEFT OUTER JOIN `risk`.user_ship_risk ON VESSELS.mmsi = `risk`.user_ship_risk.mmsi";
            }
      }
   }
}

//Query statement - default statement unless user inputs custom statement
$query = "SELECT * FROM " . $fromSources;


//Count the number of arguments
if(count($_GET) > 0) {
    //custom query, erase everything else and use this query
    if (!empty($_GET["query"])) {
       //TODO: add security checks, e.g. against "DROP TABLE *" commands
       $query = $_GET["query"];
    }

    $basequery = $query;

    //Add geo bounding box constraint
    if (strpos($query, "WHERE Latitude") !== FALSE) {
       //don't add anything to query
    }
    else {
       if (!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
          !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
          //Check if flipped, then probably crossed the meridian (> +180, or < -180)
          if ($_GET["minlon"] > $_GET["maxlon"]) {
             $meridianflag = true;
          }
          else {
             $meridianflag = false;
          }

          //Check if a 'WHERE' has already been inserted into the query, append 'AND' if so.
          // "WHERE TimeOfFix" is for Time Machine queries
          if (strpos($query, "WHERE TimeOfFix") !== FALSE) {
             $query = $query . " AND";
          }
          else {  //Append 'WHERE' since there is no previous WHERE
             $query = $query . " WHERE";
          }

          if ($meridianflag == false) { //Handle normal case
             $query = $query . " Latitude BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
                " AND Longitude BETWEEN " .  round($_GET["minlon"],3) . " AND " . round($_GET["maxlon"],3);
          }
          else {
             $query = $query . " Latitude BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
                  " AND (Longitude BETWEEN -180 AND " . round($_GET["maxlon"],3) .
                  " OR Longitude BETWEEN " . round($_GET["minlon"],3) . " AND 180 )";
          }
       }
    }

    /*
    if (!empty($_GET["risk"])) {
       $query = $query . " AND `risk`.user_ship_risk.user_id = 'jstastny'";
    }
    */

    //Add timestamp constraint, only for AIS tracks
    if (!empty($_GET["vessel_age"]) && $source === "AIS") {
       $vessel_age = $_GET["vessel_age"];
       $query = $query . " AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
    }

    //Add keyword search constraint
    if (!empty($_GET["keyword"]) && $source === "AIS") {
       $keyword = $_GET["keyword"];
       $query = $query . " AND (MMSI like ('%" . $keyword . "%') OR " . 
                         "IMONumber like ('%" . $keyword . "%') OR " . 
                         "Name like ('%" . $keyword . "%') OR " . 
                         "Destination like ('%" . $keyword . "%') OR " . 
                         "CallSign like ('%" . $keyword . "%') OR " . 
                         "RxStnID like ('%" . $keyword . "%'))";
    }

    //Add limit contraint
    if (!empty($_GET["limit"])) {
       $limit = $_GET["limit"];
       $query = $query . " limit " . $limit;
    }

    //?
    if (empty($_GET["query"])) {
       $query = $query . " ORDER BY VESSELS.MMSI";
    }

    //For Time Machine
    if (strpos($query, "WHERE TimeOfFix") !== FALSE) {
       //$query = $query . " GROUP BY MMSI) B ON A.mmsi = B.mmsi GROUP BY MMSI";
       $query = $query . " GROUP BY MMSI) vm2 ON (vm1.MMSI = vm2.MMSI AND vm1.TimeOfFix = vm2.maxtime)) B ON A.MMSI = B.MMSI GROUP BY MMSI";
    }
}
else {
    //Default query, just limit to 10 row results
    $limit = 10;
    $query = $query . " limit " . $limit;
}

//Execute the query
$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);;
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

//echo json_encode(array(query => $query));
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Output JSON object per row
   if ($source === "LAISIC_AIS_TRACK") {  
        $vessel = array(trkguid=>htmlspecialchars(odbc_result($result,"trkguid")),
                   trknum=>odbc_result($result,"trknum"),
                   updateguid=>htmlspecialchars(odbc_result($result,"updateguid")),
                   srcguid=>htmlspecialchars(odbc_result($result,"srcguid")),
                   datetime=>odbc_result($result,"datetime"),
                   lat=>addslashes(odbc_result($result,"Latitude")),
                   lon=>addslashes(odbc_result($result,"Longitude")),
                   cog=>odbc_result($result,"cog"),
                   sog=>odbc_result($result,"sog"),
                   stage=>htmlspecialchars(odbc_result($result,"stage")),
                   semimajor=>odbc_result($result,"semimajor"),
                   semiminor=>odbc_result($result,"semiminor"),
                   orientation=>odbc_result($result,"orientation"),
                   holdtime=>odbc_result($result,"holdtime"),
                   hitscount=>odbc_result($result,"hitscount"),
                   quality=>odbc_result($result,"quality"),
                   source=>htmlspecialchars(odbc_result($result,"source")),
                   inttype=>htmlspecialchars(odbc_result($result,"inttype")),
                   callsign=>htmlspecialchars(odbc_result($result,"callsign")),
                   mmsi=>odbc_result($result,"mmsi"),
                   vesselname=>htmlspecialchars(odbc_result($result,"vesselname")),
                   imo=>odbc_result($result,"imo")
           );
    }
    else if ($source === "LAISIC_RADAR") {
        $vessel = array(mmsi=>odbc_result($result,"mmsi"),
                   sog=>odbc_result($result,"sog"),
                   lon=>addslashes(odbc_result($result,"Longitude")),
                   lat=>addslashes(odbc_result($result,"Latitude")),
                   cog=>odbc_result($result,"cog"),
                   datetime=>odbc_result($result,"datetime"),
                   streamid=>htmlspecialchars(odbc_result($result,"streamid")),
                   target_status=>htmlspecialchars(odbc_result($result,"target_status")),
                   target_acq=>htmlspecialchars(odbc_result($result,"target_acq")),
                   trknum=>odbc_result($result,"trknum"),
                   sourceid=>htmlspecialchars(odbc_result($result,"sourceid"))
           );
    }
    else if ($source === "LAISIC_AIS_OBS") {
         $vessel = array(obsguid=>htmlspecialchars(odbc_result($result,"obsguid")),
                   lat=>addslashes(odbc_result($result,"Latitude")),
                   lon=>addslashes(odbc_result($result,"Longitude")),
                   semiminor=>odbc_result($result,"semiminor"),
                   semimajor=>odbc_result($result,"semimajor"),          
                   orientation=>odbc_result($result,"orientation"),  
                   cog=>odbc_result($result,"cog"),
                   sog=>odbc_result($result,"sog"),
                   datetime=>odbc_result($result,"datetime"),
                   callsign=>htmlspecialchars(odbc_result($result,"callsign")),
                   mmsi=>odbc_result($result,"mmsi"),
                   vesselname=>htmlspecialchars(odbc_result($result,"vesselname")),
                   imo=>odbc_result($result,"imo"),
                   streamid=>htmlspecialchars(odbc_result($result,"streamid"))      
           );
    }
    else {
       //Extract the vessel type number only
       $pos = strpos(odbc_result($result,"VesType"), '-');
       $vesseltype = substr(odbc_result($result,"VesType"), 0, $pos);

       //Fix the type 60-99 types, SeaVision format skipped the trailing '0'
       if ($vesseltype == '6' OR $vesseltype == '7' OR $vesseltype == '8' OR $vesseltype == '9')
          $vesseltype = $vesseltype . '0';

       //SeaVision field names
       $vessel = array(mmsi=>odbc_result($result,"MMSI"),
             navstatus=>odbc_result($result,"NavStatus"),
             rot=>odbc_result($result,"ROT"),
             sog=>odbc_result($result,"SOG"),
             lon=>odbc_result($result,"Longitude"),
             lat=>odbc_result($result,"Latitude"),
             cog=>odbc_result($result,"COG"),
             true_heading=>odbc_result($result,"Heading"),
             datetime=>odbc_result($result,"TimeOfFix"),
             imo=>odbc_result($result,"IMONumber"),
             vesselname=>htmlspecialchars(odbc_result($result,"Name")),
             vesseltypeint=>$vesseltype,
             length=>odbc_result($result,"Length"),
             shipwidth=>odbc_result($result,"Beam"),
             bow=>odbc_result($result,"AntOffsetBow"),
             port=>odbc_result($result,"AntOffsetPort"),
             draught=>odbc_result($result,"Draft"),
             destination=>htmlspecialchars(odbc_result($result,"Destination")),
             callsign=>htmlspecialchars(odbc_result($result,"CallSign")),
             posaccuracy=>odbc_result($result,"PosQuality"),
             eta=>odbc_result($result,"ETADest"),
             posfixtype=>odbc_result($result,"PosSource"),
             streamid=>htmlspecialchars(odbc_result($result,"RxStnID")),
             security_rating=>odbc_result($result,"security_rating"),
             safety_rating=>odbc_result($result,"safety_rating"),
             risk_score_security=>odbc_result($result,"security_score"),
             risk_score_safety=>odbc_result($result,"safety_score")
          );
    }

    array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vessels => $vesselarray);
echo json_encode($data);
?>

