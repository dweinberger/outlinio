	/**
 * @author David Weinberger
 */
var revdate= "March 26, 2016";


// Global Preferences
var gDebug = false; // debug it?
var gDownloadDir = "Downloads";
var savePath = "http://localhost/~weinbergerd/outlinio4/";
var backupDirectory = "./outline_backups/";
var gDropboxFullRoot  = "./Dropbox/";
var gDropboxVisibleRoot = "/Dropbox/";
var gDropboxName = "";

// -- file info
var gFileName = ""; // name of the saved file
var gPathOnly  = ""; //  path w/o file name but with "Dropbox/"
var gDisplayFilePath = "" ; //  unused? // path w/o file without "./php"
var gFullPath  = ""; // full path with filename and Dropbox/
var gRecentFiles = new Array();
var gMaxRecentFiles = 10; // max recent files to list



// how many keystrokes trigger a backup?
var gKeysUntilSave = 100; 
var opendefault_pref = "PREVIOUS"; // PREVIOUS, DEFAULT or NEW
// globals
var gMaxIndents = 12;
var gCurrentFullPath = "test1.opml"; //"outlinio_default.opml";
var gHighestLevel = 0;
var gCurrentTextarea=null; 
var keyctr=0;
var gprevcontent;
var gclass;
var editing = true;
var highestgid=-1;
var browsertype ="";
var treeArray = new Array();
var glevel = 0;
var gindent = 30;
var gFileTitle = "";
var gDir = new Array(); // directory structure
var gRootdir = "Dropbox";
gDisplayFilePath = gRootdir;
var gStyles = new Array();


// hash table for the spans in an outline row
var spans = new Array();
spans['img'] = 0;
spans['menu'] = 1;
spans['text'] = 2;

//AddType application/xml;charset=utf-8 .opml;


// dummy so don't have to erase all of the entries until I'm sure
$.keymap = function() {};



function init(){
	

	assignKeys();
	initDropZone();
	initDropbox();
	getLatestUpload(); // load name of latest file uploaded to be opened
	gPathOnly = "Dropbox/";
  // update keystroke counter
  $("#keystrokectr").text(gKeysUntilSave);
  
//   initDefinedClasses(); // add indent to .L div classes
  // make space above first outline line droppable
  //     so can drag lines above the first
  makeDroppable($("#startingdiv"));
  

  // show rev date
  document.getElementById("revdate").innerHTML="Rev date:" + revdate;
  
  // get recent file list
  	 $.ajax({
                 type: "POST",
                 url: "php/readRecentFiles.php", 
                 success: function(data) {
                 	data = decodeURIComponent(data);
                 	data = data.replace("+"," ");
                  	gRecentFiles = data.split(",");
                  //	buildRecentFilesDiv();
                  	notify(gRecentFiles.length + " read.");
                   },
                  error: function (e){
                  	if (e.statusText !== "OK"){
                  		notify("Failed to read recent files: " . e.statusText, "ERROR");
                  	}
                  	}
             }); 
  
  // Cookies
  setCookie("path","Dropbox/");
 // setCookie("filename","universitypresser-cocktail-napkin.opml");
  
  whichBrowser();
  gFileName = getCookie("filename");
  gPathOnly = getCookie("path");
  if ((gFileName!= "") && (gPathOnly != "")){
  	gFullPath = gPathOnly + gFileName;
  }
  else{
  	gFullPath= "";
  }
  // open previous, if we have the data
  if ( (gPathOnly != "") && (gFileName != "") && (opendefault_pref == "PREVIOUS")){
  	openOpmlFile_File(gFullPath);
  }
  // if not enough data, open default even if preference is for previous
  if ( (gFullPath == "") && (opendefault_pref == "PREVIOUS")){
  	openDefault();
  	setCookie("path", "Dropbox/");
  	setCookie("filename", "default.opml");
  }
  // open default
  if (opendefault_pref == "DEFAULT"){
  	openDefault();
  	setCookie("path", "Dropbox/");
  	setCookie("filename", "default.opml");
  }
	// open new
  if (opendefault_pref === "NEW"){
  	createNewOutline();
  }
  
  gDisplayFilePath = gFullPath;//.substr(p );
  p = gDisplayFilePath.lastIndexOf("/");
  gFileName = gDisplayFilePath.substr(p + 1); // get filename
  gDisplayFilePath = gPathOnly;
  $("#savedir1").text(gDisplayFilePath);
  $("#savedir2").text(gDisplayFilePath);
  $("#savedilename1").text(gFileName);
  $("#savedilename2").text(gFileName);


  $("#savebtn").attr("title",gFileName); // tooltip
  $("#savefilenametextarea").val(gFileName);
  
   // init filetree browswer
     $('#filetreediv').fileTree(
     	{ 
     	root: './php/Dropbox/' ,
     	multiFolder: false,
     	script: './jqueryFileTree.php'
     	}, 
     	function(file) {
        	// it's a file, not a directory
        	var p = file.lastIndexOf("/");
        	
    });
 
	
	var firstel = document.getElementById("l0");
	
 // get the themes
 
	  $.ajax({
		url: "./php/getThemes.php",
		success: function (fsj){
			var fs = JSON.parse(fsj);
			// add files
			var ctr = 0;
			for (var i=0; i < fs.length; i++){
				// is it a css file?
				var fname = fs[i];
				var p = fname.lastIndexOf(".");
				var ext = fname.substr(p);
				var ffname = fname.substr(0,p); // get name without extension
				if (ext.toUpperCase() == ".CSS"){
		// 			var fileref=document.createElement("link");
// 					fileref.setAttribute("rel", "stylesheet");
// 					fileref.setAttribute("type", "text/css");
// 					fileref.setAttribute("href", "php/themes/" + fs[i]);
// 					document.getElementsByTagName("head")[0].appendChild(fileref);
					// add it to select list
					gStyles.push(fname);
					$('#themeselectlist').append( new Option(ffname,ctr) );
					ctr++;
			  }
			  	
			}
			// get the theme
					var theme = getCookie("theme");
					//debug
					//theme = "default";
					if (theme == undefined){
						theme = "default";
					}
					// set pulldown to this choice
					indicateSelectedTheme(theme);
					// apply the theme
					swapStyleSheet(theme);
		},
		error: function(e){
			notify("Error getting themes: " + e, "ERROR");
		}
		});
		
		
 // set up the theme switching pulldown
 $('#themeselectlist').bind('change',function(w) {   
			//$("this option[value='2']").text();
			var str = $("#themeselectlist option:selected").text();
			swapStyleSheet(str);
			});
			
	// save filename when lose focus on file rename textarea
    $("#savefilenametextarea").blur(function(e) {
    	//alert("t");
    	gFileName = $("#savefilenametextarea").val();
    	$("#savefilename1").text(gFileName);
    	$("#filename2").text(gFileName);
    	gCurrentFullPath = gPathOnly + gFileName;
    	setCookie("fullpath",gCurrentFullPath);
    });
    	

}

function gotNewDir(pathstr){
	// get rid of "./php";
	var p = pathstr.indexOf("./php");
	if (p > -1){
		pathstr = pathstr.substr(6);
	}
	
	$("#savedir1").text(pathstr);
	$("#savedir2").text(pathstr);
	getFileGlobals(pathstr);
}

function initDropbox(){
	
	// Chooser options
	var opts= {
		success: function(files) { 
		
			var filename = files[0].link;
			filename = filename.replace("dl=0","dl=1");
			$("#savefilename1").text(files[0].name);
			//alert(filename);
			 $.ajax({
				url: "./php/downloadDropboxContents2.php",
				data: {src : filename},
				success: function(cont){
					$("#busy").show();
					openOpmlFile_File(filename);
					$("#busy").hide();
					getDropboxPath(filename);
					var dbpath = gDisplayFilePath.substring(0, gDisplayFilePath.lastIndexOf("/") - 1);
					setCookie("fullpath", filename);
					//setCookie("workingdir",dbpath);
					
					
				
				},
				error: function(e){
					alert(e.responseText);
				}
				});
			
			},
		multiselect: false,
		extensions: ['.opml'],
		linkType: "download"
	};	
	var online = false;
	if (online){
		var button = Dropbox.createChooseButton(opts);
		document.getElementById("openChooser").appendChild(button);
	}
	
	var saverOpts={ 
			files: [
				// You can specify up to 100 files.
				//{'url': 'http://localhost/outlinio4/currentFile.txt', 'filename': '_currentFile.txt'},
				{'url': 'http://www.hyperorg.com/testdropbox.html', 'filename': '/_atest/_hyperorgFile.txt'}
				//https://www.dropbox.com/s/cucaeha88kfkujk/connecticut%20yankee.txt
			],

			// Success is called once all files have been successfully added to the user's
			// Dropbox, although they may not have synced to the user's devices yet.
			success: function () {
				// Indicate to the user that the files have been saved.
				notify("Success! Files saved to your Dropbox.");
			},


			error: function (errorMessage) {
				alert(errorMessage);
			}
	};
	
	if (online){
 	var upbutton =  Dropbox.createSaveButton(saverOpts);
 	document.getElementById("saveasdiv").appendChild(upbutton);		
	}
}

function openRecentFiles(){
	//updateRecentList();
	buildRecentFilesDiv();
	// populate it too.
	
// 	$("#recentfilelist").html(""); // clear it
// 	// cycle through global array
// 	for (i=0; i < gRecentFiles.length; i++){
// 		var div = document.createElement("div");
// 		$(div).attr("class", "recentfile");
// 		$(div).html(gRecentFiles[i]);
// 		$("#recentfileslist").append(div);
// 	}
// 	
// 	// change color when mousedown
// 	 $(".recentfile").mousedown(function(){
//     	$(this).addClass("recentfilemousedown");
//     });
//     // change it back
//     $(".recentfile").mousedown(function(){
//     	$(this).removeClass("recentfilemousedown");
//     });
// 	// recent file list opens that file
//     $(".recentfile").click(function(){
//     	//alert("D");
//     	var fname = "./Dropbox/" + $(this).text();
//     	openOpmlFile_File(fname);
//     });
 
	// close the div
	$("#recentdiv").slideToggle(400);
}

function getDropboxPath(link){
	$.ajax({
		type: "POST",
		beforeSend: function (request)
            {
                request.setRequestHeader("Content-Type", "application/json");
            },
		url: "https://api.dropboxapi.com/2/sharing/get_shared_link_metadata?authorization=Bearer X84mk9NLswoAAAAAAAFT8mrNdrPxCr-NB1ycVPOeq9DqD7on5u-u6RUkzz1BAzu4",
		data: JSON.stringify({url : link}),
		success: function(cont){
			
			gDropboxFullPath  = cont.path_lower;
			gDropboxPath = gDropboxFullPath.substring(0,gDropboxFullPath.lastIndexOf("/") - 1);
			gDropboxName = gDropboxFullPath.substring(gDropboxFullPath.lastIndexOf("/") + 1);
			$("#savedir1").text(gDropboxPath);
			$("#savefilename1").text(gDropboxName);
			//alert(cont.path_lower);
			// set the saver button to this path_lower
			//nope:
			$("#db-saver-real").attr("href", "http://www.dropbox.com/cont.path_lower");
			
			
		},
		error: function(e){
			alert(e.responseText);
		}
		});
}

function saveDBfile(){
		var tmp = "junk";
	// write the file to hyperorg
	$.ajax({
		url: "http://www.hyperorg.com/saveToDropbox.php",
		//data: "src=" + filename,
		success: function(cont){
			alert(cont);
			
		},
		error: function(e){
			alert(e.responseText);
		}
		});
	
}

