<?php

// see http://www.sitepoint.com/access-dropbox-using-php/

require_once "dropbox-sdk/Dropbox/autoload.php";
require_once "dropbox-sdk/Dropbox/appInfo.php";

$appInfo = dbx\AppInfo::loadFromJsonFile("app-info.json");

$c = file_get_contents("https://api.dropbox.com/1/metadata/link");

echo $c;
error_log("CONTENTS: $c");

?>