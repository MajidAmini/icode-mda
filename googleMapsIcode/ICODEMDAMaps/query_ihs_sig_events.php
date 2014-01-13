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

//Query statement - Look back by 1 year for changes based on Fairplay SID
//Special Cases: The following may have null values: ex_flag,ex_name,ex_year_acquired
$fairplay_sid = (string)$_GET["fairplay_sid"];
$query = "SELECT ex_flag,ex_owner,ex_name,ex_year_acquired,iteration,TIMESTAMPDIFF(month,ex_year_acquired,NOW()) as 'time_diff_months' FROM wros.tblship_ex where ship_id= ".$fairplay_sid;
$query = $query . " order by Ex_Year_Acquired asc";


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
   $ihs = array(ex_flag=>htmlspecialchars(odbc_result($result,"ex_flag")),
                   ex_owner=>odbc_result($result,"ex_owner"),
                   ex_name=>htmlspecialchars(odbc_result($result,"ex_name")),
                   ex_year_acquired=>odbc_result($result,"ex_year_acquired"),
                   iteration=>htmlspecialchars(odbc_result($result,"iteration")),
                   time_diff_months=>htmlspecialchars(odbc_result($result,"time_diff_months"))
   );
   array_push($ihsarray, $ihs);
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, ihsdata => $ihsarray);
echo json_encode($data);
?>