//--------- SHOW SELECTED PROJECT IN COMBO BOX
function indicateSelectedTheme(theme){
	 var ddl = document.getElementById("themeselectlist");
     for (var i = 0; i < ddl.options.length; i++) {
         if (ddl.options[i].text == theme) {
             if (ddl.selectedIndex != i) {
                 ddl.selectedIndex = i;
             }
             break;
         }
     }
}


//---------------- SET COOKIE
function setCookie(cookieName,cookieValue) {
 var today = new Date();
 var expire = new Date();
 var nDays = 1700; // about 5 yrs
 expire.setTime(today.getTime() + 3600000*24*nDays);
 document.cookie = cookieName+"="+escape(cookieValue) + ";expires="+expire.toGMTString();
}

//---------------- GET COOKIE
function getCookie(c_name)
{
	 var i,x,y,ARRcookies=document.cookie.split(";");
	 for (i=0;i<ARRcookies.length;i++)
	 {
	   x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	   y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	   x=x.replace(/^\s+|\s+$/g,"");
	   if (x==c_name)
		 {
		 return unescape(y);
		 }
	   }
}

function showDirs(){
	$('#dirchooser').fadeToggle(300); 
	$('#workingdirspan').html(gDisplayFilePath);
	loadDirs();
}

function refreshDirs(){
	$.ajax({
        type: "POST",
        url: "./refreshdirs.php?rootdir=" + gRootdir,
		//async: false,
		//data: {rootdir : gRootdir},
		success: function(number_of_dirs){
          notify(number_of_dirs + " folders refreshed");
        },
        error: function(e){
			alert(e.statusText + " Failed to get the folders in Dropbox");
        }
    });
}
function loadDirs(){
	$.ajax({
        type: "POST",
        url: "./readdirsfile.php",
		//async: false,
		success: function(dirs){
			var dirtext = $("#dirs").text();
			if ( (dirtext  === 'Working...') || (dirtext === '')){
           		buildDirSelector(dirs);
           	}
        },
        error: function(e){
			alert(e.statusText + " Failed to get the folders in Dropbox");
        }
    })
}

function initVariables(){
	 gFileTitle = "";
	  
  // get highest id
	var highest = -1;
	var id = 0;
	var lines = $(".line");
	// Find the highest ID and do an autofit
	for (i=0; i<lines.length;i++) {
		id = lines[i].getAttribute("id");
		if (id > highest) {
			highestgid = id;
		}
		//fitToContent(lines[i]);
	}
	
	var gCurrentTextarea=null; 
	var keyctr=0;
}

function assignKeys(){
  // uses $.Shortcuts.js : http://www.openjs.com/scripts/events/keyboard_shortcuts/#keys
  	// tab
  	

    $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Tab',
   	 	enableInInput: true,
    	handler: function() {
    		if ( $(gCurrentTextarea).hasClass("line") == true){
			operateOnLine(gCurrentTextarea, "INDENT");
			}
		}
	});
    $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Tab',
   	 	enableInInput: true,
    	handler: function() {
			operateOnLine(gCurrentTextarea, "OUTDENT");
		}
	});

	
	// $.Shortcuts.add("Shift+Tab",function() {
// 		operateOnLine(gCurrentTextarea, "OUTDENT");
// 	});
// 
// 	$.Shortcuts.add("Shift+Right",function() {
// 		operateOnLine(gCurrentTextarea, "INDENT_ONE_LINE");
// 	});
// 	$.Shortcuts.add("Shift+Left",function() {
// 		operateOnLine(gCurrentTextarea, "OUTDENT_ONE_LINE");
// 	});

 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Enter',
   	 	enableInInput: true,
    	handler: function() {
		if (gCurrentTextarea === null){
			var curel = $("#startingdiv");
		}
		else {
			var curel = gCurrentTextarea;
		}
		createNewLine(curel);
		}
	});		

// 	$.Shortcuts.add("Enter",function() {
// 		if (gCurrentTextarea === null){
// 			var curel = $("#startingdiv");
// 		}
// 		else {
// 			var curel = gCurrentTextarea;
// 		}
// 		createNewLine(curel);
// 	});


// 	$.Shortcuts.add("Shift+Enter",function() {
// 		insertString(gCurrentTextarea, String.fromCharCode(13)+String.fromCharCode(10));
// 	});

// Insert line break
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Enter',
   	 	enableInInput: true,
    	handler: function() {
			insertString(gCurrentTextarea, String.fromCharCode(13)+String.fromCharCode(10));
		}
	});	
 // shift plus
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Backspace',
   	 	enableInInput: true,
    	handler: function() {
			deleteChar();
		}
	});	
	
	// show on cmd-shift-plus 
	 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Alt+Shift+Plus',
   	 	enableInInput: true,
    	handler: function() {
			operateOnLine(gCurrentTextarea, "SHOW");
		}
	});	
	// Hide on cmd-shift-minus 
	 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Alt+Shift+Minus',
   	 	enableInInput: true,
    	handler: function() {
			operateOnLine(gCurrentTextarea, "HIDE");
		}
	});		
	

// 	$.Shortcuts.add("Shift+" + String.fromCharCode(43),function() {
// 		operateOnLine(gCurrentTextarea,"SHOW");
// 	});
// 	$.Shortcuts.add("Backspace",function(e) {
// 			deleteChar();
// 	});
// 	//minus
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Right',
   	 	enableInInput: true,
    	handler: function() {
			operateOnLine(gCurrentTextarea, "INDENT_ONE_LINE");
		}
	});	
	
// shift left arrow
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Left',
   	 	enableInInput: true,
    	handler: function() {
			operateOnLine(gCurrentTextarea, "OUTDENT_ONE_LINE");
		}
	});	
	

// 	$.Shortcuts.add("Shift+" + String.fromCharCode(45),function() {
// 		operateOnLine(gCurrentTextarea,"HIDE");
// 	});
// 	// up arrow
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Up',
   	 	enableInInput: true,
    	handler: function() {
			moveCursor(gCurrentTextarea,"UP");
		}
	});	
		

// 	$.Shortcuts.add("Up",function() {
// 		moveCursor(gCurrentTextarea,"UP");
// 	});
// 	// down arrow
 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Shift+Down',
   	 	enableInInput: true,
    	handler: function() {
			moveCursor(gCurrentTextarea,"DOWN");
		}
	});		

// 	$.Shortcuts.add("Down",function() {
// 		
// 		$('#status').html("DOWN");
// 		$('#status').hide("250");
// 		$('#status').show("250");
// 		moveCursor(gCurrentTextarea,"DOWN");
// 	});

	
	// save file command-S


 $.Shortcuts.add({
    	type: 'down',
   	 	mask: 'Alt+S',
   	 	enableInInput: true,
    	handler: function() {
			saveFile("QUIET");
		}
	});		


$.Shortcuts.start();
// 	
}

function getElfromCaret(){
	// 
	var f1 = $(":focus");
	// var f1 = $(f).children();
// 	var f2 = f1[1];
	var f= f1.context.activeElement; 
	return f;
// 	document.activeElement;	//http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
//    var node = document.getSelection().anchorNode;
//    var n = node.nodeType;
//    if ( n == 3 ){
//    	return n;
//    }
//    else {
//    	return    	 node.parentNode;
//    	};
}



function keyWasPressed(){
	// is it a text area that needs to be resized?
	//fitToContent(gCurrentTextarea);
	// count keys and trigger doc save
	keyctr++;
	if (document.getElementById("savechk").checked){
		document.getElementById("keystrokectr").textContent = gKeysUntilSave - keyctr;
		if (keyctr >= gKeysUntilSave) {
			keyctr = 0;
			saveFile("QUIET");
		}
	}
	
	// var txtht = $(gCurrentTextarea).height();
// 	var div = $(gCurrentTextarea).parent()[0];
// 	var dht = $(div).height();
// 	$(gCurrentTextarea).css("height", txtht + 30 + "px");
	

}

function initDropZone(){
	//http://stackoverflow.com/questions/10261989/html5-javascript-drag-and-drop-file-from-external-window-windows-explorer

	var dropZone = document.getElementById('dropZone');

    // Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
    dropZone.addEventListener('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        $(e).css("backgroundColor","red");
    });

    // Get file data on drop
    dropZone.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer.files; // Array of all files
        for (var i=0, file; file=files[i]; i++) {
            if (file.type.match(/image.*/)) {
               //  var reader = new FileReader();
//                 reader.onload = function(e2) { // finished reading file data.
//                    // var img = document.createElement('img');
//                     //img.src= e2.target.result;
//                    // document.body.appendChild(img);
//                 }
//                 reader.readAsDataURL(file); // start reading the file data.
    	} 
    	else{
    		var reader = new FileReader();

    		reader.onload = function(e) {
  			var txt = reader.result;
  			//alert(txt);
  			openOpmlFile(txt);
}
    		reader.readAsText(file);
    	
    	}  
    }   });
}



//---------------- SET COOKIE
function setCookie_unused(cookieName,cookieValue) {
 var today = new Date();
 var expire = new Date();
 var nDays = 1700; // about 5 yrs
 expire.setTime(today.getTime() + 3600000*24*nDays);
 document.cookie = cookieName+"="+escape(cookieValue) + ";expires="+expire.toGMTString();
}

//---------------- GET COOKIE
function getCookie_DUPE(c_name)
{
	 var i,x,y,ARRcookies=document.cookie.split(";");
	 for (i=0;i<ARRcookies.length;i++)
	 {
	   x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	   y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	   x=x.replace(/^\s+|\s+$/g,"");
	   if (x==c_name)
		 {
		 return unescape(y);
		 }
	   }
}

function whichBrowser(){
	 var browserstr = navigator.userAgent.toLowerCase();
   // alert(browserstr);
   if (browserstr.indexOf("chrome") > -1) {
       browsertype = "webkit";
      
    }
   if (browserstr.indexOf("safari") > -1) {
       browsertype = "webkit";
     
    }
   if (browserstr.indexOf("firefox") > -1) {
       browsertype = "firefox";
       
    }
    if (browserstr.indexOf("opera") > -1) {
       browsertype = "opera";
       
    }
	  if (browserstr.indexOf("MSIE") > -1) {
       browsertype = "msie";
     
    }
	
}


// encode html
//http://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript

if (!String.prototype.encodeXML) {
  String.prototype.encodeXML = function () {
    return this.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
  };
}
if (!String.prototype.decodeXML) {
  String.prototype.decodeXML = function () {
    return this.replace(/&apos;/g, "'")
               .replace(/&quot;/g, '"')
               .replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&amp;/g, '&');
  };
}

function fitToContent(text_area){
	//!$.fx.off;
	
		//adjust div height
	//http://stackoverflow.com/questions/22571563/dynamically-resize-container-to-fit-text
	var div =   $(gCurrentTextarea).parent();
	var txtarea = gCurrentTextarea;
	var outerht = $(txtarea).outerHeight(true);
	$(div).height(outerht);

	// debug

	$("#status").html($("#status").html() + "<br>" + outerht + ": " + $(gCurrentTextarea).val().substr(0, 15));

	 return
	 
	 // DEBUG =======
	var scrollht = $(text_area).css("scrollHeight");
	if (browsertype == "MSIE") {
		
		$(text_area).css({"height" : scrollht + "px"}); 
		//text_area.style.height = text_area.scrollHeight + "px";
	} 	
	else {
		$(text_area).css({"height" : "auto", "scrollheight" : (scrollht - 2) + "px"}); 
		//text_area.style.height = 'auto';
	    //text_area.style.height = (text_area.scrollHeight -2) + "px";
	}
}
/*
** Returns the caret (cursor) position of the specified text field.
** Return value range is 0-oField.value.length.
*/

