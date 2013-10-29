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

if(count($_GET) > 0) { 
//    if (!empty($_GET["sources"])) {
       /*
       $sources = (int)$_GET["sources"];
       if ($sources == 0) {
          $fromSources = "(SELECT * FROM radar_vessels UNION SELECT * FROM current_vessels WHERE vesseltypeint != -1) LATESTPOSITIONS";
       }
       else if ($sources == 1) {
          $fromSources = "(SELECT * FROM current_vessels WHERE vesseltypeint != -1) LATESTPOSITIONS";
       }
       else if ($sources == 2) {
          $fromSources = "(SELECT * FROM radar_vessels) LATESTPOSITIONS";
       }
       else if ($sources == 3) {
          $fromSources = "(SELECT * FROM radar_vessels_20130806 UNION SELECT * FROM current_vessels_20130806) VESSELS";
       }
       else {
          //Default case
          $fromSources = "(SELECT * FROM radar_vessels UNION SELECT * FROM current_vessels WHERE vesseltypeint != -1) LATESTPOSITIONS";
       }
       */


       $sources = $_GET["sources"];
       //$fromSources = "(SELECT * FROM radar_vessels" . $sources . " UNION SELECT * FROM current_vessels" . $sources . ") VESSELS";
       $fromSources = "(SELECT * FROM radar_vessels" . $sources . " UNION SELECT * FROM current_vessels" . $sources . ") VESSELS LEFT OUTER JOIN user_ship_risk ON VESSELS.mmsi = user_ship_risk.mmsi";

//    }
}

//Query statement - default statement unless user inputs custom statement
$query = "SELECT * FROM " . $fromSources;


//Count the number of arguments
if(count($_GET) > 0) {
    //custom query, erase everything else and use this query
    if (!empty($_GET["query"])) {
       //TODO: add security checks, e.g. against "DROP TABLE *" commands
       $query = $_GET["query"];
    }

    $basequery = $query;

    if (strpos($query, "WHERE") !== FALSE || strpos($query, "where") !== FALSE) {
       $query = $query . " AND";
    }
    else {
       $query = $query . " WHERE";
    }

    if (!empty($_GET["minlat"]) && !empty($_GET["minlon"]) &&
       !empty($_GET["maxlat"]) && !empty($_GET["maxlon"])) {
          $query = $query . " lat BETWEEN " . round($_GET["minlat"],3) . " AND " . round($_GET["maxlat"],3) . 
                   " AND lon BETWEEN " .  round($_GET["minlon"],3) . " AND " . round($_GET["maxlon"],3);
    }

    if (!empty($_GET["keyword"])) {
       $keyword = $_GET["keyword"];
       $query = $query . " AND (mmsi::varchar like ('%" . $keyword . "%') OR " . 
                         "imo::varchar like ('%" . $keyword . "%') OR " . 
                         "vesselname::varchar ilike ('%" . $keyword . "%') OR " . 
                         "destination::varchar ilike ('%" . $keyword . "%') OR " . 
                         "callsign::varchar ilike ('%" . $keyword . "%') OR " . 
                         "streamid::varchar ilike ('%" . $keyword . "%'))";
    }

    if (!empty($_GET["limit"])) {
       $limit = $_GET["limit"];
       $query = $query . " limit " . $limit;
    }

    if (empty($_GET["query"])) {
       $query = $query . " order by VESSELS.mmsi";
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
$vesselarray = array();
while (odbc_fetch_row($result)){
   $count_results = $count_results + 1;

   //Output JSON object per row
   $vessel = array(messagetype=>odbc_result($result,"messagetype"),
                   mmsi=>odbc_result($result,"mmsi"),
                   navstatus=>odbc_result($result,"navstatus"),
                   rot=>odbc_result($result,"rot"),
                   sog=>odbc_result($result,"sog"),
                   lon=>addslashes(odbc_result($result,"lon")),
                   lat=>addslashes(odbc_result($result,"lat")),
                   cog=>odbc_result($result,"cog"),
                   true_heading=>odbc_result($result,"true_heading"),
                   datetime=>odbc_result($result,"datetime"),
                   imo=>odbc_result($result,"imo"),
                   vesselname=>htmlspecialchars(odbc_result($result,"vesselname")),
                   vesseltypeint=>odbc_result($result,"vesseltypeint"),
                   length=>odbc_result($result,"length"),
                   shipwidth=>odbc_result($result,"shipwidth"),
                   bow=>odbc_result($result,"bow"),
                   stern=>odbc_result($result,"stern"),
                   port=>odbc_result($result,"port"),
                   starboard=>odbc_result($result,"starboard"),
                   draught=>odbc_result($result,"draught"),
                   destination=>htmlspecialchars(odbc_result($result,"destination")),
                   callsign=>htmlspecialchars(odbc_result($result,"callsign")),
                   posaccuracy=>odbc_result($result,"posaccuracy"),
                   eta=>odbc_result($result,"eta"),
                   posfixtype=>odbc_result($result,"posfixtype"),
                   //streamid=>htmlspecialchars(odbc_result($result,"streamid"))
                   streamid=>htmlspecialchars(odbc_result($result,"streamid")),
                   security_rating=>odbc_result($result,"security_rating"),
                   safety_rating=>odbc_result($result,"safety_rating"),
                   risk_score_security=>odbc_result($result,"security_score"),
                   risk_score_safety=>odbc_result($result,"safety_score")
   );
   array_push($vesselarray, $vessel);
}

$data = array(basequery => $basequery, query => $query, resultcount => $count_results, exectime => $totaltime, vessels => $vesselarray);
echo json_encode($data);
?>

