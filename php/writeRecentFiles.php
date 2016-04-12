<?php
// writes list of recent files. Comma delimited
error_log("]]]]]]]]] in writeRecentFiles.php [[[[[[[");
$list = $_POST['list'];


$myFilePath = "./data/recentFiles.txt" ;
$myFilePath = "./data/test.txt";
$list = "this is a test, and another, / and another";
error_log("file:$myFilePath list=$list");
$fh = fopen($myFilePath,"w" ) or die("Cannot open save file: " . $myFilePath);
//$ulist = urldecode($list);
//$ulist = urlencode("Interop Strat.opml,university-presser-cocktail-napkin.opml,temp/testj2.opml");
fwrite($fh, $list);
error_log("Wrote something to $fh");
fclose($fh);


?>
