<?php
echo 'mogrify -rotate '. $_GET["rotation"] .' -background #ff0000 -transparent #ff0000 '. (string)$_GET["dir"] .'/files/ReducedResImage.png';

$output = shell_exec('mogrify -rotate '. $_GET["rotation"] .' -background #ff0000 -transparent #ff0000 '. (string)$_GET["dir"] .'/files/ReducedResImage.png');

echo "<pre>$output</pre>";
?>
