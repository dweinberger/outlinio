<?php

$f = scandir("themes");
//error_log(count($f));
$fj = json_encode($f);
//error_log($fj);
echo $fj

?>