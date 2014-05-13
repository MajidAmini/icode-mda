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
		'Database='.$alert_database.';'.
		//'uid='.$odbc_user.'; pwd='.$odbc_password;
		'uid=icodeuser; pwd=icodeuser';

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}


if(count($_GET) > 0) { 
   if (!empty($_GET["alertPolygon"])) { 
      $polygon = (string)$_GET["alertPolygon"];
   }
   if (!empty($_GET["email"])) { 
      $email = (string)$_GET["email"];
   }
}


exit($polygon . ' ' . $email);
//========================================END=============================


//Execute the query
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
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   /*

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


   array_push($vesselarray, $vessel);
   */
}

$memused = memory_get_usage(false);

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, memused => $memused, vessels => $vesselarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>

