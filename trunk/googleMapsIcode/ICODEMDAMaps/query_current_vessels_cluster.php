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


//Query statement - default statement unless user inputs custom statement



//Count the number of arguments
if(count($_GET) > 0) {
   $minlat = $_GET["minlat"];
   $maxlat = $_GET["maxlat"];
   $minlon = $_GET["minlon"];
   $maxlon = $_GET["maxlon"];

   if (!empty($minlat) && !empty($minlon) &&
       !empty($maxlat) && !empty($maxlon)) {
      /*
      if ($maxlon < $minlon) {
         $temp = $maxlon;
         $maxlon = $minlon;
         $minlon = $temp;
      }
      */
      $divlat = ($maxlat - $minlat) / 16;
      $divlon = ($maxlon - $minlon) / 16;
      $query = "SELECT $divlon * (Longitude div $divlon) as 'leftLon', $divlon * (Longitude div $divlon) + $divlon as 'rightLon', $divlat * (Latitude div $divlat) as 'bottomLat', $divlat * (Latitude div $divlat) + $divlat as 'topLat', count(*) as clustersum FROM (SELECT `MMSI`, `CommsID`, `IMONumber`, `CallSign`, `Name`, `VesType`, `Cargo`, `AISClass`, `Length`, `Beam`, `Draft`, `AntOffsetBow`, `AntOffsetPort`, `Destination`, `ETADest`, `PosSource`, `PosQuality`, `FixDTG`, `ROT`, `NavStatus`, `Source`, `TimeOfFix`, `Latitude`, `Longitude`, `SOG`, `Heading`, `RxStnID`, `COG` FROM vessels_memory WHERE (`MMSI`, `TimeOfFix`) IN ( SELECT `MMSI`, max(`TimeOfFix`) FROM vessels_memory GROUP BY MMSI)) VESSELS WHERE";
      $query = $query . " Latitude BETWEEN " . round($minlat,3) . " AND " . round($maxlat,3) . 
               " AND Longitude BETWEEN " .  round($minlon,3) . " AND " . round($maxlon,3);

      //Add timestamp constraint
      if (!empty($_GET["vessel_age"])) {
         $vessel_age = $_GET["vessel_age"];
         $query = $query . " AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
      }

      $query = $query . " GROUP BY $divlon*(Longitude div $divlon), $divlat*(Latitude div $divlat)";
   }
}
else {
   $limit = 10;
   $query = $query . " limit " . $limit;
}

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
$clusterarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   $cluster = array(leftLon=>odbc_result($result,"leftLon"),
                   rightLon=>odbc_result($result,"rightLon"),
                   bottomLat=>odbc_result($result,"bottomLat"),
                   topLat=>odbc_result($result,"topLat"),
                   clustersum=>odbc_result($result,"clustersum"),
   );

   array_push($clusterarray, $cluster);
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, cluster => $clusterarray);
echo json_encode($data);
?>