function insertString(tarea,s){
	var caret = doGetCaretPosition(tarea);
	var olds = $(tarea).val();
	var news = olds.substring(0,caret);
	news = news + s + olds.substring(caret);
	$(tarea).val(news);
}
function doGetCaretPosition (oField) {
	// thank you http://stackoverflow.com/questions/2897155/get-caret-position-within-an-text-input-field
  // Initialize
  var iCaretPos = 0;

  // IE Support
  if (document.selection) {

    // Set focus on the element
    oField.focus ();

    // To get cursor position, get empty selection range
    var oSel = document.selection.createRange ();

    // Move selection start to 0 position
    oSel.moveStart ('character', -oField.value.length);

    // The caret position is selection length
    iCaretPos = oSel.text.length;
  }

  // Firefox support
  else{ if (oField.selectionStart || oField.selectionStart == '0'){
    iCaretPos = oField.selectionStart;
	}}
  // Return results
  return (iCaretPos);
}

// needed for setCaretToPos
// thank you http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}

// thank you http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
function setCaretToPos (el, pos) {
  setSelectionRange(el, pos, pos);
}



function deleteChar(){
	
	// what element are we in?
	//var div = getElfromCaret(); // what element is the caret in?
	var el = getElfromCaret(); // get the text area
	//var ell = document.getSelection();
	//var el = el.anchorNode;
	// get the text
	var txt = $(el).val();
	
	// any text selected? Then delete it, and were done
	var sels = getSelectedText();
	if (sels[0] != sels[1]){
		var newtxt = txt.substr(0,sels[0]) + txt.substr(sels[1]);
		$(el).val(newtxt);
		return;
	}

   // if we're in an outline line and it's a blank line,
   // then go back a line
	
	if (($(el).hasClass("line")) && (txt == "")){
	// check for empty lines
		// if it's the only line left, don't delete the line
		//get parent
		var prevdiv = $(el).parent().prev();
		var prevtextarea = getTextareaFromDiv(prevdiv);
		//if ($(prevdiv).attr("id") == "startingdiv"){
		if ($(prevdiv).hasClass("linediv") == false){
			return;
		}
		// it's not the only line left, so delete it
		else{
			removeLine(el);
			gCurrentTextarea = prevtextarea;
			el = $(el).parent()[0];
			txt = $(el).text();
			// put cursor into the previous line
			if ((prevtextarea != undefined) && ($(prevdiv).hasClass("linediv"))){
				// get the textarea
				//var texta = getTextareaFromDiv(prev);
				var endspot = $(prevtextarea).val().length;
				setCaretToPos(prevtextarea,endspot);
				return	
			}	
		}
	 }
	 
	 // text isn't empty. Whatever type of line, delete a character

		// remove the character at the cursor because $.Shortcuts.js "propagate" crashes
		var p = doGetCaretPosition(el);
		if (p > 0) {
			var s = txt.substring(0,p-1) + txt.substring(p);
			$(el).val(s);
			// set caret position
			setCaretToPos(el, p - 1);
		}
		return
	 
}



function deleteChar_bak(){
	//el isthe textarea
	
	// any text selected? Then delete something
	var sels = getSelectedText();
	if (sels[0] != sels[1]){
		var txt = $(el).value();
		var newtxt = txt.substr(0,sels[0]) + txt.substr(sels[1]);
		$(txt).val(newtxt);
		return;
	}

	var el = getElfromCaret(); // what element is the caret in?
	if ($(el).attr("class") != "linediv"){
		return;
	}
	

	
	// check for empty lines
	var txt = $(el).val();
	if (txt !== ""){
		// remove the character at the cursor because $.Shortcuts.js "propagate" crashes
		var p = doGetCaretPosition(el);
		if (p > 0) {
			var s = txt.substring(0,p-1) + txt.substring(p);
			$(el).val(s);
			// set caret position
			setCaretToPos(el, p - 1);
		}
		return
	}
	else { // blank line, so delete it
		// make sure it's a div
		if (el.type == "textarea"){
			el = $(el).parent()[0];
		}
		// if it's the only line left, don't delete the line
		var prev = $(el).prev()[0];
		if ($(prev).attr("id") == "startingdiv"){
			return;
		}
		// not the only line left, so remove it	
		removeLine(el);
		gCurrentTextarea = prev;
		// set cursor into next line
		
		if ($(prev).hasClass("linediv")){
			// get the textarea
			var texta = getTextareaFromDiv(prev);
			var endspot = $(texta).val().length;
			setCaretToPos(texta,endspot);	
		}
		
	}   
}

function removeLine(el){
	// el is the textarea
	// if it is, get the div
	if (el.type == "textarea"){
		div = el.parentNode;
	}
	else {
		div = el;
	}
   // is the div hidden? If so, remove all children	
   var img =  ($(div).find("img"))[0];
   var src = $(img).attr("arrow");
   if (src == "down"){
		var hidden = false;
   }	
   else {
   	var hidden = true;
   	}
   	
   	// if no hidden children, then just delete this line
   	if ((!hidden) && ($(el).attr("id") != "0")){
   		var grandpar = div.parentNode;
   		grandpar.removeChild(div);
   		updateArrows();
   		return false; 
   	}
   	
   	// if has hidden children, delete them all
   	
		var childs = getAllChildrenOfLine(div);
		for (var i=0; i < childs.length; i++){
			var grandpar = childs[i].parentNode;
			 grandpar.removeChild(childs[i]);
		}
		updateArrows();
}
function getSelectedText(){
    // puts them into globals
    var el = gCurrentTextarea;
    // is el a textarea?
    if (el.type != "textarea"){
    	el = $(gCurrentTextarea).find("textarea").eq(0)[0];
    	gCurrentTextarea = el;
    }
    selend = el.selectionEnd;
    selstart = el.selectionStart;
    seltext = el.value.substring(selstart, selend);
    var sels =  new Array(selstart,selend);
    return sels;
}

function visitEveryLine(operation){
	// do somethingto every line
	var divs = $(".linediv");
	//var divs  = $(document.linediv)	;
	var i,id,chld, adiv, lev,lev2;
	for (i=0; i < divs.length; i++){
		if (operation == "DEBUGAUTORESIZE"){
			fitToContent(divs[i]);
		}
		if (operation == "AUTORESIZE"){
			var div = divs[i];
			var text_area = getTextareaFromDiv(div);
			$(text_area).focus();
			$(div).focus();
			//fitToContent(text_area);
			return;
			// reset height. Not sure what's setting it.
			$(text_area).css("height","auto");
			var th = $(text_area).css("height");
			$(text_area).val(th + ": " + $(text_area).val());
			thnumb = parseInt(th.substring(0, th.length - 2)) + 30;
			th = thnumb + "px";
			$(div).css("height",th);
 			//$("#status").text("DIV: " + $(div).css("height") + "TEXT: " + $(text_area).css("height"));
		 }
	
	
			if (operation == "UPDATEARROWS") {
				// does it have a visible child
				if (i != divs.length - 1) {
					// get the image
					var imgstr = "#" + $(divs[i]).attr("id") + " .lineimg";
					var img = $(imgstr)[0];
					var nextdiv  = divs[i + 1];
					// next line is visible and is indented
					if (($(nextdiv).is(':visible')) && ($(nextdiv).attr("level") > $(divs[i]).attr("level"))){
					
						// do down arrow
						
						$(img).attr("src", "images/down.png");
						$(img).attr("arrow", "down");
						//divs[i].childNodes[0].setAttribute("src", "images/down.png");
						//divs[i].childNodes[0].setAttribute("arrow", "down");
					}
					// next line is hidden and is indented
					if (($(nextdiv).is(':visible') === false) && ($(nextdiv).attr("level") > $(divs[i]).attr("level"))){
					
						// do right arrow because more content but hidden
						$(img).attr("src", "images/right.png");
						$(img).attr("arrow", "right");
						//divs[i].childNodes[0].setAttribute("src", "images/right.png");
						//divs[i].childNodes[0].setAttribute("arrow", "right");
					}
					// next line is visible and is not indented as much 
					if (($(nextdiv).attr("level") <= $(divs[i]).attr("level"))){
					
						$(img).attr("src", "images/bullet.png");
						$(img).attr("arrow", "dot");
						//divs[i].childNodes[0].setAttribute("src", "images/bullet.png");
						//divs[i].childNodes[0].setAttribute("arrow", "dot");
					}
				}
			} // update arrows
		
	}
}

function getAllChildrenOfLine(d){
	var cs = new Array;
	cs.push(d); // add the first. (Why?)
	var done = false;
	var startinglevel = getLevel(d);
	var next, current = d;
	while (!done){
		next = $(current).next()[0];
		if ((next === null) || (next === undefined)){
			return cs;
		}
		var nextlev = getLevel(next);
		if (nextlev <= startinglevel) {
			done = true;
		}
		else {
			cs.push(next);
			current = next;
			}
	}
	
	return cs;
}


function operateOnLine(currentdiv,verb){
	// indent from this line to next line of equal level or higher
	
	// Make sure currentdiv is the div, not the textarea
	if ($(currentdiv).is("textarea")){
		currentdiv = currentdiv.parentNode;
	}
	// get gcurrentdivrentTextarea indent level
	var currentdivlevel = getLevel(currentdiv);
	// check for maximums
	if ((verb == "OUTDENT") && (currentdivlevel <= 0)) { // bail if already 1
		return;
	}
	//if ((verb == "INDENT") && (currentdivlevel == gMaxIndents)) { // bail if too many
	//	return;
	//}
	var el = currentdiv;
	// indent the original line
	
	if ((verb == "INDENT") || (verb == "OUTDENT")) {
		var childs = getAllChildrenOfLine(currentdiv);
		for (var i=0; i < childs.length; i++){
			indentLine(childs[i], verb);
		}
	}
	if (verb == "OUTDENT_ONE_LINE"){
	    indentLine(el, "OUTDENT");
	    return
	}
	if (verb == "INDENT_ONE_LINE"){
	    indentLine(el, "INDENT");
	    return
	}
	
	// --- show/hide
	if ((verb == "SHOW") || (verb == "HIDE")) {
		showhideLine(nxtdiv, verb);
	}
				
	if (verb == "UPDATE ARROWS") {
		if (nxtdiv.style.display != "none") { // if next lev is higher and visible, show down arrow
			// get arrow span
			var arrowspan = parentdiv.firstChild;
			arrowspan.setAttribute("src", "./images/down.png");
			arrowspan.setAttribute("arrow", "down");
			
		}
	}
		
	
}

function showhideLine(o,which){
	if (which == "SHOW"){
		o.style.display = "block";
	}
	if (which == "HIDE"){
		o.style.display = "none";
	}
}


/* 
   Credit to John Resig for this function 
   taken from Pro JavaScript techniques 
*/
function next(elem) {
    do {
        elem = elem.nextSibling;
    } while (elem && elem.nodeType != 1);
    return elem;                
}
function prevDiv(elem) {
    do {
        elem = elem.previousSibling;
    } while (elem && elem.nodeType != 1);
    return elem;                
}

function nextDiv(d){
	
	var done = false, nextd;
	var dbug = 0;
	while (done == false){
		dbug++;
		if (dbug > 10){done = true;}
		nextd = $(".linediv").next(); // next sibling
		if ( (nextd.length ==0) || (nextd == undefined)  || (nextd == null)){
			done = true;
		}
		else {
			d = nextd;
		}
	}	
	return d
}

