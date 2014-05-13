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
//Special cases: all fields are non null
$imo = (string)$_GET["imo"];
$query = "SELECT id,lrno,shipname,crewlistdate,nationality,totalcrew,totalratings,totalofficers";
$query = $query . " FROM wros.tblcrewlist where lrno=" . $imo;



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
$ihsarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Output JSON object per row
   $ihs = array(id=>htmlspecialchars(odbc_result($result,"id")),
                   lrno=>odbc_result($result,"lrno"),
                   call_sign=>htmlspecialchars(odbc_result($result,"call_sign")),
                   shipname=>odbc_result($result,"shipname"),
                   crewlistdate=>htmlspecialchars(odbc_result($result,"crewlistdate")),
                   nationality=>htmlspecialchars(odbc_result($result,"nationality")),
                   totalcrew=>htmlspecialchars(odbc_result($result,"totalcrew")),
                   totalratings=>htmlspecialchars(odbc_result($result,"totalratings")),
                   totalofficers=>htmlspecialchars(odbc_result($result,"totalofficers"))                        
   );
   array_push($ihsarray, $ihs);
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, ihsdata => $ihsarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
