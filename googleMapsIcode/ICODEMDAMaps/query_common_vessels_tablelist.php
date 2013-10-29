<?php
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
$query = "select currentvessels.substring from
(
SELECT substring(table_name from '........$') FROM information_schema.tables WHERE table_name::varchar ilike ('current_vessels_%') 
) currentvessels
INNER JOIN
(
SELECT substring(table_name from '........$') FROM information_schema.tables WHERE table_name::varchar ilike ('radar_vessels_%') 
) radarvessels
ON currentvessels.substring = radarvessels.substring
ORDER BY currentvessels.substring;";

$result = @odbc_exec($connection, $query) or die('Query error: '.htmlspecialchars(odbc_errormsg()));;
//-----------------------------------------------------------------------------

// Prevent caching.
header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 01 Jan 1996 00:00:00 GMT');

// The JSON standard MIME header.
header('Content-type: application/json');

//echo json_encode(array(query => $query));s
// Iterate through the rows, printing XML nodes for each
$count_results = 0;
$tablearray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Output JSON object per row
   $table = odbc_result($result,"substring");
   array_push($tablearray, $table);
}

$data = array(query => $query, resultcount => $count_results, tables => $tablearray);
echo json_encode($data);
?>