function getTextareaFromDiv(d){
	var e = $(d).find("textarea")[0]; //.firstChild;
	// if (e.tagName != "TEXTAREA"){
// 		var don = false;
// 		while (don == false) {
// 			e = e.nextSibling;
// 			if (e == null) {
// 				don = true;
// 				e = "NO TEXTAREA";
// 			}
// 			if (e.tagName == "TEXTAREA") {
// 					don = true;
// 				}
// 			}
// 		return e;
// 	}

return e;
	
}

function indentLine(div, which){
	var level = getLevel(div);
	var origlevel = level;
	// debug
	var whichdiv = div.getAttribute("id");
	//
	if (which == "INDENT") {
		level++;
	}
	if (which == "OUTDENT") { 
		level = level - 1;
		if (level < 0) {
			level = 0;
		}
	}
	// force the indent
	$(div).css('margin-left', (level * gindent) + "px");
	// does the class exist
	var classExists = selectorExists("t" + level);
    if (classExists == false){
	  createClass(level);
	  }
	 
	
	// change level data and class
	div.setAttribute("level", level + ""); // turn it into a string
	//div.setAttribute("level", level + "");
	div.setAttribute("class", "linediv " + "L" + (level + ""));
	

	//var cc = $(div).attr('class');
	//var oldclass = "t" + origlevel; // cc.substr(cc.indexOf("t") + 1, 1);
	//alert(oldclass);
	
	// update text area
	var tarea = getTextareaFromDiv(div);
	$(tarea).attr("class", "line " + "t" + level);
	$(tarea).attr("level",  level);
	if (gDebug){
		$(tarea).val(whichdiv + "\tLEVEL: " + level );
	}
	
	
	// update arrows
	updateArrows();
	fitToContent(tarea);
	return level
}

function getLevel(o){
	// return integer of gCurrentTextarea indent level
	var level = $(o).attr("level");
	if (level == null) {level = 0;}
	//return parseInt(level);
	level = parseInt(level);
	return level
}

function createNewOutline(){
	// if ($(".level").length == 0){
// 		var resp = confirm("Create new outline? Existing outline will be lost.");
// 		if (resp==false) {
// 		return
// 		}
// 	}
	$(".linediv").remove();
   highestgid=1; // reset global
   createNewLine($("#startingdiv"));
   $("#titletxtarea").val("TITLE").focus().select();
   gFileName = "";
   gFullPath = "Dropbox/";
   $("#savedir1").text("Dropbox");
   $("#savedir2").text("Dropbox");
   $("#savefilename1").text("");
   $("#savefilename2").text("");
   return $("#startingdiv");
}

function createClass(lev){
   // creates class for a level
   
   // get class name
   var classname = '.L' +  lev;
   
 
   // get indent
   var indent = gindent * (lev);
	var styletext =  classname + '{margin-left:' + indent + 'px;}';
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = styletext;
	document.getElementsByTagName('head')[0].appendChild(style);
	

	
}

// function initDefinedClasses(){
// 	// add indents to any initial L classes
// 	var classname ="", lev="";
// 	// Look through defined classes for .L#
//  	var selectors = getAllSelectors();
//     for(var i = 0; i < selectors.length; i++) {
//     	classname =selectors[i];
//     	if (classname.indexOf(".t") == 0){
//     		// is the rest of it a number??
//     		lev = classname.substr(2);
//     		// is numb an integer?
//     		// http://stackoverflow.com/questions/20311572/check-a-value-is-float-or-int-in-jquery
//     		//if(typeof (lev + 1)	 === 'number'){
//     			var numb = Number(lev);
//   				 if(numb % 1 === 0){
//   				 // it's an integer
//   					var indent = gindent * (numb);
// 					var styletext =  ".L" + numb + '{margin-left:' + indent + 'px;}';
// 					var style = document.createElement('style');
// 					style.type = 'text/css';
// 					style.innerHTML = styletext;
// 					document.getElementsByTagName('head')[0].appendChild(style);	
//      			}
//         	//}
//     	}
// 	}
// }

// http://stackoverflow.com/questions/983586/how-can-you-determine-if-a-css-class-exists-with-javascript
function getAllSelectors() { 
    var ret = [];
    for(var i = 0; i < document.styleSheets.length; i++) {
        var rules = document.styleSheets[i].rules || document.styleSheets[i].cssRules;
        for(var x in rules) {
            if(typeof rules[x].selectorText == 'string') ret.push(rules[x].selectorText);
        }
    }
    return ret;
}


function selectorExists(selector) { 
	selector = "." + selector;
    var selectors = getAllSelectors();
    for(var i = 0; i < selectors.length; i++) {
        if(selectors[i] == selector){
        	 return true;
        }
    }
    return false;
}
      
function createNewLine(div){
	// div= parent of text area after which you want to create new line
	//var div = gCurrentTextarea.parentNode;
	
	// if no div, then get the last one
	if (div == undefined){
		div = $(".linediv").last();
		// if there are no divs yet
		if (div.length == 0){
			div = document.getElementById("startingdiv");
		}
	}
	
	// if div is a textarea, then get its parent
	if ($(div).is("textarea")){
		div = $(div).parent();
	}
	
	// create new containing div
	var newdiv = document.createElement('DIV');
	var level = getLevel(div);
	
	// if new highest indent, create new class
	if (level > gHighestLevel) {
		// create class if one's been defined. 
		// does new class exist
		var classexists = selectorExists("L" + level);
		//if (classexists == true){
	  		createClass(level);
			newdiv.setAttribute("class", "linediv " + "L" + level);
	  	//}
	  //	else{
	  	//	newdiv.setAttribute("class", "defaultline linediv " + "L" + level);
	  	
	  	//}
	   gHighestLevel=level;
	}
	// set the class of the containing div
	// var levelstr = level + "";
// 		newdiv.setAttribute("class", "linediv " + "L" + level);
// 	}
	// not a new high
	else {
		newdiv.setAttribute("class", "linediv " + "L" + level);
	}
	// set the level attribute
	var levelstr = level + "";
	newdiv.setAttribute("level", levelstr);
	// set id
	highestgid++; // increment this global
	var gidstr = highestgid + "";
	newdiv.setAttribute("id", "l" + gidstr);
	$(newdiv).insertAfter(div);
	
	// append img
	var newimg = document.createElement("IMG");
	newimg.setAttribute("src","images/bullet.png");
	newimg.setAttribute("onclick","changeArrow(this)");
	newimg.setAttribute("arrow","bullet");
	newimg.setAttribute("class","lineimg");
 	newdiv.appendChild(newimg);

	
	
	// create new  textarea
	var newtextarea = document.createElement('TEXTAREA');
	newtextarea.setAttribute("onclick","noteSpot(this);");
	newlevel = "t" + levelstr; // set the level
	// set the classes
	newtextarea.setAttribute("class", newlevel + " " + "line");
	// set the level attribute
	newtextarea.setAttribute("level", levelstr);
	// set id
	newtextarea.setAttribute("id", gidstr);
	newdiv.appendChild(newtextarea);
	newtextarea.focus();
	gCurrentTextarea = newtextarea;
	if (gDebug){
		$(newtextarea).val(gidstr + "\tLEVEL: " + levelstr );
	}
	
		$( ".line" ).keypress(function(a) {
  			keyWasPressed();
  			// adjust height http://stackoverflow.com/questions/17283878/html-textarea-resize-automatically
  			var scrollht = a.scrollHeight;
  			$(a).css({"height":"auto","height" : scrollht + "px"});
	});
	// from jquery.elastic
	// $(newtextarea).elastic();
//  	$(newdiv).css({'height':'auto','display':'table'})
	
	//autoresize(newtextarea);
	// make it draggable via jquery
	makeDraggable(newimg);
	makeDroppable(newtextarea);
	//fitToContent(newtextarea);
	
	// from autoresize.js
	// $(newtextarea).autoResize({
// 		animate: {
// 			enabled:  true,
// 			duration: 'slow',
// 			complete: function() {
// 			// reset height. Not sure what's setting it.
// 			//$(text_area).css("height","auto");
// 			// var div = $(text_area).parent();
// // 			var th = $(text_area).css("height");
// // 			$(div).css("height",th);
//  			$("#status").text("DDIV: " + $(div).css("height") + "TEXT: " + $(text_area).css("height"));
// // 			}
// 		 }
// 	}
// 	});
	visitEveryLine("UPDATEARROWS");
	return newdiv;
}

function swapStyleSheet(sheet){
	document.getElementById('pagestyle').setAttribute('href', "php/themes/" + sheet + ".css");
	setCookie("theme",sheet);
}


function noteSpot(o){
	// plop a textarea in
	gCurrentTextarea = o; // update global
}

function changeArrow(o){
	// w = gCurrentTextarea state, in text; 0 = obj
	var s = o.getAttribute("src");
	var w = o.getAttribute("arrow");
	var div = o.parentNode;
	//gCurrentTextarea = o.parentNode; // update the gCurrentTextarea pointer
	if (w == "right") { // there's stuff hidden
		o.setAttribute("src", "images/down.png");
		o.setAttribute("arrow", "down");
	}
	if (w == "down") {
		o.setAttribute("src", "images/right.png");
		o.setAttribute("arrow", "right");
	}
	// do it
	var childs = getAllChildrenOfLine(div);
	// start at 1 because first is the original div, weirdly
	for (var i=1; i < childs.length; i++){
		if (childs[i] == gCurrentTextarea){
			gCurrentTextarea = $(childs[i]).prev().find("textarea")[0];
		}
			if (w=="down"){
				$(childs[i]).slideUp(200);
			}
			if (w=="right"){
				$(childs[i]).slideDown(200);
			}
		}
	
	
}



function saveBackup(){
	// save it as an opml file to the server
	saveFile("BACKUP");
	return
	
	
	var tit = document.getElementById("titletxtarea").value;
	//tit = "_A_outlinio_test"
	var body = buildOPML();
	//var body = "this is a test of outlinio save with virtual directories";
	$.ajax({
        type: "POST",
        url: "./writebackup.php",
		data:  "title=" + tit + "&body=" + body,
		//async: false,
		success: function(dirresult){
            resp = dirresult;
        },
        error: function(e){
			alert(e.statusText + " Failed writing backup file. If this continues to happen, uncheck the 'save' box");
        }
    })
}

function showDirSelector(mode){
	var filename = $("#savefilename1").text();
	if (filename == ""){
		filename = $("#titletxtarea").val();
	}
	// insert filename as prompt
	$("#savefilenametextarea").val(filename);
	if (mode == "BACKUP"){
		$('.backupchk').prop('checked', true);
	}
	else{
		$('.myCheckbox').prop('checked', false);
	}
	$("#savedir2").html(gDisplayFilePath);
	if (filename == ""){
		var filetitle = $("#titletxtarea").val();
		gFileTitle = filetitle;
	}
	else{
		var filetitle = gFileTitle;
	}
	
	$('#filetreediv').slideToggle(300);
}

function showFileTree(){
	// add a close button
	var btn = document.createElement("div");
	btn.setAttribute("id","filetreeclosebtn");
	btn.setAttribute("onclick", "$('#filetreediv').slideUp(300)");
	$(btn).text("X");
	$('#filetreediv').append(btn);
	$('#filetreediv').fadeToggle(300)
}

