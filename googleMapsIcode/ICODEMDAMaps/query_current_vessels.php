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
		'Database='.$odbc_database.';'.
		'uid='.$odbc_user.'; pwd='.$odbc_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}

if(count($_GET) > 0) { 
   if (!empty($_GET["type"])) { 
      $type = (string)$_GET["type"];

      if ($type == "LAISIC_AIS_TRACK") { 
         //$fromSources = "(select *  from icodemaps.trackdata ORDER by datetime DESC) as maxtime ";
         $fromSources = "select * from icodemaps.trackdata_mem_track_heads";
      } 
      else if ($type == "LAISIC_RADAR") {
         //$fromSources = "(select mmsi,sog,lon,lat,cog,datetime,streamid,target_status,target_acq,trknum,sourceid  from icodemaps.radar_laisic_output ORDER by datetime DESC) as maxtime ";
         $fromSources = "select mmsi,sog,lon,lat,cog,datetime,streamid,target_status,target_acq,trknum,sourceid  from icodemaps.radar_laisic_output_mem_track_heads";
      } 
      else if ($type == "LAISIC_AIS_OBS") { 
         //$fromSources = "select *  from icodemaps.aisobservation";
         $fromSources = "select * from icodemaps.aisobservation_mem_track_heads";
      }
   }
   else {
      /*
         `MMSI`,
         `CommsID`,
         `IMONumber`,
         `CallSign`,
         `Name`,
         `VesType`,
         `Cargo`,
         `AISClass`,
         `Length`,
         `Beam`,
         `Draft`,
         `AntOffsetBow`,
         `AntOffsetPort`,
         `Destination`,
         `ETADest`,
         `PosSource`,
         `PosQuality`,
         `FixDTG`,
         `ROT`,
         `NavStatus`,
         `Source`,
         `TimeOfFix`,
         `Latitude`,
         `Longitude`,
         `SOG`,
         `Heading`,
         `RxStnID`,
         `COG`
         FROM vessels_memory
         WHERE (`MMSI`, `TimeOfFix`) IN
         (
         SELECT 
         `MMSI`,
         max(`TimeOfFix`)
         FROM vessels_memory
         WHERE MMSI=636013848 
         GROUP BY MMSI
         )) VESSELS";
       */
      $fromSources = "(SELECT `MMSI`, `CommsID`, `IMONumber`, `CallSign`, `Name`, `VesType`, `Cargo`, `AISClass`, `Length`, `Beam`, `Draft`, `AntOffsetBow`, `AntOffsetPort`, `Destination`, `ETADest`, `PosSource`, `PosQuality`, `FixDTG`, `ROT`, `NavStatus`, `Source`, `TimeOfFix`, `Latitude`, `Longitude`, `SOG`, `Heading`, `RxStnID`, `COG` FROM vessels_memory WHERE (`MMSI`, `TimeOfFix`) IN ( SELECT `MMSI`, max(`TimeOfFix`) FROM vessels_memory GROUP BY MMSI)) VESSELS";
      //$fromSources = "(SELECT * FROM radar_vessels" . $sources . " UNION SELECT * FROM current_vessels" . $sources . ") VESSELS LEFT OUTER JOIN user_ship_risk ON VESSELS.mmsi = user_ship_risk.mmsi";
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
          $query = $query . " WHERE";
          $query = $query . " Latitude BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
             " AND Longitude BETWEEN " .  round($_GET["minlon"],3) . " AND " . round($_GET["maxlon"],3);
       }
    }

    //Add timestamp constraint
    if (!empty($_GET["vessel_age"])) {
       $vessel_age = $_GET["vessel_age"];
       $query = $query . " AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
    }

    //Add keyword search constraint
    if (!empty($_GET["keyword"])) {
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
   if ($type == "LAISIC_AIS_TRACK") {  
        $vessel = array(trkguid=>htmlspecialchars(odbc_result($result,"trkguid")),
                   updateguid=>htmlspecialchars(odbc_result($result,"updateguid")),
                   trknum=>odbc_result($result,"trknum"),
                   srcguid=>htmlspecialchars(odbc_result($result,"srcguid")),
                   datetime=>odbc_result($result,"datetime"),
                   lat=>addslashes(odbc_result($result,"lat")),
                   lon=>addslashes(odbc_result($result,"lon")),
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
    else if ($type == "LAISIC_RADAR") {
        $vessel = array(mmsi=>odbc_result($result,"mmsi"),
                   navstatus=>odbc_result($result,"navstatus"),
                   sog=>odbc_result($result,"sog"),
                   lon=>addslashes(odbc_result($result,"lon")),
                   lat=>addslashes(odbc_result($result,"lat")),
                   cog=>odbc_result($result,"cog"),
                   datetime=>odbc_result($result,"datetime"),
                   streamid=>htmlspecialchars(odbc_result($result,"streamid")),
                   target_status=>htmlspecialchars(odbc_result($result,"target_status")),
                   target_acq=>htmlspecialchars(odbc_result($result,"target_acq")),
                   trknum=>odbc_result($result,"trknum"),
                   sourceid=>htmlspecialchars(odbc_result($result,"sourceid"))

        );
    }
    else if ($type == "LAISIC_AIS_OBS") {
         $vessel = array(obsguid=>htmlspecialchars(odbc_result($result,"obsguid")),
                   lat=>addslashes(odbc_result($result,"lat")),
                   lon=>addslashes(odbc_result($result,"lon")),
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
       /* Old field names
          $vessel = array(messagetype=>odbc_result($result,"messagetype"),
          mmsi=>odbc_result($result,"mmsi"),
          navstatus=>odbc_result($result,"navstatus"),
          rot=>odbc_result($result,"rot"),
          sog=>odbc_result($result,"sog"),
          lon=>addslashes(odbc_result($result,"lon")),
          lat=>addslashes(odbc_result($result,"lat")),
          cog=>odbc_result($result,"cog"),
          true_heading=>odbc_result($result,"true_heading"),
          datetime=>odbc_result($result,"datetime"),
          imo=>odbc_result($result,"imo"),
          vesselname=>htmlspecialchars(odbc_result($result,"vesselname")),
          vesseltypeint=>odbc_result($result,"vesseltypeint"),
          length=>odbc_result($result,"length"),
          shipwidth=>odbc_result($result,"shipwidth"),
          bow=>odbc_result($result,"bow"),
          stern=>odbc_result($result,"stern"),
          port=>odbc_result($result,"port"),
          starboard=>odbc_result($result,"starboard"),
          draught=>odbc_result($result,"draught"),
          destination=>htmlspecialchars(odbc_result($result,"destination")),
          callsign=>htmlspecialchars(odbc_result($result,"callsign")),
          posaccuracy=>odbc_result($result,"posaccuracy"),
          eta=>odbc_result($result,"eta"),
          posfixtype=>odbc_result($result,"posfixtype"),
          //streamid=>htmlspecialchars(odbc_result($result,"streamid"))
          streamid=>htmlspecialchars(odbc_result($result,"streamid")),
          security_rating=>odbc_result($result,"security_rating"),
          safety_rating=>odbc_result($result,"safety_rating"),
          risk_score_security=>odbc_result($result,"security_score"),
          risk_score_safety=>odbc_result($result,"safety_score")
       );
       */

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
             //security_rating=>odbc_result($result,"security_rating"),
             //safety_rating=>odbc_result($result,"safety_rating"),
             //risk_score_security=>odbc_result($result,"security_score"),
             //risk_score_safety=>odbc_result($result,"safety_score")
             );
    }

    array_push($vesselarray, $vessel);
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vessels => $vesselarray);
echo json_encode($data);
?>

