<?php
//ini_set('display_errors',1);
//error_reporting(E_ALL);

require('pclzip.lib.php');

$mtime = microtime(); 
$mtime = explode(" ",$mtime); 
$mtime = $mtime[1];

//echo 'Filename: '.$_FILES['file']['name'].'<br>';
//echo 'C:/pgsql/UniServer/www/ICODEMDAMaps/kml/'.$mtime.'/'.$_FILES["file"]["name"].'<br>';
   
if( $_FILES['file']['name'] != "" )
{
   //Move the uploaded file from temporary location to webserver location
   mkdir($mtime);
   if (move_uploaded_file($_FILES["file"]["tmp_name"], $mtime.'/'.$_FILES["file"]["name"] )) {

//Try to unzip the file ----------------------------------------------------------------
$unzip = $mtime."/".$_FILES["file"]["name"];
$basedir = $mtime;
$basedir = str_replace('\\','/',$basedir);

//echo $unzip.'<br>';

if (is_file($unzip)) {
	$zip = new PclZip($unzip);
	if (($list = $zip->listContent()) == 0) {
      //echo 'Error unzipping file';
      echo json_encode(array('result'=>'failed', 'datetime'=>$mtime));
	}
	
	$fold = 0;
	$fil = 0;

   /*
   //Delete existing files
   $dfiles = glob($basedir.'/*'); // get all file names
   foreach($dfiles as $file){ // iterate files
   
      //Delete usual 'doc.kml' file
      //echo strtolower(basename($file)) . '<br>';
      if(is_file($file) && strtolower(basename($file)) == 'doc.kml') {
         //echo " - deleted file!!!<br>";
         unlink($file); // delete file
      }

      //Delete usual 'files' directory
      if(is_dir($file) && strtolower(basename($file)) == 'files') {
         //echo 'Entering files<br>';
         $dirfiles = glob($basedir.'/files/*');
         foreach($dirfiles as $dirfile){
            //echo '  ' . $dirfile . '<br>';
            if(is_file($dirfile)) {
               unlink($dirfile);
               print_r(error_get_last());
            }
         }
         rmdir($file);
      }
   }
   */

   //Actually do the unzipping here!
   $zip->extract(PCLZIP_OPT_PATH,$mtime);
}
//Done unzipping ----------------------------------------------------------------
//unlink($unzip);

      echo json_encode(array('type'=>'kmz', 'result'=>'success', 'datetime'=>$mtime, 'filename'=>$_FILES["file"]["name"]));
   }
   else {
      echo json_encode(array('type'=>'kmz', 'result'=>'failed', 'datetime'=>$mtime, 'filename'=>'null'));
   }
}
else
{
    die("No file specified!");
    echo json_encode(array('type'=>'kmz', 'result'=>'failed', 'datetime'=>$mtime, 'filename'=>'null'));
}
?>
