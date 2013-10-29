<?php
   echo 'Deleting old KML extracts';
   $dfiles = glob($basedir.'*'); // get all file names
   foreach($dfiles as $file) { // iterate files
   
      //Delete usual 'doc.kml' file
      //echo strtolower(basename($file)) . '<br>';
      $datefolders = glob(strtolower(basename($file)).'/*');
      foreach($datefolders as $datefolder) {
         //if(is_dir($datefolder)) {
         if (substr($datefolder,0,2) == '13') {
            if(is_file($datefolder) ) {//&& strtolower(basename($datefolder)) == 'doc.kml') {
               echo 'Deleting file: '.strtolower($datefolder) .'<br>';
               unlink($datefolder); // delete file
            }

            //Delete usual 'files' directory
            if(is_dir($datefolder) && strtolower(basename($datefolder)) == 'files') {
               echo 'Removing folder: '.strtolower($datefolder) .'<br>';
               $dirfiles = glob($datefolder.'/*');
               foreach($dirfiles as $dirfile){
                  echo 'Deleting file: ' . $dirfile . '<br>';
                  if(is_file($dirfile)) {
                     unlink($dirfile);
                     //print_r(error_get_last());
                  }
               }
               echo 'Removing folder: ' . $datefolder . '<br>';
               rmdir($datefolder);
            }

            //if (is_dir_empty(substr($datefolder,0,10))) {
               echo 'Removing folder: ' . substr($datefolder,0,10) . '<br>';
               rmdir(substr($datefolder,0,10));
            //}
         }
      }
   }

?>
