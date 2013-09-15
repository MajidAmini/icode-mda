<?php
//echo 'Filename: '.$_FILES['file']['name'].'<br>';
   
if( $_FILES['file']['name'] != "" )
{
   //Move the uploaded file from temporary location to webserver location
   mkdir($mtime);
   if (move_uploaded_file($_FILES["file"]["tmp_name"], $_FILES["file"]["name"] )) {
      //Process bin file and upload data to PostgreSQL temporary table by calling
      // Lynne's Java PVOL parser
      //$command = 'C:\Program Files\Java\jdk1.7.0_25\bin\java.exe -jar dist\PVOLtoDb.jar ' . $_FILES["file"]["name"] . ' upload_table';
      $command = 'java -jar dist\PVOLtoDb.jar ' . $_FILES["file"]["name"] . ' upload_table';
      exec($command, $output, $return);

      echo json_encode(array('type'=>'laisic', 'result'=>'success', 'filename'=>$_FILES["file"]["name"], 'command'=>$command, 'output'=>$output, 'return'=>$return));
   }
   else {
      echo json_encode(array('type'=>'laisic', 'result'=>'failed', 'filename'=>'null'));
   }
}
else
{
    die("No file specified!");
    echo json_encode(array('type'=>'laisic', 'result'=>'failed', 'filename'=>'null'));
}
?>