function openSaveDialog(){
	// opens the pulldown
	
	// is there a filename already?
	if (gFileName === ""){
		$("#savefilenametextarea").val($("#titletxtarea").val());
	}

 	$('#saveDialog').slideToggle(300);
}

function promptForFileName(){

	filename = prompt("Please enter a file name",$("#titletxtarea").val());
	if (filename === ""){
		return
	}
	

	// add opml if necessary
	var p = filename.lastIndexOf(".");
	if (p > -1){ // if a dot
		var ext = filename.substr(p);
		if (ext.toUpperCase() != ".OPML"){
			filename = filename + ".opml";
		}
	}
	else{ // no dot
		filename = filename + ".opml";
	}
	//update the page
	$("#savefilename1").text(filename);
	$("#filename2").text(filename);
	gFileName = filename;
	//return filename;
}

function getFileGlobals(f){
	// updates gFileName, gPathonly, gFullPath
	var path="", name="",fullpath ="";
	
	// is there Dropbox? If not, add it
	var p = f.indexOf("Dropbox");
	if ( (p == -1) ||(p> -1) && (p > 7) ){ // no Dropbox
		gFullPath = "Dropbox/" + gFullPath;	
	}
	
	// is there a name? If so, get it. If not, keep gFileName as it was
	var lastslash = f.lastIndexOf("/");
	if (lastslash < (f.length -1) ){
		gFileName = f.substr(lastslash + 1);
	}
	
	// get the pathonly, which already has Dropbox added to it
	gPathOnly = f.substr(0,lastslash - 1);
}
	

function saveFile(mode){
	
	// DEBUG: THIS WORKS:
	//gDropboxFullRoot = "./Dropbox/temp/_testh.opml";
	
	if ((gFileName === "") || (gFileName == undefined)){
		promptForFileName(); // sets gFileName
	}

	// check for .opml
	var p = gFileName.lastIndexOf(".");
	if (p > -1){ // if a dot
		var ext = gFileName.substr(p);
		if (ext.toUpperCase() != ".OPML"){
			filename = gFileName + ".opml";
		}
	}
	else{ // no dot
		gFileName = gFileName + ".opml";
	}
	// update the text area
	$("#savefilenametextarea").val(gFileName);
	
	
	gFullPath =  $("#savedir2").text() + "/" + gFileName;

	getFileGlobals(gFullPath);
	updateRecentList(gFullPath);
	setCookie("path",gFullPath);
	setCookie("filename",gFileName);
	
	var body = buildOPML();
	//var saveDir = gDisplayFilePath;
	
	// ------- AUTOMATIC BACKUP ---
	// if it's an automatic backup, use existing filename (prompt if none)
	// and save to local Dropbox
	if ((mode == "BACKUP") || (mode == "QUIET")){
		if (gFileName === ""){
			//showDirSelector("BACKUP");
			promptForFileName(); // sets gFileName
		}
		
		var fullpath = "./outline_backups/" + gFileName;
		// save it
		$.ajax({
			 type: "POST",
			 url: "php/saveLocalFile.php", 
			 data: {body: body, fullpath :  fullpath},
			 //async: false,
			 success: function(data) {
				if (mode != "QUIET"){
					notify(gFileName + " backed up to php/outline_backups", "OK");
				}
				setCookie("path",gFullPath);
				setCookie("file",filename);
			   },
			  error: function (e){
				if (e.statusText != "OK"){
					notify( "Error: " + e, "ERROR");
					}
				}
				 });		 
		$("#saveDialog").slideUp(300);
	}
	
	// ----------- EXPLICIT USER SAVE
	// if it's an explicit, user-triggered save, save to Dropbox
	// If no filename or path, open up the DB Saver
	// If filename and path, save to local DB 
	if ((mode == "NODIALOG") || (mode == "QUIET")){
		// no filename or no path, so open DB Saver
		if ((gFileName === "") || (gFullPath  === "")){
			notify("No filename or directory. Save failed", "ERROR");
			return
		}
	// else we're saving it locally to the existing path
		// name and path are set
		// save it
		
		//var fullpath = "./Dropbox/temp/_testg.opml"; // DEBUG
		$.ajax({
			 type: "POST",
			 url: "php/saveToLocalDropbox.php", 
			 data: {content: body, fullpath : gFullPath},
			 //async: false,
			 success: function(data) {
				if (mode != "QUIET"){
					notify(gFileName + " saved to " + gFullPath, "OK");
				}
				setCookie("path",gFullPath);
				setCookie("filename",gFileName);
			   },
			  error: function (e){
				if (e.statusText != "OK"){
					notify( "Error: " + e.statusText, "ERROR");
					}
				}
				 });
			return	
	}
	
	
	// ----------- SAVE AS
	if (mode == "SAVEAS"){
		// no  path, so open my browser
		if  (gFullPath  === ""){
			if ( ($("#savedir1").text() !== "pathname") || ($("#savedir1").text() !== "")) {
				gFullPath = $("#savedir1").text() + "/" + filename;
				gPathOnly = $("#savedir1").text();
				$("savedir").text(gPathOnly);
			}
			else { // we need a directory
				saveDirs();
			}
		}
	// else we're saving it locally to the existing path
		// name and path are set
		// save it
		//var fullpath = "./Dropbox" + gDropboxFullPath + filename;
		$.ajax({
			 type: "POST",
			 url: "php/saveToLocalDropbox.php", 
			 data: {content: body, fullpath : gFullPath},
			 //async: false,
			 success: function(data) {
				if (mode != "QUIET"){
					notify(gFileName + " saved to " + gPathOnly, "OK");
				}
			   },
			  error: function (e){
				if (e.statusText != "OK"){
					notify( "Error: " + e.statusText, "ERROR");
					}
				}
				 });
			setCookie("fullpath",gFullPath);
			//setCookie("file",gFileName);
			return	
	}

	// filename from filenamebox
	// (if user already created one, it will have been filled in automatically;
	// it's save in gFileTitle;
	// gFileName = $("#savefilenametextarea").val();
// 	if (gFileName==""){
// 		notify("File name required.","ERROR");
// 		return
// 	}

	
	

}

function saveFile_old(auto){
// saves as opml

	// if we already were given a title we shouldn't prompt for it again
	if (gFileTitle != ""){
		var filetitle = gFileTitle;
	}
	
	if (auto == "BACKUP"){
		var saveDir = "outline_backups";
		if (gFileTitle == ""){
			filetitle = "temp_backup";
		}
	}
	else{
		var saveDir = gFileTitle;
	}
	
	// user wants to be prompted for a filename
	// or hasn't given us one yet
	if ((auto != "BACKUP") && (auto != "QUIET") || (gFileTitle == "")){
		var filetitle = prompt("Enter a title (.opml will be added)",filetitle);
		if ((filetitle == null) && (filetitle== "")){
			notify("NOT saved, because no title", "ERROR");
			return
		}
		gFileTitle = filetitle; // save as global
	}

	var body = buildOPML();
	//var title = $(titletxtarea).val();
	filetitle = filetitle + ".opml";
	//var saveDir = "./Dropbox/outlines";
	
	 $.ajax({
		 type: "POST",
		 url: "php/savefile.php", 
		 data: {body: body, saveDir : saveDir, filename : filetitle},
		 //async: false,
		 success: function(data) {
		    //alert(title + " save to " + saveDir + "\n" + body);
		    notify(filetitle + " saved to " + gDisplayFilePath, "OK");
		   },
		  error: function (e){
			if (e.statusText != "OK"){
				notify( "Error: " + e, "ERROR");
				}
			}
             });
}

function stripExtension(originalTitle){
	// title without extension
	var p = originalTitle.lastIndexOf(".");
	if (p > -1) {
		var ext = originalTitle.substring(p + 1, originalTitle.length);
		titleNoExt = originalTitle.substring(0, p);
	}
	else{
		var titleNoExt = originalTitle;
	}
	
	return titleNoExt;
}

function downloadFile(which){

	
    // get format from the pulldown
 if ((which == undefined) || (which == null)){
    	 which = $("#exports").val();
	}
	
	// use filename
	if (gFileName == ""){
		var title = promptForFileName();
	}
	else {
		var title = gFileName;
	}
		
	// strip extension from file
	var titleNoExt = stripExtension(title);
	
	
	var body, filetype;
	switch (which){
   case "RTF":
    	var legittitle = titleNoExt + ".rtf";
	   body = buildRTF(legittitle); 
	   filetype="RTF";
	   break;
   case "HTML":
	   var legittitle = titleNoExt + ".html";
	   body = buildHTML(legittitle);
	    filetype="HTML";
	   break;
    case "TEXT":
	   var legittitle = titleNoExt + ".txt";
	   body = buildText(legittitle);
	    filetype="TEXT";
	   break;
    case "OPML": 
       var legittitle = titleNoExt + ".opml"; 
	   body = buildOPML();
	   filetype="OPML";
	   break;
    case "BACKUP":
	   var legittitle = backupDirectory + "\\" + titleNoExt + ".opml";
	   filetype = "BACKUP";
	   body = buildOPML();
	   break;
	default: 
		notify("Error in finding type of file to save. Not saved.", "ERROR")
		return;
   }
   
   // package it and insert download link
   doTheDownload(body, legittitle, filetype);
  
}

function doTheDownload(s, tit, filetype){


// thanks http://danml.com/download.html#Summary
	s = s.replace(String.fromCharCode(0),"");
	//download(s,"dlText.txt", "text/plain");
	switch (filetype){
	case "HTML":
		download(new Blob([s]), tit, "text/html");
		break;
	case "RTF":
		download(new Blob([s]), tit, "text/plain");
		break;
	case "TEXT":
		download(new Blob([s]), tit, "text/plain");
		break;
	case "OPML":
		download(new Blob([s]), tit, "text/plain");
		break;
	case "BACKUP":
		download(new Blob([s]), tit, "text/plain");
		break;
	}	

// thanks http://css.dzone.com/articles/html5-blob-objects-made-easier
// 	window.URL = webkitURL || window.URL;
// 	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
// 	var blob = new Blob([s], { type: 'text/plain' });
// 	var bloburl = window.URL.createObjectURL(blob)
// 	var a = document.createElement('a');
// 	a.href = bloburl; // window.URL.createObjectURL(file.getBlob('text/plain'));
// 	a.download = tit;
// 	a.textContent = 'Download ' + tit;
// 	$("#exportas").append(a);

}

function buildRTF(tit){
	// do the header
	
	var lf = String.fromCharCode(13);
	var outlinetitle = $("#titletxtarea").val();
	var b = "{\\rtf1" + lf + "{{\\b " + outlinetitle + "\\b\}" + lf + "\\par" + lf;

	// get all text areas
	var childs = $(".line");
	var lev, indent, txt;
	// walkthrouigh
	for (var i=0; i < childs.length; i++){
		// get level
		lev = getLevel(childs[i]);
		indent = lev * 300;
		// get text
		txt = $(childs[i]).val();
		b = b + "\r{\\pard \\li" +  indent  + " " + txt + "\\par}";
	}
	b = b + "\r}\r}";
	//alert(b);
	return b;
	
}



function buildText(tit){
	
	var b = "Filename: " + tit + "\n\n"; // title
	
	// walk the tree
	var openbranches = new Array;
	var alldivs = document.getElementsByTagName("div");
		// get all text areas
	var childs = $(".line");
	var lev, indent, txt, tabs;
	// walkthrouigh
	for (var i=0; i < childs.length; i++){
		// get level
		lev = getLevel(childs[i]);
		// build tabs
		tabs = "";
		for (var j=0; j < lev; j++){
		  tabs = tabs + "\t";
		}
		// get text
		txt = $(childs[i]).val();
		b = b + "\n" + tabs + txt;
	}

	return b
}


