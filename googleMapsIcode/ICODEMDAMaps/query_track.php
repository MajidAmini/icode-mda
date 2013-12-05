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

//Query statement
/*
$date = "20130521";  //default date to use
if (!empty($_GET["date"])) {
   $date = (string)$_GET["date"];
}
*/

/*
//if(!empty($_GET["streamid"]) and (string)$_GET["streamid"] == "Laisic_AIS_Track") {
if(!empty($_GET["streamid"]) and (string)$_GET["streamid"] == "shore-radar") {
   $query = "SELECT mmsi, lon, lat, datetime, true_heading, sog, cog, streamid FROM radar_". $date ." A WHERE lon != -999 and mmsi=";
}
else if(!empty($_GET["streamid"]) and (string)$_GET["streamid"] == "r166710001") {
   $query = "SELECT mmsi, lon, lat, datetime, true_heading, sog, cog, streamid, target_status FROM radar_". $date ." A WHERE lon != -999 and mmsi=";
}
else */{
   //$query = "SELECT mmsi, lon, lat, datetime, true_heading, sog, cog, streamid FROM ter_". $date ." A WHERE lon != -999 and mmsi=";
   $query = "SELECT * FROM vessel_history WHERE mmsi=";
}



//Count the number of arguments
if(count($_GET) > 0) {
    if (!empty($_GET["mmsi"])) {
      $query = $query . $_GET["mmsi"];
    }

    //Bound limits not used for track queries
    /*
    if(!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
       !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
          $query = $query . " AND lat > " . $_GET["minlat"] . 
                   " and lon > " . $_GET["minlon"] . 
                   " and lat < " .  $_GET["maxlat"] . 
                   " and lon < " . $_GET["maxlon"];
       }
     */

    //Order track by descending time
    //$query = $query . " ORDER BY datetime DESC";
    $query = $query . " ORDER BY TimeOfFix";

    //Add a limit if chosen
    if (!empty($_GET["limit"])) {
       $limit = $_GET["limit"];
       $query = $query . " LIMIT " . $limit;
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

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, vessels => $vesselarray);
echo json_encode($data);
?>
