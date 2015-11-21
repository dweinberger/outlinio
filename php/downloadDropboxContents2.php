<?php

$src = $_REQUEST['src']; // url
$filename = basename($src); // get the file's name
	error_log("SRC; $src - FILENAME: $filename");
$dir="Downloads"; // set the folder to download into
// create the pathname for the downloaded file
$downloads = $dir . "/" . $filename; // md5($src);
// get the contents of the download -- YAY!
$out = file_get_contents($src);
	error_log($out);
// put the downloaded file there
file_put_contents($downloads, $out);
// put a copy into the currentFile folder
   file_put_contents("currentFile/currentFile.opml", $out);       
// repeat the contents out loud
echo $out;

?>

