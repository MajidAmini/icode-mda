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
//Special Cases: the following fields may be null: vessel_name,call_sign,MMSI,flag,operator,subtype,gt,dwt,year,sub_status,builder,
// Port_Of_Registry,Official_Number,Sat_Com_Ansbk_Code,flag,Sat_Com,Fishing_Number,P_and_I_Club
$imo = (string)$_GET["imo"];
$query = "SELECT fairplay_sid,Vessel_Name,IMO_No,Call_Sign,Maritime_Mobile_Service_ID,Flag,Operator,subtype,GT,dwt,year(Due_or_Delivered),sub_Status,Builder,";
$query = $query . "Port_Of_Registry,Official_Number,Sat_Com_Ansbk_Code,flag,Sat_Com,Fishing_Number,P_and_I_Club";
$query = $query . " FROM wros.tblship where IMO_No=" . $imo;



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
   $ihs = array(fairplay_sid=>htmlspecialchars(odbc_result($result,"fairplay_sid")),
                   vessel_name=>htmlspecialchars(odbc_result($result,"vessel_name")),
                   imo_no=>odbc_result($result,"imo_no"),
                   call_sign=>htmlspecialchars(odbc_result($result,"call_sign")),
                   mmsi_no=>odbc_result($result,"Maritime_Mobile_Service_ID"),
                   flag=>htmlspecialchars(odbc_result($result,"flag")),
                   operator=>htmlspecialchars(odbc_result($result,"operator")),
                   subtype=>htmlspecialchars(odbc_result($result,"subtype")),
                   gt=>htmlspecialchars(odbc_result($result,"gt")),
                   dwt=>htmlspecialchars(odbc_result($result,"dwt")),
                   due_or_delivered=>htmlspecialchars(odbc_result($result,"year(Due_or_Delivered)")),
                   sub_status=>htmlspecialchars(odbc_result($result,"sub_status")),
                   builder=>htmlspecialchars(odbc_result($result,"Builder")),
                   port_of_registry=>htmlspecialchars(odbc_result($result,"Port_Of_Registry")),
                   official_number=>htmlspecialchars(odbc_result($result,"Official_Number")),
                   sat_com_ansbk_code=>htmlspecialchars(odbc_result($result,"Sat_Com_Ansbk_Code")),
                   flag=>htmlspecialchars(odbc_result($result,"flag")),
                   sat_com=>htmlspecialchars(odbc_result($result,"sat_com")),
                   fishing_number=>htmlspecialchars(odbc_result($result,"Fishing_Number")),
                   p_and_i_club=>htmlspecialchars(odbc_result($result,"P_and_I_Club"))           
   );
   array_push($ihsarray, $ihs);
}

$data = array(query => $query, resultcount => $count_results, exectime => $totaltime, ihsdata => $ihsarray);
echo json_encode($data, JSON_PRETTY_PRINT);
?>
