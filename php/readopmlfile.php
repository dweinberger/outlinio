<?php

$fname= $_POST['filename'];

$file = fopen($fname, "r") or exit("Unable to open file!");
//Output a line of the file until the end is reached
$s="";
while(!feof($file))
  {
  $s1=fgets($file);
  $s=$s . $s1;
  }
fclose($file);
echo $s;
?>