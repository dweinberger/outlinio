<?php
// reads list of recent files. Comma delimited
$myFilePath = "data/recentfiles.txt" ;
$f = file_get_contents($myFilePath);
error_log("file:$myFilePath list=$f");

$f = urlencode($f);
echo $f;


?>