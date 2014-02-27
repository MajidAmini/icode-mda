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


//Query statement - default statement unless user inputs custom statement


$iGridRows = 16;
$iGridCols = 32;

$iMinClusterSize = 10;
$latestpositionsfrommemorytable = "SELECT * FROM vessels_memory WHERE (RxStnID = 'Local' OR RxStnID <> 'Local')";

//Add timestamp constraint
if (!empty($_GET["vessel_age"])) {
   $vessel_age = $_GET["vessel_age"];
   $timeconstraint = " AND TimeOfFix > (UNIX_TIMESTAMP(NOW()) - 60*60*$vessel_age)";
   $latestpositionsfrommemorytable .= $timeconstraint;
}

//Count the number of arguments
if(count($_GET) > 0) {
   $minlat = $_GET["minlat"];
   $maxlat = $_GET["maxlat"];
   $minlon = $_GET["minlon"];
   $maxlon = $_GET["maxlon"];

   /*
   //Check if flipped, then probably crossed the meridian (> +180, or < -180)
   if ($minlon > $maxlon) {
      $meridianflag = true;
   }
   else {
      $meridianflag = false;
   }
   */

   if (!empty($minlat) && !empty($minlon) &&
       !empty($maxlat) && !empty($maxlon)) {
      //$divlat = round( ($maxlat - $minlat) / 16, 3 );
      //$divlon = round( ($maxlon - $minlon) / 16, 3 );

      //TEST VOLPE's method
      /*
         //max lat/lon
         //difference 
         //find a common number that matches cluster, 8x8, 0 1 2 3 4 etc 7, 3 degrees every grid
         //div, round down
         //x1000 big number, 1001;  turn map to whole numbers
         //thousands = longitudes, 1's = latitude
       */
      $dlat = $maxlat-$minlat;
      $dlon = $maxlon-$minlon;

      if ($minlon > $maxlon) {
         $dlon = $maxlon+360-$minlon;
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND ((Longitude > $minlon AND Longitude <= 180.0) OR (Longitude < $maxlon AND Longitude >= -180.0))";
      }
      else {
         $geobounds = "Latitude > $minlat AND Latitude < $maxlat AND Longitude > $minlon AND Longitude < $maxlon";
      }

      $vessel_age = $_GET["vessel_age"];

      //Build main cluster query
      $query = "
SELECT
   $dlat * (FLOOR($iGridRows * (Latitude - $minlat) / $dlat) + 0.5) / $iGridRows + $minlat - $dlat/$iGridRows/2 AS bottomLat,
   $dlat * (FLOOR($iGridRows * (Latitude - $minlat) / $dlat) + 0.5) / $iGridRows + $minlat + $dlat/$iGridRows/2 AS topLat,
   $dlon * (FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon) + 0.5) / $iGridCols + $minlon - $dlon/$iGridCols/2 AS leftLon,
   $dlon * (FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon) + 0.5) / $iGridCols + $minlon + $dlon/$iGridCols/2 AS rightLon,
   count(*) AS clustersum
FROM
   (SELECT * FROM
      ($latestpositionsfrommemorytable) AS tmp1
   GROUP BY mmsi) AS tmp2
WHERE ($geobounds) 
GROUP BY FLOOR($iGridRows * (Latitude - $minlat) / $dlat) * 1000000 + FLOOR($iGridCols * (IF(Longitude > $minlon, Longitude, Longitude + 360.0) - $minlon) / $dlon);";
//HAVING clustersum >= $iMinClusterSize;";
//

      //Remove special characters
      $query = trim(preg_replace('/\s+/', ' ', $query));
   }
}
else {
   
}


$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()).' // '.$query);
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

   /*
   $cluster = array(lat=>odbc_result($result,"Lat"),
                   lon=>odbc_result($result,"Lon"),
                   clustersum=>odbc_result($result,"clustersum"),
    */

   $cluster = array(leftLon=>odbc_result($result,"leftLon"),
                   rightLon=>odbc_result($result,"rightLon"),
                   bottomLat=>odbc_result($result,"bottomLat"),
                   topLat=>odbc_result($result,"topLat"),
                   clustersum=>odbc_result($result,"clustersum"),
   );

   array_push($clusterarray, $cluster);
}

$memused = memory_get_usage(false);

$data = array(minlat => $minlat, maxlat => $maxlat, minlon => $minlon, maxlon => $maxlon, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, cluster => $clusterarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

