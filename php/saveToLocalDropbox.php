<?php

// writes file to my local Dropbox folder

//error_log("---- savetolocaldropbox.php --------");

$contents= $_REQUEST['content'];
$fullpath = $_POST['fullpath'];

//error_log("fullpath:" . $fullpath);
//error_log($contents);

// write the file
file_put_contents($fullpath,$contents);

echo "Success?";


?>