<?php
if(file_exists('vendor/autoload.php')){
    require 'vendor/autoload.php';
    require 'backup.php';    

    //set access token
    $token = '7xu5g8mzcmlu1tk';
    $project = 'dropboxbackup/1.0';
    $projectFolder = 'localserver';

    $bk = new Backup($token,$project,$projectFolder);
    //$bk->upload('index.php');

    echo 'Upload Complete';

} else {
    echo "<h1>Please install via composer.json</h1>";
    echo "<p>Install Composer instructions: <a href='https://getcomposer.org/doc/00-intro.md#globally'>https://getcomposer.org/doc/00-intro.md#globally</a></p>";
    echo "<p>Once composer is installed navigate to the working directory in your terminal/command prompt and enter 'composer install'</p>";
    exit;
}