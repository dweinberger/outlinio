<?php

$rootdir = $_GET['rootdir']; //"Dropbox/misc";
error_log("Rdir: $rootdir||");
$cmd = shell_exec("ls -R $rootdir| grep \":$\" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/ /' -e 's/-/|/'");
//$cmd="|-first\n|---second\n|-----third\n|---fourth";

$a = explode("\n",$cmd);
$count = count($a);

// dashes express level even if taken a subfolder as root
// so get the baseline number of dashes
$rootdashes = strlen($a[0]) - strlen(trim(substr($a[0],2),"-"));
// this includes the initial |, so subtract one
$rootdashes = $rootdashes;
//error_log("Rootdash: $rootdashes - a0:$a[0]");

$h ="";//<html><head></head><body>";
$jsonarray =  array ();
// add root
array_push($jsonarray, array("name" => $rootdir, "indent" => 0));
for ($i=0; $i < $count; $i++){
	// count dashs before the name
	$folder = $a[$i];
	$done = false;
	$fulllen = strlen($folder);
	// remove opening "|";
	$justname = substr($folder,2);
	//error_log("justdashes: $justname");
	$justname = trim($justname, "-");
	//error_log("folder=" . $folder . " : " . $justname);
	$justnamelen = strlen($justname);
	// convert indents into level number, starting at 1
	$indents = intval(($fulllen - ($justnamelen + $rootdashes)) / 2) + 1;
	$margin = $indents * 5;
	// skip unwanted pseudo-folders (case insensitive)
	if ( (stripos($justname, ".oo3") == false) && 
		 (stripos($justname, ".mpkg")== false) &&
		 (stripos($justname, ".zip") == false) &&
		 (strpos($justname, ".app") == false))
		 {
		//error_log("$indents $folder");
		$ja = array ("name" => $justname, "indent" => $indents);
		array_push($jsonarray, $ja);
		}
	}

$jarray = json_encode($jsonarray);
$myfile = fopen("dirstructure.txt", "w");
fwrite($myfile, $jarray);
fclose($myfile);

//ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/ /' -e 's/-/|/'

return count($ja);

?>