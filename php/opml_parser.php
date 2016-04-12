<?php

 // open and parse opml or xml
 
error_reporting(E_ALL);
ini_set("display_errors", 1);

error_log("+++++++++++++++++++++++++");
 $filename = $_POST['filename'];
 error_log("file=" . $filename);
 //echo "<p>file =" . $filename . "</p>";
 //$filename="Dropbox/universitypresser-cocktail-napkin.opml";
 $f = file_get_contents($filename);

function extractTextFromTags($s,$l){
	// s = the tag, $l is the line
	$b1 = strpos($l,  $s);
	$b1 = strlen($s); // end of open tag
	$b2 = strrpos($l, "</"); // beginning of close tag
	if (($b1 === false) || ($b2 === false)) {
		echo "Error with tag: $s in line $l";
		return;
	}
	if (($b2 - $b1) < 1){
		$ret = "";
		}
		else{
		$ret = substr($l,$b1, $b2 - $b1);
		}
	return $ret;
   
}
 


 
 // the json array to hold them all
 $a = array();
 // array to hold all of the lines
 $contentarray = array();
 
  $f = preg_replace("/(\x0D|\x0A)/", "\n", $f); // getthe line endings right - thank you, Andy Silva!
 
 // turn into array of lines
  $lines = explode(PHP_EOL,$f);
  
  
  //--------- cycle through the array
  $lev= 0 ;
  $prevlev = 0;
  $ctr = 0;
 for ($i = 0; $i < count($lines); $i++){
     $line = trim($lines[$i]);
  	//error_log("-----LINE $i=$line");
  	if ($line !== ""){
 
    // --- look for headings
    if (strpos($line, "<title>") !== false) {
    	$title = extractTextFromTags("<title>",$line);
    	 $a["title"] = $title;
    	 error_log("TITLE: $title");
    }
    if (strpos($line, "<dateCreated>") !== false) {
    	$dateCreated = extractTextFromTags("<dateCreated>",$line);
    	 $a["dateCreated"] = $dateCreated;
    }
    if (strpos($line, "<dateModified>") !== false) {
    	$dateModified = extractTextFromTags("<dateModified>",$line);
    	 $a["dateModified"] = $dateModified;
    }
    if (strpos($line, "<ownerName>") !== false) {
    	$ownerName = extractTextFromTags("<ownerName>",$line);
    	 $a["ownerName"] = $ownerName;
    }
    if (strpos($line, "<ownerEmail>") !== false) {
    	$ownerEmail = extractTextFromTags("<ownerEmail>",$line);
    	 $a["ownerEmail"] = $ownerEmail;
    }
    if (strpos($line, "<expansionState>") !== false) {
    	$expansionState = extractTextFromTags("<expansionState>",$line);
    	 $a["expansionState"] = $expansionState;
    } 
 
  // ---- cycle through body
  		$lev = $lev + $prevlev;
		//echo "<br><pre> $i $line </pre>";
		$text="";
		// If it's <outline text> then lev++
		// If it's <outline text /> then do nothing
		// if it's </outline> then lev--
		$outlinetag = strpos($line,"<outline ");
		$closetag = strpos($line, "</outline>");
		// if it's </outline> then reduce the level
		if ($closetag !== false){ 
			$prevlev = -1;
			//echo "<p>$i EndTag lev= $lev ";
		}
		$selfending = strpos($line, "/>"); 
		// if it's <outline> and not <   />, then it's a new <outline> and increase it
		if (($outlinetag !== false) && ($selfending === false)){
			 $prevlev = 1;	
			//echo "<p>$i OutlineTag is not selfending. Lev=$lev" . substr($line, 8,15);;
		}
		// if it's a self-ending line, prevlev = 0
		if (($outlinetag !== false) && ($selfending !== false)){
			$prevlev = 0;
		}
		
		// get the text, if any
		if (strpos($line, "text=") !== false) {
		    $brack1 = strpos($line, "\"");
		    $brack2 = strrpos($line, "\"", $brack1);
		   // error_log("Line= $line > brack2 = $brack2");
			$text = substr($line, $brack1 + 1,  $brack2 - ($brack1 + 1));
		   // echo "<br>$brack1  $brack2 text= $text";
		}
		//print("CTR=$ctr Text=$text");
		if ($text !==""){
			$contentarray[$ctr]["text"] = $text;
			$contentarray[$ctr]["level"]= $lev;
			$ctr++;
		}
    }
  }
  

// print_r($contentarray[0]);
 //print("COUNT: " . count($contentarray));
  
  $a["content"] = $contentarray;
  $jsn = json_encode($a);
 
  
echo $jsn;
 
 
?>