<?php

function parseToXML($htmlStr) 
{ 
$xmlStr=str_replace('<','&lt;',$htmlStr); 
$xmlStr=str_replace('>','&gt;',$xmlStr); 
$xmlStr=str_replace('"','&quot;',$xmlStr); 
$xmlStr=str_replace("'",'&#39;',$xmlStr); 
$xmlStr=str_replace("&",'&amp;',$xmlStr); 
return $xmlStr; 
} 

// Opens a connection to a MySQL server
$connection=mysql_connect();
if (!$connection) {
  die('Not connected : ' . mysql_error());
}

// Set the active MySQL database
$db_selected = mysql_select_db("test", $connection);
if (!$db_selected) {
  die ('Can\'t use db : ' . mysql_error());
}

$type = $_GET["type"];

$ll_lat = $_GET["ll_lat"];
$ll_lon = $_GET["ll_lon"];
$ur_lat = $_GET["ur_lat"];
$ur_lon = $_GET["ur_lon"];

//$ll_lat = $_GET["ll_lat"];
//$ll_lon = $_GET["ll_lon"];
//$ur_lat = $_GET["ur_lat"];
//$ur_lon = $_GET["ur_lon"];

// Select all the rows in the markers table
$query = "SELECT * FROM current_vessels WHERE ship_type = $type AND lat < $ur_lat AND lat > $ll_lat AND lon < $ur_lon AND lon > $ll_lon";
//$query = "SELECT * FROM ais WHERE ship_type = $type AND lat < $ur_lat AND lat > $ll_lat AND lon < $ur_lon AND lon > $ll_lon";
//$query = "SELECT * FROM ais WHERE ship_type = $type AND lat < $ur_lat AND lat > $ll_lat AND lon < $ur_lon AND lon > $ll_lon";

//echo $query;
$result = mysql_query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");

// Start XML file, echo parent node
echo '<tips>';
// Iterate through the rows, printing XML nodes for each
while ($row = @mysql_fetch_assoc($result)){
  // ADD TO XML DOCUMENT NODE
  echo '<ais ';
  echo 'id="' . parseToXML($row['CommsID']) . '" ';
  echo 'mmsi="' . parseToXML($row['MMSI']) . '" ';
  echo 'name="' . parseToXML($row['Name']) . '" ';
  echo 'imo="' . parseToXML($row['IMONumber']) . '" ';
  echo 'lat="' . $row['Latitude'] . '" ';
  echo 'lon="' . $row['Longitude'] . '" ';
  //echo 'flag="' . parseToXML($row['flag']) . '" ';
  echo 'ship_type="' . parseToXML($row['VesType']) . '" ';
  echo 'status="' . parseToXML($row['NavStatus']) . '" ';
  echo 'speed="' . parseToXML($row['SOG']) . '" ';
  echo 'course="' . parseToXML($row['COG']) . '" ';
  echo 'length="' . parseToXML($row['Length']) . '" ';
  echo 'breadth="' . parseToXML($row['Beam']) . '" ';
  echo 'draught="' . parseToXML($row['Draft']) . '" ';
  echo 'destination="' . parseToXML($row['Destination']) . '" ';
  echo 'eta="' . parseToXML($row['ETADest']) . '" ';
  echo 'received="' . parseToXML($row['TimeOfFix']) . '" ';
  echo '/>';
}

// End XML file
echo '</tips>';

?>

