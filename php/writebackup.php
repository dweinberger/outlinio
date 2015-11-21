<?php
$body = $_POST['body'];
$title = $_POST['title'];
// add opml extension?
$pos = strrpos($title,".");
if ($pos == false){
	$title = $title . "opml";
}
else{
	$ext = substr($title, $pos);
	if (strtoupper($ext) !== "OPML"){
		$title = $title . ".opml";
	}
}
$myFilePath = "./outline_backups/" . $title;
//$title = "_AB_outlinio_test.txt";
//$myFilePath = "./Dropbox/" . $title;
//$myFilePath = "Dropbox/book: futures/" . $title;
//$myFilePath = "saved_outlines/TEST.txt";
error_log("file:$myFilePath BODY=$body");
$fh = fopen($myFilePath,"w" ) or die("Cannot open save file: " . $title);
$newbody = urldecode($body);
fwrite($fh, $newbody);
error_log("Wrote something to $fh");
fclose($fh);
/* echo $titletext . " saved - via writesavefile.php"; */


?>