function buildHTML(tit){
		
	// do the header
	var b = "<html><head>\r";
	b = b + "<title>" + document.getElementById("titletxtarea").value + "</title>\r";
	b = b + "<style>\n";
	// generate indents
	for (var i = 0; i <= gMaxIndents; i++) {
		b = b + "\n.l" + parseInt(i) + "\n{\nmargin-left:" + parseInt(i * 30) + "px;\n}";
		b = b + "\n.t" + parseInt(i) + "\n{\nfont-family:Georgia,Bookman,Serif;\n}";
	}
	b = b + "\n</style>\n</head>\n<body>\n"
	
	b = b + "<h1>" + document.getElementById("titletxtarea").value + "</h1>";
	
	// walk the tree
	var openbranches = new Array;
	var alldivs = document.getElementsByTagName("div");
	var divs = new Array;
	var i, lev, el;
	// build array of only the divs that have a level
	for (i = 0; i < alldivs.length; i++){
		el = alldivs[i];
		lev = el.getAttribute("level"); // is it an outline row?
		if (lev != null) {
			divs.push(alldivs[i]);
		}
	}


	
	// go through the lines, nesting 
	var txt = "";
	var nextlev = 1000;
	var textel, donee, j, nextopenlev, lev2;
	
	for (i = 0; i < divs.length; i++) {
		lev = divs[i].getAttribute("level"); // get level
		
		textel = divs[i].firstChild.nextSibling;
		
	
			b = b + "\n<div level=" + lev + " class=\"" + "l" + lev + "\">\n<p level=\"" + lev + "\" class=\"t" + lev + "\">" + textel.value + "</p>\n</div>\r";		
		
	}	
	
	b = b + "\r</body></html>";
	//alert(b);
	return b
}

function getDate(){
	// thanks http://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime;
}

function buildOPML(){
	
	// get the title
	var title = $("#titletxtarea").val();
	//var legittitle = titleNoExtension() + ".opml";
	//var xmltitle = legittitle.encodeXML(legittitle);
	title = title.encodeXML();
	
	// do the header
	var b = '<?xml version="1.0" encoding="ISO-8859-1"?>\n';
	b = b + '<opml version="2.0">\n<head>\n';
	b = b + "\t<title>" + title + "</title>\r";
	b = b + "\t<dateModified>" + getDate() + "</dateModified>\r";
	b = b + "\t<ownerName></ownerName>\n\t<ownerEmail></ownerEmail>\n\t<ownerId></ownerId>\r";
	b = b + "\t<docs>http://www.opml.org/spec2</docs>";
	
	// walk the tree
	var openbranches = new Array;
// 	var alldivs = document.getElementsByTagName("div");
// 	var divs = new Array;
// 	var i, lev, el;
// 	// build array of only the divs that have a level
// 	for (i = 0; i < alldivs.length; i++){
// 		el = alldivs[i];
// 		lev = el.getAttribute("level"); // is it an outline row?
// 		if (lev != null) {
// 			divs.push(alldivs[i]);
// 		}
// 	}

	var divs = $(".linediv");
	
	

	// now walk that array to get expansion state
	var s = "";
	var arrow, img;
	for (i=0; i < divs.length; i++){
		img = divs[i].firstChild;
		arrow = img.getAttribute("arrow");
		if (arrow == "down"){
			s = s + i + ",";
		}
	}
	
	b = b + "<expansionState>" + s + "</expansionState>\r";
	b = b + "</head>\r<body>\r";
	
	// go through the lines, nesting 
	var txt = "";
	var nextlev = 1000;
	var textel, donee, j, nextopenlev, lev, lev2;
	
	for (i = 0; i < divs.length; i++) {
		lev = divs[i].getAttribute("level"); // get level
		if (i < (divs.length - 1)) { // look one ahead
			nextlev = divs[i + 1].getAttribute("level");
		}
		else {
			nextlev = -1;
		} // if at the end, don't bother
		textel = divs[i].firstChild.nextSibling;
		var xmlvalue = textel.value.encodeXML();
		
		// --next level is higher than gCurrentTextarea, then we have an indent and need an open tag
		if ( nextlev > lev) {
			b = b + "<outline text=\"" + xmlvalue + "\">\r";
				openbranches.push(lev); //  record that we have an open branch			
			} //endif if nextlev > lev
			
		// --nextlevel is lower or equal than gCurrentTextarea, then outdent, so close it up
		else { 
			b = b + "<outline text=\"" + xmlvalue + "\"/>\r";
		// check if anything else has to close
			// Strategy: Whenever a line is closed (i.e., next is lower or equal level)
			// close the tag. Whenever one opens (next is higher), push gCurrentTextarea level
			// onto stack. Whenever line closes, pop the stack. If stack is higher or
			// equal, then add </outine>. Repeat until stack is equal to or lower than
			// next.
			donee = false;
			j = i ;
			if (j == divs.length) {donee = true;} // are we at the end?
			var lev2 = nextlev;
			while (donee == false) {
				nextopenlev = openbranches[openbranches.length - 1]; // prior open branch's level
				if (nextopenlev >= lev2) {
					b = b + "</outline>\r";
					openbranches.length = openbranches.length - 1; // pop doesn't work?
					if (openbranches.length==0) {
					donee = true;
					}
					else { 
					nextopenlev = openbranches[openbranches.length - 1];
					}
				}
				else {
					donee = true;	
				}
				
			} // whle
		}
		// get the line's text
		
	}	
		//b = b + "</outline>"; 
		//alert(b);
		b = b + "\r</body>\r</opml>";
	return b
	
}

function openDefault(){
   //var el = document.getElementById("filetoopen");
   //el.value = gCurrentFullPath;
   whichBrowser(); // get the browser type
   if ((gCurrentFullPath !== undefined) && (gCurrentFullPath !=="")){
   openOpmlFile(gCurrentFullPath);
   }
}

function getLatestUpload(){
	$.ajax({
		type: "POST",
		//url: "./latestUpload.php",
		url: "php/find_latest_upload.php",
		success: function(data){
			$("#latestupload").text(data);
		},
		 error: function (e){
			notify("Couldn't find latest uploaded OPML file", "ERROR");
			$("#latestupload").text("No file found");
		}
	});
}

function readOPML(){
	// file has been uploaded
	// now get most recently uploaded and load it
	var latest = $("#latestupload").text();
	notify("Reading " + latest);
	$.ajax({
		type: "POST",
		//url: "./latestUpload.php",
		url: "php/find_and_parse_latest_upload.php",
		success: function(data){
			//$("#latestupload").text(data);
			parseOpmlJson(data);
		},
		 error: function (e){
			notify("ERROR loading file: " + e.statusText, "ERROR");
		}
	});

}

function openOpmlFile(txt){
	// takes text from drag and drop
	// WHY NOT DO THIS IN JS???????
	

	var jsonarray = new Array();
	var json;
	$.ajax({
                 type: "POST",
                 url: "php/opml_text_parser.php", 
                 data: "txt=" + txt,
                 dataType: "JSON",
                 //async: false,
                 success: function(data) {
                   parseOpmlJson(data);
                  // alert(xmlDoc);
                   },
                  error: function (e){
                  	//if (e.statusText != "OK"){
                  		json = "Error: " + e.responseText;
                  		notify(json, "ERROR");
                  		//}
                  	}
             }); //close $.ajax(
   
    // turn json into array
    

}

function openNewFileBookkeeping(fn){
	// update the metadata etc when a file is saved.
	
	// separate into filename and path
	
	var p = fn.lastIndexOf("/");
	if (p > -1){
		var path = fn.substr(0, p);
		var fname = fn.substr(p + 1);
	}
	else{
		var path = "";
		var fname = fn;
	}
	
	setCookie("path",path);
	setCookie("filename",fname);
	
	// update path displays
	$("#savedir1").text(path);
	$("#savefilename1").text(fname);
	$("#savedir2").text(path);
	$("#savefile2").text(fname);
	
	updateRecentList(fn);
}

function buildRecentFilesDiv(){
	$("#recentfileslist").empty();
	var i;
	for (i=0 ; i < gRecentFiles.length; i++){
		var div = document.createElement("div");
		$(div).attr("class","recentfile");
		$(div).text(gRecentFiles[i]);
		$("#recentfileslist").append(div);
	}
	
	var btn = document.createElement("input");
	btn.setAttribute("type","button");
	btn.setAttribute("onclick",'$("#recentdiv").slideUp(400)');
	btn.setAttribute("value","Close");
	$("#recentfileslist").append(btn);	
	
	// change color when mousedown
	 $(".recentfile").mousedown(function(){
    	$(this).addClass("recentfilemousedown");
    });
    // change it back
    $(".recentfile").mouseup(function(){
    	$(this).removeClass("recentfilemousedown");
    });
	// recent file list opens that file
    $(".recentfile").click(function(){
    	//alert("D");
    	var fname = "./Dropbox/" + $(this).text();
    	openOpmlFile_File(fname);
    });
    
}

function updateRecentList(fn){

	// get rid of line breaks
	fn = fn.replace(/(\r\n|\n|\r)/gm,"");

	// drop .Dropbox if necessary
	if (fn.indexOf("Dropbox/") > -1){
		var p = fn.indexOf("Dropbox/") + 8;
		fn = fn.substring(p);
	}
	
	// get the current list
	//var files = $("#recentfileslist").children();
	
	// add new to the top
	gRecentFiles.unshift(fn);
	
	var i = 0;
	var done = false;
	
	temparray = new Array();
    $("#recentfileslist").empty(); // clear it
    var listlen = gRecentFiles.length;
	while (done == false){
	
		// Add the files, unless it's the selected one, which is already in first place
		if ((gRecentFiles[i] == fn) && (i > 0) ) {
			// do nothing
		}
		else{
	
			temparray.push(gRecentFiles[i]);
		}
		i++;
		if ((i >= gMaxRecentFiles) || (i >= listlen)){
			done = true;
		}
	}
	
	gRecentFiles = temparray.slice(0); // copies the array. Weird but right.
	

    // save it
    writeRecentFiles();
	
	
}

function writeRecentFiles(){
	// grab the current ones from the pulldown
	//   (could also just use gRecentFiles)
// 	var flist = $("#recentfileslist").children();
// 	// update the global
// 	gRecentFiles.length=0;
// 	for (var i = 0 ; i < flist.length; i++){
// 		gRecentFiles.push( $(flist[i]).text());
// 		}
	var strlist = gRecentFiles.join(",");

	 $.ajax({
                 type: "POST",
                 url: "php/writeRecentFiles.php", 
                 data: "list=" + encodeURIComponent(strlist),
                 dataType: "JSON",
                 success: function(data) {
                  	//notify("Recent files written.");
                  	$("#status").text("Recent files written.");
                   },
                  error: function (e){
                  	if (e.statusText != "OK"){
                  		notify("Failed to write recent files: " + e.statusText, "ERROR");
                  	}
                  	else {
                  		$("#status").text("Recent file list updated.");
                  	}
                  	}
             }); //close $.ajax(


}

