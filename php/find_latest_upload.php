<?php

// -- get name of latest file saved in temp folder
$latest_ctime = 0;
$filename = ''; 

$path = "temp_uploads";   

$d = dir($path);
while (false !== ($entry = $d->read())) {
  $filepath = "{$path}/{$entry}";
  // could do also other checks than just checking whether the entry is a file
  if (is_file($filepath) && filectime($filepath) > $latest_ctime) {
    $latest_ctime = filectime($filepath);
    $filename = $entry;
  }
}

echo("find_latest filename: $filename");

return $filename;

?>