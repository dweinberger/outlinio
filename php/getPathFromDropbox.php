<?php


$ch = curl_init();
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


 curl_setopt($ch, CURLOPT_HTTPHEADER,array(({data: "url:https://www.dropbox.com/s/lry4ngbzu0bxeiv/_a.opml?dl=1"})); 


header('Authorization: Bearer X84mk9NLswoAAAAAAAFT8mrNdrPxCr-NB1ycVPOeq9DqD7on5u-u6RUkzz1BAzu4');
header('Content-type: application/json');
curl_setopt($ch,CURLOPT_VERBOSE,true);  
curl_setopt($ch,CURLOPT_HEADER,true);
//data("url:https://www.dropbox.com/s/lry4ngbzu0bxeiv/_a.opml?dl=1"); ;
  
curl_setopt($ch, CURLOPT_POST, 1);
 $response = curl_exec($ch);
 
 echo "resp: " . $response;



  
  ?>