function openOpmlFile_File(fn){
	// xml parser
	//fname = "http://127.0.0.1/~davidmac2/outlinio2/test6.xml";
	
	//fn = "TESTTitle4.opml"; // DEBUG
	// if not file passed in, then get the name from the input box
	if ((fn=="") || (fn==undefined)){
		fn = $("#filetoopen").val();
		if ((fn=="") || (fn==undefined)) {
			fn = gCurrentFullPath;
		}
	}

	var jsonarray = new Array();
	var json;
	 $.ajax({
                 type: "POST",
                 url: "php/opml_parser.php", 
                 data: "filename=" + encodeURIComponent(fn),
                 dataType: "JSON",
                 //async: false,
                 success: function(data) {
                  	json=data;
                  	parseOpmlJson(data);
                  	$("#recentdiv").slideUp(400);
                  	openNewFileBookkeeping(fn);
                  	visitEveryLine("AUTORESIZE");
                
                  // alert(xmlDoc);
                   },
                  error: function (e){
                  	var ee = e;
                  	if (e.statusText != "OK"){
                  		notify("Error opening " + gFullPath + ": " + e.statusText, "ERROR");;
                  		}
                  	else{
                  		json=e.statusText;
						parseOpmlJson(json);
						$("#recentdiv").slideUp(400);
						openNewFileBookkeeping(fn);
                  		}
                  	}
             }); //close $.ajax(
   
    // turn json into array
    

}

function parseOpmlJson(json){
	// completes the job once parsed opml comes back as json
	    //var jsonarray = JSON.parse(json);
	var jsonarray = json; // JSON.parse(json);
	// get the doc title   
    document.getElementById("titletxtarea").value = jsonarray["title"];
			
	
	// build outline from array
	// remove old outline
	$(".linediv").remove();
    var i, diva, lev, txt;
    
   // var barray = jsonarray["content"];
   var barray = jsonarray["content"];
    // reset the globals if there's any content to this
    if (barray.length > 0) {
    	initVariables();
    }
    $("#titletxtarea").val(jsonarray["title"]); // first element of jsonarray is metadata
    
    // cycle through jsonarray["content"]
    for (var i=0; i < barray.length; i++){
		txt = barray[i]["text"];
		lev = barray[i]["level"];
		// create the class, if necessary
		createClass(parseInt(lev));
		// create the div
		// THIS IS THE ONLY TIME THIS FUNCTION IS CALLED:
		//diva = createNewLineDiv(i,lev,"bullet.png",txt);
		// get last div
	// 	var lastdiv = $(".linediv").last();
// 		if (lastdiv.length == 0){
// 			lastdiv = document.getElementById("startingdiv");
// 		}
		
		// var diva = $(gCurrentTextarea).parent();
		var newlastdiv = createNewLine();
		// put the level into it
		$(newlastdiv).attr("level",lev);
		// put the text into it
		var txta = getTextareaFromDiv(newlastdiv);
		$(txta).val(txt);
		//$(txta).css("display", "block");
		//alert(i + ": " + $(txta).val());
		//startingdiv.appendChild(diva);
		// fit to content
		//fitToContent(getTextareaFromDiv(diva));
	}
	//gidstr = i;
	addFileToDropdown();
	visitEveryLine("UPDATEARROWS");
	
}

function addFileToDropdown(){
	// add gFullPath to dropdown
	// If it's already there, bring it to the top
	
}

function walkTree(node, glevel){
	// walks opml tree
	// node = the xmlDoc
	// glevel = global
	//http://vivin.net/2005/07/01/innerhtml-alternative-for-xhtml-documents-in-firefox/
	var n="d";
	var a="";

	
	if (node.hasChildNodes()) {
		node = node.firstChild;
		
		do{
			//glevel=0;
			n = node.nodeName;
			if (n == "outline") {
				glevel++;
				a = node.getAttribute("text");
				treeArray.push(glevel + "=" + a);
			}
			
			walkTree(node,glevel);
			node = node.nextSibling;
			if ((n=="outline") && (!node.hasChildNodes())) {
				glevel = glevel - 1;
			}
			
		}
		
		while(node);
	}
}

function createNewLineDiv(idint, levelint, whicharrow, whichtext){

	 
	// create new containing div
	var newdiv = document.createElement('DIV');
	
	// if new highest indent, create new class
	if (levelint > gHighestLevel) {
	   createClass(levelint);
	   gHighestLevel=levelint;
	}
	// set the class of the containing div
	newdiv.setAttribute("class", "linediv " + "L" + levelint);
	// set the level attribute
	newdiv.setAttribute("level", levelint + "");
	// set id
	highestgid++; // increment this global
	newdiv.setAttribute("id", "l" + idint);
	
	// find the last linediv
	var linedivs = $(".linediv");
	if (linedivs.length == 0){
		var lastdiv = $("#startingdiv")[0];
	}
	else {
		var lastdiv = linedivs[linedivs.length - 1];
	}
	// insert the main div
	$(newdiv).insertAfter(lastdiv);
	
	// append img
	var newimg = document.createElement("IMG");
	newimg.setAttribute("src","images/" + whicharrow);
	newimg.setAttribute("onclick","changeArrow(this)");
	newimg.setAttribute("arrow",whicharrow.substr(whicharrow.indexOf(".") - 1));
	newimg.setAttribute("class","lineimg");
	newdiv.appendChild(newimg);
	
	// create new  textarea
	var newtextarea = document.createElement('TEXTAREA');
	newtextarea.setAttribute("onclick","noteSpot(this);");
	$(newtextarea).val(whichtext); // add the text
	newlevel = "t" + levelint; // set the level
	// set the classes
	newtextarea.setAttribute("class", newlevel + " " + "line");
	// set the level attribute
	newtextarea.setAttribute("level", levelint + "");
	// set id
	newtextarea.setAttribute("id", idint + "");
	newdiv.appendChild(newtextarea);
	newtextarea.focus();
	gCurrentTextarea = newtextarea;
	if (gDebug){
		$(newtextarea).val(idint + "\tLEVEL: " +  "LEVEL: " + (levelint + "") );
	}
	
		$( ".line" ).keypress(function(a) {
  			keyWasPressed();
  			// ADJUST HEIGHT
  			// http://stackoverflow.com/questions/17283878/html-textarea-resize-automatically
  			$(newtextarea).css({"height":"auto","height" : $(newtextarea).css("scrollHeight") + "px"});
	});
	
	//autoresize(newtextarea);
	// make it draggable via jquery
	makeDraggable(newimg);
	makeDroppable(newtextarea);
	// from jquery.elastic
// 	$(".line").elastic();
//  	$('.linediv').css({'height':'auto','display':'block'})

	//fitToContent(newtextarea);
// 	$(newtextarea).autoResize({ 
// 		animate: {
// 			enabled:  true,
// 			duration: 'slow',
// 			complete: function() {
// 			// reset height. Not sure what's setting it.
// 			//$(text_area).css("height","auto");
// 			// var div = $(text_area).parent();
// // 			var th = $(text_area).css("height");
// // 			$(div).css("height",th);
//  			$("#status").text("DIV: " + $(div).css("height") + "TEXT: " + $(text_area).css("height"));
// // 			}
// 		 }
// 	}
// 	});



}

function createNewLineDiv_old(idstr, levelstr, whicharrow, whichtext){
	// returns a div ready to be inserted
	
	// make the  div
	var newdiv = document.createElement('DIV');
	var newclass = "L" + levelstr;
	newdiv.setAttribute("class", newclass + " " + "linediv");
	//$(newdiv).addClass("line");
	newdiv.setAttribute("level", levelstr);
	// set id
	newdiv.setAttribute("id", "l" + idstr);
	// append new div as an equal div sibling
	//parentdiv.appendChild(newdiv);
	
	// append img
	var newimg = document.createElement("IMG");
	newimg.setAttribute("src","images/" + whicharrow);
	newimg.setAttribute("onclick","changeArrow(this)");
	newimg.setAttribute("arrow","bullet");
	newimg.setAttribute("align","top");
	newdiv.appendChild(newimg);
	
	// append textarea
	var newtextarea = document.createElement('TEXTAREA');
	newtextarea.setAttribute("onclick","noteSpot(this);");
	newlevel = "t" + levelstr;
	newtextarea.setAttribute("class", newlevel);
	$(newtextarea).addClass("line");
	newtextarea.setAttribute("level", levelstr);
	newtextarea.value = whichtext;
	// set id
	newtextarea.setAttribute("id", idstr);
	newdiv.appendChild(newtextarea);
	
	// make it draggable via jquery
	$(newimg).draggable({
	   //stop: handleDragStop,
	   helper: "DRAGGING",
	   cursor: "crosshair"
	 //snap: '#' + newclass
	});
	// $(newdiv).droppable({
// 	    drop: handleDropEvent,
// 	 	snap: '#' + newclass
// 	});
	makeDroppable(newdiv);
	
	return newdiv;
	
}


function updateArrows(){
	visitEveryLine("UPDATEARROWS");
}

function moveIn(which){
	var div = "#" + which;
	
	// if clicking while it's still visible, then hide it
	if ($(div).css("display") !== "none"){
		moveOut(div);
		return
	}
	
	// if save dialog, add in name of directory
	if (which == "savedir"){
		$("#savedir").text(gDisplayFilePath);
	}
	
	 $(div).css("top","0");
	$(div).slideDown(500);
	//$(div).animate({top: "0px"},500);
}

function moveOut(which){
		$(which).animate({top: "-250px"},500,function (){
			$(which).hide();
			});
		//$(which).hide();
		
}

function ShowHideDiv(which){
    // show or hide a div
    
    // hide any existing widget in case user hits a button
    // while the widget is still visible
    var existingID = $('#transoverlay').find('div:visible:first').attr("id");
    if ( (existingID !== undefined) && (existingID == which)) {// if hitting the same button
    	$("#" + existingID).fadeOut(300);
    	$("#transoverlay").fadeOut(400);
    	return
    }
    else{
    if (existingID !== undefined) {
    	$("#" + existingID).fadeOut(300);
    	}
    }
    
    // toggle the translucent overlay
    if (which !== "html"){
    	$("#transoverlay").fadeIn(400);
    }
       
    var whichdiv = document.getElementById(which);
    if (( whichdiv.style.display == 'none') || (whichdiv.style.display == "")) { // show it
        $(whichdiv).show("slow");
        if (which == "html") {
            updatehtml();
        }
		// go to it
// 		switch (which){
// 			case "savedir":
// 			    document.location = "#linksspot"; 
// 				break;
// 			case "imagediv":
// 			    document.location = "#imagespot"; 
// 				break;
// 			case "wrapdiv":
// 			    document.location = "#wrapspot"; 
// 				break;
// 			case "tablediv":
// 			    document.location = "#tablespot"; 
// 				break;	
// 			case "macroexpanddiv":
// 			    document.location = "#macroexpanddiv"; 
// 			    break;
// 			case "postdiv":
// 				document.location = "#postdive";
// 			break;					
// 			
// 		}
    }
    else 
        $(whichdiv).hide("slow");
}
function closeOverlay(){
	$("#transoverlay").fadeOut(400);
	$(".panel").hide();
	
}
function popup(){
	alert("pop");
}
function moveCursor(el,direction){
  // moves cursor into next visible line
  //get parent of textarea
  el = $(gCurrentTextarea).parent(); 
  if (direction == "DOWN"){
		var nexteldiv = $(el).next()[0];
		var nextel = $(nexteldiv).find("textarea")[0];
		
  }
    if (direction == "UP"){
    	var nexteldiv = $(el).prev()[0];
  		var nextel = $(nexteldiv).find("textarea")[0];
  		
  }
  setCaretToPos(nextel,$(nextel).val().length);
 
  //$(nextel).focus();
  return
  
  
  
  var childs = $('.line').css('display', 'block');
  // find which one we're in
  var thisone = -1;
  var nextone, next_el,el_id, child_id;
  for (var i=0; i < childs.length; i++){
  	 // compare the textarea's id with its Div's
  	 el_id = "l" + $(el).attr("id");
  	 child_id = $(childs[i]).attr("id");
     if (el_id   == child_id){
     	if (direction == "UP") {
     		nextone = i - 1;
     		if (nextone < 0) {
     			nextone = childs.length - 1;
     		}
     	}
     	if (direction == "DOWN") {
     		nextone = i + 1;
     		if (nextone >= childs.length) {
     			nextone =  0;
     		}
     	}
     	next_el = childs[nextone];
     	}
  }
 
  if ((next_el !== null) && (next_el !== "undefined")) { 
  	$(next_el).find("textarea").focus(); 
  	gCurrentTextarea = next_el;
  }
  //childs[targetel].focus();

}

