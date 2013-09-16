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
$connection=mysql_connect ();
if (!$connection) {
  die('Not connected : ' . mysql_error());
}

// Set the active MySQL database
$db_selected = mysql_select_db("test", $connection);
if (!$db_selected) {
  die ('Can\'t use db : ' . mysql_error());
}

$type = $_GET["type"];

// Select all the rows in the markers table
$query = "SELECT * FROM ais WHERE ship_type = $type";
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
  echo 'id="' . parseToXML($row['id']) . '" ';
  echo 'mmsi="' . parseToXML($row['mmsi']) . '" ';
  echo 'name="' . parseToXML($row['name']) . '" ';
  echo 'imo="' . parseToXML($row['imo']) . '" ';
  echo 'lat="' . $row['lat'] . '" ';
  echo 'lon="' . $row['lon'] . '" ';
  echo 'flag="' . parseToXML($row['flag']) . '" ';
  echo 'ship_type="' . parseToXML($row['ship_type']) . '" ';
  echo 'status="' . parseToXML($row['status']) . '" ';
  echo 'speed="' . parseToXML($row['speed']) . '" ';
  echo 'course="' . parseToXML($row['course']) . '" ';
  echo 'length="' . parseToXML($row['length']) . '" ';
  echo 'breadth="' . parseToXML($row['breadth']) . '" ';
  echo 'draught="' . parseToXML($row['draught']) . '" ';
  echo 'destination="' . parseToXML($row['destination']) . '" ';
  echo 'eta="' . parseToXML($row['eta']) . '" ';
  echo 'received="' . parseToXML($row['received']) . '" ';
  echo '/>';
}

// End XML file
echo '</tips>';

?>

