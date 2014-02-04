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
		'Database='.$port_database.';'.
		'uid='.$odbc_user.'; pwd='.$odbc_password;

/* Connecting */
$connection = @odbc_connect($dsn, '', '') or die('Connection error: '.htmlspecialchars(odbc_errormsg()));

/* Check connection */
if (!$connection) {
    exit("Connection Failed: " . $conn);
}


//TEMP TODO: testing WROS port table
if (!empty($_GET["wrosports"])) {
   $port_database = 'wros';
   //Query statement
   $query = "SELECT PortName as main_port_name, Country as country_code, if(LatitudeIndicator='N',LatitudeDegrees+LatitudeMinutes/60,-(LatitudeDegrees+LatitudeMinutes/60)) as Latitude, if(LongitudeIndicator='E',LongitudeDegrees+LongitudeMinutes/60,-(LongitudeDegrees+LongitudeMinutes/60)) as Longitude FROM $port_database.ports";

   //Count the number of arguments
   if(count($_GET) > 0) {
      //Bound limits
      if(!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
         !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
            $query = $query . " WHERE if(LatitudeIndicator='N',LatitudeDegrees+LatitudeMinutes/60,-(LatitudeDegrees+LatitudeMinutes/60)) BETWEEN " . $_GET["minlat"] . " AND " . $_GET["maxlat"] . 
               " AND if(LongitudeIndicator='E',LongitudeDegrees+LongitudeMinutes/60,-(LongitudeDegrees+LongitudeMinutes/60)) BETWEEN " .  $_GET["minlon"] . " AND " . $_GET["maxlon"];
         }
   }
   else { //Fetch all ports
   }
}
else {

//Query statement
//$query = "SELECT main_port_name, latitude_degrees, latitude_minutes, latitude_hemisphere, longitude_degrees, longitude_minutes, longitude_hemisphere from $port_database.wpi_data";
$query = "SELECT main_port_name, wpi_country_code as country_code, if(latitude_hemisphere='N',latitude_degrees+latitude_minutes/60,-(latitude_degrees+latitude_minutes/60)) as latitude, if(longitude_hemisphere='E',longitude_degrees+longitude_minutes/60,-(longitude_degrees+longitude_minutes/60)) as longitude from $port_database.wpi_data";

//Count the number of arguments
if(count($_GET) > 0) {
    //Bound limits
   if(!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
      !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
         $query = $query . " WHERE if(latitude_hemisphere='N',latitude_degrees+latitude_minutes/60,-(latitude_degrees+latitude_minutes/60)) BETWEEN " . $_GET["minlat"] . " AND " . $_GET["maxlat"] . 
            " AND if(longitude_hemisphere='E',longitude_degrees+longitude_minutes/60,-(longitude_degrees+longitude_minutes/60)) BETWEEN " .  $_GET["minlon"] . " AND " . $_GET["maxlon"];
       }
}
else { //Fetch all ports
}

//TODO DONE after next brace
}  //END else

//Execute the query
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

//echo json_encode(array(query => $query));
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$portarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   /*
   //Decimal Degrees = Degrees + minutes/60 + seconds/3600
   $lat_deg = odbc_result($result,"latitude_degrees");
   $lat_minute = odbc_result($result,"latitude_minutes");
   $lat = $lat_deg + $lat_minute / 60;

   if (odbc_result($result,"latitude_hemisphere") === 'S')
      $lat = - $lat;

   $lon_deg = odbc_result($result,"longitude_degrees");
   $lon_minute = odbc_result($result,"longitude_minutes");
   $lon = $lon_deg + $lon_minute / 60;

   if (odbc_result($result,"longitude_hemisphere") === 'W')
      $lon = - $lon;
    */

   //Output JSON object per row
   $port = array(port_name=>addslashes(odbc_result($result,"main_port_name")),
                 country_code=>odbc_result($result,"country_code"),
                 latitude=>odbc_result($result,"latitude"),
                 longitude=>odbc_result($result,"longitude")
   );
   array_push($portarray, $port);
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, ports => $portarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
