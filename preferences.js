// Preferences for outlinio

var savePath = "http://localhost/~weinbergerd/outlinio4/";
var backupDirectory = "./outline_backups/";

var gMaxRecentFiles = 10; // max recent files to list
var gThemesDir = "themes"; // where the themes are located. No trailing slash
								//Make it relative to home dir, for getThemes.php

// how many keystrokes trigger a backup?
var gKeysUntilSave = 50; 
var maxUndos = 10; // this doesn't work yet

// Speed at which lines show or hide, in ms (1000 = 1 second)
gSlideSpeed = 500;

// What should be opened when the app starts
var opendefault_pref = "PREVIOUS"; // PREVIOUS, DEFAULT or NEW

// how many indents to allow
var gMaxIndents = 12;

