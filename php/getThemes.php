<?php

$d = $_REQUEST['themedir'];
// it's one level update
$d = "../" . $d; // comes in relative to home. Needs to be ../themes for php dir
error_log("themedir: $d");

$f = scandir($d);
//error_log(count($f));
$fj = json_encode($f);
error_log($fj);
echo $fj

?>