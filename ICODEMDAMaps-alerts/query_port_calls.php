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
if (!empty($_GET["mmsi"])) {
   $mmsi = $_GET["mmsi"];
   //Query statement
   $query = "SELECT pc.*, p.PortName, p.Country FROM risk.port_calls pc, wros.ports p
where pc.ship_id = $mmsi 
and pc.port_id = p.portID
and pc.entering_port = 1
order by pc.time_stamp desc";
}
else {
}  //END else

//Execute the query
$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()));
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

   //Output JSON object per row
   $port = array(ship_id=>addslashes(odbc_result($result,"ship_id")),
                 port_id=>addslashes(odbc_result($result,"port_id")),
                 entering_port=>addslashes(odbc_result($result,"entering_port")),
                 port_call_id=>addslashes(odbc_result($result,"port_call_id")),
                 time_stamp=>addslashes(odbc_result($result,"time_stamp")),
                 PortName=>addslashes(odbc_result($result,"PortName")),
                 Country=>addslashes(odbc_result($result,"Country"))
   );
   array_push($portarray, $port);
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, port_calls => $portarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