function moveLine(el,direction){
	 el = gCurrentTextarea;
	
	// get all the children
	var a = new Array();
	var done = false;
	var el2,el3,lev2,lev3,i;
	var parcurrent = el.parentNode; // get container of gCurrentTextarea textbox - whatwe want to move
	el2 = parcurrent;
	lev2 = getLevel(el2);
	a.push(el2);
	while (!done){
		el3 = nextDiv(el2);
		// is it a higher level and thus a child?
		if (el3 != null){
			lev = getLevel(el3);
			if (lev > lev2){
				a.push(el3);
				el2=el3;
				lev = lev2;
			}
			else {
				done=true;
			}
		}
		else {done=true;}
	}
	
	var newparent;
	
	// get target node
	if (direction == "UP") {
		// go through array of children
		for (i = 0; i < a.length; i++) {
			newparent = prevDiv(prevDiv(a[i])); // prev div is where it is now
			insertAfter(newparent, a[i]);
		}
	}
	else { // down
		// get the next div down
		var onebelow = nextDiv(a[a.length-1]); // get last child div	
		for (i = 0; i < a.length; i++) {
			//newparent = nextDiv(prevDiv(a[i])); // prev div is where it is now
			insertAfter(onebelow, a[i]);
			onebelow = a[i]
		}
		
	}
	// append it 
	
	 
}

function makeDraggable(obj){
	//var hand = this.innerHTML;
	
      $(obj).draggable({
      	 revert: false,
      	 stack: ".lineimg",
      	  containment: 'document',
      	  zIndex:10000,
       appendTo: "body",
        helper: function(){                
				var ta = $(this).parent().find('textarea');
				var t = $(ta).clone(); // copy the first row's text area
				var txt = $(ta).val(); // textarea's text
				// make a mini-me that inverts the colors and is 0.5 width
				$(t).css({
					"background-color" : $(ta).css("color"), 
					"color" : $(ta).css("background-color"),
					"font-family" : $(ta).css("font-family"),
					"font-size" : "14px",
					"width" : "30%"
				});
				// count the rows
				var sourceparent = $(obj).parent();
				var numberOfLines = getAllChildrenOfLine(sourceparent).length;
				if (txt > 25) {txt = txt.substring(0,25) + "...";}
				$(t).val("Dragging " + numberOfLines + ". " + txt);
				return $(t)[0];
     		}
        });
}

function makeDroppable(obj){
	$(obj).droppable({
		hoverClass: "drophover",
		drop: function(event, ui) {
		
			var draggedparent = $(ui.draggable).parent();
			var targetdiv = $(this).parent();
			// if div above first line, make it the target
			if ($(this).attr("id") == "startingdiv"){
				targetdiv = $("#startingdiv");
			}
			
			// ---- Logic
			//1. if dragging single item over single item:
			//    - append drag to drop
			//2. if dragging single item over a closed item
			//       - append the drag to the last child of the closed
			//3. if dragging closed item over a single item:
			//    - Loop over the drag appending it to the drop
			//	    and changing the drop to the latest dragged
			//4. if dragging closed item over a closed item
			//      - loop over the dragged appending it to the drop
			//         and changing the drop to the latest dragged
			// -----
			
			// is drag or drop a cl osed item (i.e., with hidden lines)?
			// check the dragged item
			
			//Are we dragging a closed up element with children?
			var sourceHidesLines = false;
			var src = $(ui.draggable).attr("src");
			if (src == "images/right.png"){ 
				sourceHidesLines = true;
			}
			// Are we dropping onto a closed up element?
			var targetHidesLines = false;
			var fc = $(targetdiv).children()[0];
			var arrowimg  = $(fc).attr("src");
			if (arrowimg == "images/right.png"){
				targetHidesLines = true;
			}
			
			//1. if dragging single item over single item:
			if ((sourceHidesLines == false) && (targetHidesLines == false)){
				$(draggedparent).insertAfter(targetdiv);
			}
			
			//2. if dragging single item over a closed item
			//       - append the drag to the last child of the closed
			if ((sourceHidesLines == false) && (targetHidesLines == true)){
				var targetkids = getAllChildrenOfLine(targetdiv);
				$(draggedparent).insertAfter(targetkids[targetkids.length - 1]);
			}
			
			//3. if dragging closed item over a single item:
			//    - Loop over the drag appending it to the drop
			//	    and changing the drop to the latest dragged
			if ((sourceHidesLines == true) && (targetHidesLines == false)){
				var draggedkids = getAllChildrenOfLine(draggedparent);
				var lastchild = targetdiv;
				for (var i=0; i < draggedkids.length; i++){	
							$(draggedkids[i]).insertAfter(lastchild);
							lastchild = draggedkids[i];
						}
			}
			
			//4. if dragging closed item over a closed item
			//      - loop over the dragged appending it to the drop
			//         and changing the drop to the latest dragged
				
			if ((sourceHidesLines == true) && (targetHidesLines == true)){
				var draggedkids = getAllChildrenOfLine(draggedparent[0]);
				var dropkids = getAllChildrenOfLine(targetdiv[0]);
				var lastchild = dropkids[dropkids.length - 1];
				for (var i=0; i < draggedkids.length; i++){	
							$(draggedkids[i]).insertAfter(lastchild);
							lastchild = draggedkids[i];
				}
			}
	
     updateArrows();   
	}
	
	});
	
}

function getLastSubElement(topdiv){
	// gets the last indented element under a div
	
	// if none, then this div is also the lastchild
	var lastchild = topdiv;
	
	var topdivlevel = getLevel(topdiv);
	var kids = getAllChildrenOfLine(topdiv);
	var i=1, done = false; // first kid is the dropped element, so ignore
	while (done == false){
		var kidlevel = getLevel(kids[i]);
		if (kidlevel <= topdivlevel){
			done = true;
			lastchild = kids[i];
		}
		else{
			i++;
			if (i >= kids.length){
				lastchild = kids[i - 1];
				done = true;
			}
		}	
	}
	
	return lastchild
}

function selectDir(which){
	// selects which folder to save into
	
	// which line of the dir listing was clicked on
	var originalline = $(which).parent()[0];
	// visually indicate that its been selected
	$(".dirnameclass").removeClass("selecteddir");
	$(which).next().addClass("selecteddir");
	// build path to the selected dir
	var done= false, lev, index, prev, current,  priorlev, priorid, priorindex;
	var pathstring=$(which).next().text();
	var currentEl = originalline;
	var currentindex = $(originalline).attr("id");
	currentindex = parseInt(currentindex.substr(3)); // turn dir2 into 2
	var currentlev = parseInt($(originalline).attr("dirlev"));
	var leveltobeat = currentlev;
	while (done == false){
		// get prior
		priorindex = currentindex - 1;
		priorid = "dir" + priorindex;
		if (currentindex < 0){
			done = true;
		}
		else {
			var priorlevstr = $("#" + priorid).attr("dirlev");
			priorlev = parseInt(priorlevstr);
			if (priorlev == 0){ // did we reach root?
				pathstring = $("#" + priorid).text().trim() + "/" + pathstring.trim();
				done = true;
			}
			
			if ((priorlev < leveltobeat) && (done == false)){
				leveltobeat = priorlev;
				pathstring = $("#" + priorid).text().trim() + "/" + pathstring.trim();
			}
			currentEl = document.getElementById(priorid);
			currentindex = priorindex;
		}
	}
	
	//pathstring = gRootdir + "/" + pathstring;
	//gRootdir = pathstring;
	gDisplayFilePath = pathstring;
	setCookie("workingdir",gDisplayFilePath);
	$("#workingdirspan").html(gDisplayFilePath);
	notify(pathstring);
	$("#savebtn").attr("title",pathstring);
	$("#savefilenametextarea").text(pathstring); // add path to save-as pulldown
	return pathstring
	
}

function buildDirSelector(json){
	var j = JSON.parse(json);
	gDir = j;
	$("#dirs").html(""); // clear old
	// (get rid of unwanted folder extensions in refreshdirs.php)
	for (var i=0; i < j.length; i++){
			var line = document.createElement("div");
		
			var lev = j[i].indent;
			$(line).addClass("direntry");
			$(line).addClass("dir" + lev);
			$(line).attr("dirlev",lev);
			$(line).attr("id","dir" + i);
			$(line).css({marginLeft : ((lev * 10) + "px")});
			
			if (lev > 1){ // display root and next level down
				$(line).css({"display" :   "none"});
			}
			// add button to select
			var btn = document.createElement("span");
			btn.setAttribute("onclick","selectDir(this)");
			$(btn).addClass("dirselectspan");
			$(btn).html("&nbsp;");
			//$(div).append(btn);
			$(line).append(btn);
			var content = document.createElement("span");
			// add file name to div
			$(content).text(j[i].name);
			$(line).append(content);
			$(content).addClass("dirnameclass");
			//div.appendChild(btn);
			$("#dirs").append(line);
			line.setAttribute("onclick","expandDir(this)");
	}
	
}

function expandDir(dir){
	// get id
	var id = $(dir).attr("id");
	// get array index
	var which = id.substr(3);
	// get level of the parent
	var parlev = $(dir).attr("dirlev");
	// ident it
	// walk down until we hit one at the same level of this one
	var done = false, i=which, newlev,childdiv,marg;
	while (done == false){
		which++;
		if (which == gDir.length){
			done = true;
		}
		else {
			var childdiv = document.getElementById("dir" + which);
			newlev = $(childdiv).attr("dirlev");
			marg = (newlev * 10) +"px";
			$(childdiv).css({"marginLeft" : marg});
			if (newlev > parlev){
				$(childdiv).slideToggle("200");
			}
			else {
				done = true;
			}
		}
	} // which
	
	
}



function insertAfter( referenceNode, newNode ){
	// insert node after referenceNode
	if (referenceNode != null) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
}

function notify(s, status){
	//var rep = document.getElementById('insertme');
	
	$("#notifybanner").html(s);
	var windowwd = $(window).width();
	var bannerwd = $("#notifybanner").width();
	if ( (bannerwd / windowwd) > 0.6666){
		bannerwd = (windowwd * 0.6666);
	}
	bannerwd = windowwd * 0.4;
	
	// set width and right window edge as starting point
	$("#notifybanner").css({"width" : bannerwd + "px", "left" : (windowwd - bannerwd) + "px"});
	
	if (status == "ERROR"){
		var delaytime = 3000;
		$("#notifybanner").css({"background-color" :   "red"});
	}
	else {
		var delaytime = "1500";
		$("#notifybanner").css({"background-color" : "rgba(128,0,128,0.9)"});
	}
 
     $("#notifybanner").show("slide", { direction: "right" }, 1000, function(){
     	$(this).delay(delaytime);
     	$(this).hide("slide",{direction: "right"},500);
     });
}

