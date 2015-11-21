<?php

// See http://code.tutsplus.com/tutorials/how-to-work-with-php-and-ftp--net-20012
$error_message[0] = "Unknown problem with upload.";
$error_message[1] = "Uploaded file too large (load_max_filesize).";
$error_message[2] = "Uploaded file too large (MAX_FILE_SIZE).";
$error_message[3] = "File was only partially uploaded.";
$error_message[4] = "Choose a file to upload.";

$body = $_POST['body'];
$savedir = $_POST['saveDir'];
$filename = $_POST['filename'];
error_log("savedir: $savedir");
// add opml extension?
$pos = strrpos($filename,".");
if ($pos == false){
	$filename = $filename . ".opml";
}
else{
	$ext = substr($filename, $pos);
	//error_log("filename: $filename  Ext: $ext");
	if (strtoupper($ext) !== ".OPML"){
		$filename = $filename . ".opml";
	}
 }
	
$fullpath = $savedir . "/" . $filename;
error_log("Fullpath:|" . $fullpath . "|filename:$filename|");
	
$fh = fopen($fullpath,"w" ) or die("Cannot save to path: " . $savedir);
fwrite($fh, $body);
fclose($fh);

return;
// 
// $uploaddir = "./temp_uploads/";
// 
// $upload_file = $upload_dir . urlencode(basename($_FILES['userfile']['name']));
// 
// 
// if (@is_uploaded_file($_FILES['userfile']['tmp_name'])) {
// 	if (@move_uploaded_file($_FILES['userfile']['tmp_name'], $savedir)) {
// 		/* Great success... */
// 		echo "hooray";
// 		//$content = file_get_contents($upload_file);
// 		//print $content;
// 	} 
// 	else {
// 		print $error_message[$_FILES['userfile']['error']];
// 		}
// } 
// 	else {
// 		print $error_message[$_FILES['userfile']['error']];
// 	}    

?>