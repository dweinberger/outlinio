<?php

// attempt to get metadata

# Include the Dropbox SDK libraries
 require_once "./dropbox-sdk/Dropbox/autoload.php";
 use \Dropbox as dbx;
 
 $appInfo = dbx\AppInfo::loadFromJsonFile("app-info.json");
 $webAuth = new dbx\WebAuthNoRedirect($appInfo, "PHP-Example/1.0");
 $authorizeUrl = $webAuth->start();
 
 $authorizeUrl="https://www.dropbox.com/1/oauth2/authorize?client_id=7xu5g8mzcmlu1tk&response_type=code";
 
 echo "1. Go to: " . $authorizeUrl . "<br>";
echo "2. Click \"Allow\" (you might have to log in first).<br>";
echo "3. Copy the authorization code.<br>";
//$authCode = readline("Enter the authorization code here: ");
$authCode="X84mk9NLswoAAAAAAAFTkMjdepSEb675bsGN7yKCEAE";
print "After authcode: " . $authCode;

list($accessToken, $dropboxUserId) = $webAuth->finish($authCode);
echo "Access Token: " . $accessToken . "\n";
 
 $dbxClient = new dbx\Client();
 
 $accountInfo = $dbxClient->getAccountInfo();
print_r($accountInfo);


// $f = fopen("TESTtitle4.opml", "rb");
// $result = $dbxClient->uploadFile("/_Atestfile.opml", dbx\WriteMode::add(), $f);
// fclose($f);
// print_r($result);

?>