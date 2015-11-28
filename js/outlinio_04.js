	/**
 * @author David Weinberger
 */
var revdate= "Oct. 30, 2015";


// Global Preferences
var gDownloadDir = "Downloads";
var savePath = "http://localhost/~weinbergerd/outlinio4/";
var backupDirectory = "./outline_backups/";
// how many keystrokes trigger a backup?
var gKeysUntilSave = 100; 
var opendefault_pref = false;
// globals
var gMaxIndents = 12;
var gdefaultfile = "test1.opml"; //"outlinio_default.opml";
var gHighestLevel = 0;
var gCurrentEl=null; 
var keyctr=0;
var gprevcontent;
var gclass;
var editing = true;
var highestgid=-1;
var browsertype ="";
var treeArray = new Array();
var glevel = 0;
var gindent = 30;
var gDebug = true; // debug it?
var gFileTitle = "";
var gDir = new Array(); // directory structure
var gRootdir = "Dropbox";
var gWorkingDir = gRootdir;
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
//   initDefinedClasses(); // add indent to .L div classes
  
  
 

  // show rev date
  document.getElementById("revdate").innerHTML="Rev date:" + revdate;
  // Cookies
  whichBrowser();
  var file2open = getCookie("lastfile");
  if ((file2open !== null) && (file2open !== 'undefined')){
  	gdefaultfile = file2open;
  }
  gdefaultfile = "default.opml";
  if (opendefault_pref == true){
  	openDefault();
  	setCookie("lastfile", gdefaultfile);
  }
  else{
  	createNewOutline();
  }
  
  gWorkingDir=getCookie("workingdir");
  if (gWorkingDir == undefined){
  	gWorkingDir = gRootdir;
  	var titletext = "Choose Directory. Currently: " + gRootdir;
  }
  else {
  	var titletext = gWorkingDir;
  }
  $("#savebtn").attr("title",titletext);
  $("#savedirname").html(gWorkingDir);
  $("#savefilename").val($("#titletxtarea").val());
  
  
 
	
	var firstel = document.getElementById("l0");
	//gCurrentEl = firstel;
	
	// dropbox
	
	var options = {
		error: function(e){
			alert("error:" + e);
		},
		success: function(files){
			readDropbox(files[0].link);
			// https://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/
			
// 			$.ajax({ 
// 				url: "./php/downloadDropboxFile.php", 
// 				//dataType: 'jsonp',
// 				success: function(data) { 
// 					 var d = data;
// 					 $("#show").html(d);
// 					
// 					  $.ajax({
//  					 	url: "./php/downloadDropboxContents(ilink)",
//  					 	success: function (cont){
//  					 		alert(cont);
//  					 	}
//  					 	});
// 					}
// 				});
		
			
		},
		linkType: "download"
		}
		
	// DEBUG -- uncomment these to get Dropbox working
	//var button = Dropbox.createChooseButton(options);
	//document.getElementById("dropboxbutton").appendChild(button);
	
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
		
		
	// 	fileref=document.createElement("link");
// 		fileref.setAttribute("rel", "stylesheet");
// 		fileref.setAttribute("type", "text/css");
// 		fileref.setAttribute("href", "css/" + "default.css");
// 		document.getElementsByTagName("head")[0].appendChild(fileref);
		
		
		
 // set up the theme switching pulldown
 $('#themeselectlist').bind('change',function(w) {   
			//$("this option[value='2']").text();
			var str = $("#themeselectlist option:selected").text();
			swapStyleSheet(str);
			});
			

 

	// add listener to do key counter
	// if ((browsertype == "firefox") || (browsertype == "opera") ||  (browsertype == "msie")) {
// 		document.getElementById('biggestdiv').addEventListener('keypress', keyWasPressed, false);
// 	}
// 	else {
// 	document.getElementById('biggestdiv').addEventListener('keyup', keyWasPressed, false);
// 	}
// }
}

//--------- SHOW SELECTED PROJECT IN CO<BO BOX
function indicateSelectedTheme(theme){
	 var ddl = document.getElementById("themeselectlist");;
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
	$('#workingdirspan').html(gWorkingDir);
	loadDirs();
}

function refreshDirs(){
	$.ajax({
        type: "POST",
        url: "./php/refreshdirs.php?rootdir=" + gRootdir,
		//async: false,
		//data: {rootdir : gRootdir},
		success: function(number_of_dirs){
          notify(number_of_dirs + " folders refreshed");
        },
        error: function(e){
			alert(e.statusText + " Failed to get the folders in Dropbox");
        }
    })
}
function loadDirs(){
	$.ajax({
        type: "POST",
        url: "./php/readdirsfile.php",
		//async: false,
		success: function(dirs){
			if ( ($("#dirs").text() == 'Working...') || ($("#dirs").text() == '')){
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
	
	var gCurrentEl=null; 
	var keyctr=0;
}

function assignKeys(){
  // uses shortcuts.js : http://www.openjs.com/scripts/events/keyboard_shortcuts/#keys
    shortcut.add("Tab",function() {
		operateOnLine(gCurrentEl, "INDENT");
	});
	shortcut.add("Shift+Tab",function() {
		operateOnLine(gCurrentEl, "OUTDENT");
	});
// 	shortcut.add("Right",function() {
// 		operateOnLine(gCurrentEl, "INDENT_ONE_LINE");
// 	});
// 	shortcut.add("Left",function() {
// 		operateOnLine(gCurrentEl, "OUTDENT_ONE_LINE");
// 	});
	shortcut.add("Shift+Right",function() {
		operateOnLine(gCurrentEl, "INDENT_ONE_LINE");
	});
	shortcut.add("Shift+Left",function() {
		operateOnLine(gCurrentEl, "OUTDENT_ONE_LINE");
	});
	shortcut.add("Enter",function() {
		if (gCurrentEl == null){
			var curel = $("#startingdiv");
		}
		else {
			var curel = gCurrentEl;
		}
		createNewLine(curel);
	});
	shortcut.add("Shift+Enter",function() {
		insertString(gCurrentEl, String.fromCharCode(13)+String.fromCharCode(10));
	});
	// backspace
	shortcut.add(String.fromCharCode(8),
	function() {
		deleteChar(gCurrentEl);
	});
	// shift plus
	shortcut.add("Shift+" + String.fromCharCode(43),function() {
		operateOnLine(gCurrentEl,"SHOW");
	});
	//minus
	shortcut.add("Shift+" + String.fromCharCode(45),function() {
		operateOnLine(gCurrentEl,"HIDE");
	});
	// up arrow
	shortcut.add("Up",function() {
		moveCursor(gCurrentEl,"UP");
	});
	// down arrow
	shortcut.add("Down",function() {
		
		$('#status').html("DOWN");
		$('#status').hide("250");
		$('#status').show("250");
		moveCursor(gCurrentEl,"DOWN");
	});
	shortcut.add("Meta+S", function(){
		saveFile("QUIET");
	});
	
}


function keyWasPressed(){
	// is it a text area that needs to be resized?
	//fitToContent(gCurrentEl);
	// count keys and trigger doc save
	keyctr++;
	if (document.getElementById("savechk").checked){
		document.getElementById("keystrokectr").textContent = gKeysUntilSave - keyctr;
		if (keyctr > gKeysUntilSave) {
			keyctr = 0;
			saveFile("QUIET");
		}
	}
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

	;
   return

// 	if (browsertype == "MSIE") {
// 		text_area.style.height = text_area.scrollHeight + "px";
// 	} 	
// 	else {
// 		text_area.style.height = 'auto';
// 	    text_area.style.height = (text_area.scrollHeight -2) + "px";
// 	}
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
  else if (oField.selectionStart || oField.selectionStart == '0')
    iCaretPos = oField.selectionStart;

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
function setCaretToPos (input, pos) {
  setSelectionRange(input, pos, pos);
}

function deleteChar(el){
	//el isthe textarea
	
	// any text selected??
	var sels = getSelectedText();
	if (sels[0] != sels[1]){
		var txt = $(el).value();
		var newtxt = txt.substr(0,sels[0]) + txt.substr(sels[1]);
		$(txt).val(newtxt);
		return;
	}
	
	// check for empty lines
	var txt = $(el).val();
	if (txt !== ""){
		// remove the character at the cursor because shortcuts.js "propagate" crashes
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
		if ($(el).attr("id") != "titletxtarea"){
			removeLine(el);
		}
	}   
}

function removeLine(el){
	// el is the textarea
	
	
   // is the div hidden? If so, remove all children	
   var div = el.parentNode; 
   var img =  ($(div).find("img"))[0];
   var src = $(img).attr("arrow");
   if (src = "down"){
		var hidden = false;
   }	
   else {
   	var hidden = true;
   	}
   	
   	// if no hidden children, then just delete this line
   	if ((!hidden) && ($(el).attr("id") != "0")){
   		var grandpar = div.parentNode;
   		grandpar.removeChild(div);
   		return false; 
   	}
   	
   	// if has hidden children, delete them all
   	
		var childs = getAllChildrenOfLine(div);
		for (var i=0; i < childs.length; i++){
			var grandpar = childs[i].parentNode;
			 grandpar.removeChild(childs[i]);
		}
}
function getSelectedText(){
    // puts them into globals
    var el = gCurrentEl;
    selend = el.selectionEnd;
    selstart = el.selectionStart;
    seltext = el.value.substring(selstart, selend);
    var sels =  new Array(selstart,selend);
    return sels;
}

function visitEveryLine(operation){
	// do somethingto every line
	var divs = $(".linediv");
	var i,id,chld, adiv, lev,lev2;
	for (i=0; i < divs.length; i++){
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
					if (($(nextdiv).is(':visible') == false) && ($(nextdiv).attr("level") > $(divs[i]).attr("level"))){
					
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
	cs.push(d); // add the first
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


function operateOnLine(cur,verb){
	// indent from this line to next line of equal level or higher
	
	// for some reason, gcurrentel is being set to the textarea. hack:
	if ($(cur).is("textarea")){
		gCurrentEl = cur.parentNode;
		cur = gCurrentEl;
	}
	// get gCurrentEl indent level
	var curlevel = getLevel(cur);
	// check for maximums
	if ((verb == "OUTDENT") && (curlevel <= 0)) { // bail if already 1
		return;
	}
	//if ((verb == "INDENT") && (curlevel == gMaxIndents)) { // bail if too many
	//	return;
	//}
	var el = cur;
	// indent the original line
	
	if ((verb == "INDENT") || (verb == "OUTDENT")) {
		var childs = getAllChildrenOfLine(cur);
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
	var e = d.firstChild;
	if (e.tagName != "TEXTAREA"){
		var don = false;
		while (don == false) {
			e = e.nextSibling;
			if (e == null) {
				don = true;
				e = "NO TEXTAREA";
			}
			if (e.tagName == "TEXTAREA") {
					don = true;
				}
			}
		return e;
	}
	
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
	// return integer of gCurrentEl indent level
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
	// div= parent of text area where you want to create new line
	//var div = gCurrentEl.parentNode;
	
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
	gCurrentEl = newtextarea;
	if (gDebug){
		$(newtextarea).val(gidstr + "\tLEVEL: " + levelstr );
	}
	
		$( ".line" ).keypress(function(a) {
  			keyWasPressed();
	});
	
	//autoresize(newtextarea);
	// make it draggable via jquery
	makeDraggable(newimg);
	makeDroppable(newtextarea);
	//fitToContent(newtextarea);
	$(newtextarea).autoResize({
		animate: {
			enabled:  true,
			duration: 'slow',
			complete: function() {
			// reset height. Not sure what's setting it.
			//$(text_area).css("height","auto");
			// var div = $(text_area).parent();
// 			var th = $(text_area).css("height");
// 			$(div).css("height",th);
 			$("#status").text("DIV: " + $(div).css("height") + "TEXT: " + $(text_area).css("height"));
// 			}
		 }
	}
	})
}

function swapStyleSheet(sheet){
	document.getElementById('pagestyle').setAttribute('href', "php/themes/" + sheet + ".css");
	setCookie("theme",sheet);
}

function autoresize(ta){

}
function noteSpot(o){
	// plop a textarea in
	gCurrentEl = o; // update global
}

function changeArrow(o){
	// w = gCurrentEl state, in text; 0 = obj
	var s = o.getAttribute("src");
	var w = o.getAttribute("arrow");
	gCurrentEl = o.parentNode; // update the gCurrentEl pointer
	if (w == "right") { // there's stuff hidden
		o.setAttribute("src", "images/down.png");
		o.setAttribute("arrow", "down");
	}
	if (w == "down") {
		o.setAttribute("src", "images/right.png");
		o.setAttribute("arrow", "right");
	}
	// do it
	var childs = getAllChildrenOfLine(gCurrentEl);
	for (var i=0; i < childs.length; i++){
		if (childs[i] !== gCurrentEl){
			if (w=="down"){
				$(childs[i]).slideUp(200);
			}
			if (w=="right"){
				$(childs[i]).slideDown(200);
			}
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
        url: "./php/writebackup.php",
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

function showSaveDialog(mode){
	if (mode == "BACKUP"){
		$('.backupchk').prop('checked', true);
	}
	else{
		$('.myCheckbox').prop('checked', false);
	}
	$("#savedirname").html(gWorkingDir);
	if (gFileTitle == ""){
		var filetitle = $("#titletxtarea").val();
		gFileTitle = filetitle;
	}
	else{
		var filetitle = gFileTitle;
	}
	$("#savefilename").val(filetitle);
	$('#saveDialog').slideToggle(300);
}

function saveFile(mode){
	
	// if it's a backup, either use existing filename or show the dialogue
	if (mode == "BACKUP"){
		var filename = gFileTitle;
		if (filename == ""){
			showSaveDialog("BACKUP");
			return
		}
		var saveDir = "outline_backups";
	}
		

	// filename from filenamebox
	// (if user already created one, it will have been filled in automatically;
	// it's save in gFileTitle;
	var filename = $("#savefilename").val();
	if (filename==""){
		notify("File name required.","ERROR");
		return
	}
	gFileTitle = filename;
	
	
	// add opml if necessary
	var p = filename.lastIndexOf(".");
	if (p > -1){
		var ext = filename.substr(p);
		if (ext.toUpperCase() != ".OPML"){
			filename = filename + ".opml";
		}
	}
	
	body = buildOPML();
	var saveDir = gWorkingDir;
	
	
	// save it
	$.ajax({
		 type: "POST",
		 url: "php/savefile.php", 
		 data: {body: body, saveDir : saveDir, filename : filename},
		 //async: false,
		 success: function(data) {
		    notify(filename + " saved to " + gWorkingDir, "OK");
		   },
		  error: function (e){
			if (e.statusText != "OK"){
				notify( "Error: " + e, "ERROR");;
				}
			}
             });
             
    $("#saveDialog").slideUp(300);
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
		    notify(filetitle + " saved to " + gWorkingDir, "OK");
		   },
		  error: function (e){
			if (e.statusText != "OK"){
				notify( "Error: " + e, "ERROR");;
				}
			}
             });
}

function titleNoExtension(){
	// title without extension
	var titleel= document.getElementById("titletxtarea").value;
	var p = titleel.lastIndexOf(".");
	if (p > -1) {
		var ext = titleel.substring(p + 1, titleel.length);
		titleNoExt = titleel.substring(0, p);
	}
	else{
		var titleNoExt = titleel;
	}
	
	return titleNoExt;
}

function downloadFile(which){

	
    // get format from the pulldown
 if ((which == undefined) || (which == null)){
    	 which = $("#exports").val();
	}
		
	// strip extension from file
	
	var titleNoExt = titleNoExtension();
	
	
	
	switch (which){
   case "RTF":
    	var legittitle = titleNoExt + ".rtf";
	   body = buildRTF(legittitle); 
	   break;
   case "HTML":
	   var legittitle = titleNoExt + ".html";
	   body = buildHTML(legittitle);
	   break;
    case "TEXT":
	   var legittitle = titleNoExt + ".txt";
	   body = buildText(legittitle);
	   break;
    case "OPML":
	   
	   body = buildOPML();
	   break;
    case "BACKUP":
	   var legittitle = backupDirectory + "\\" + titleNoExt + ".opml";
	   body = 	(legittitle);
	   break;
	default: 
		notify("Error in finding type of file to save. Not saved.", "ERROR")
		return;
   }
   
   // package it and insert download link
   doTheDownload(body, legittitle);
  
}

function doTheDownload(s, tit){
// thanks http://css.dzone.com/articles/html5-blob-objects-made-easier
	window.URL = webkitURL || window.URL;
	window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
	var blob = new Blob([s], { type: 'text/plain' });
	var bloburl = window.URL.createObjectURL(blob)
	var a = document.createElement('a');
	a.href = bloburl; // window.URL.createObjectURL(file.getBlob('text/plain'));
	a.download = tit;
	a.textContent = 'Download ' + tit;
	$("#exportas").append(a);

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
	
	var b = b + "Filename: " + tit + "\n\n"; // title
	
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
		
	
			b = b + "\n<div level=" + lev.quote() + " class=\"" + "l" + lev + "\">\n<p level=\"" + lev + "\" class=\"t" + lev + "\">" + textel.value + "</p>\n</div>\r";		
		
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
	var textel, donee, j, nextopenlev, lev2;
	
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
		
		// --next level is higher than gCurrentEl, then we have an indent and need an open tag
		if ( nextlev > lev) {
			b = b + "<outline text=\"" + xmlvalue + "\">\r";
				openbranches.push(lev); //  record that we have an open branch			
			} //endif if nextlev > lev
			
		// --nextlevel is lower or equal than gCurrentEl, then outdent, so close it up
		else { 
			b = b + "<outline text=\"" + xmlvalue + "\"/>\r";
		// check if anything else has to close
			// Strategy: Whenever a line is closed (i.e., next is lower or equal level)
			// close the tag. Whenever one opens (next is higher), push gCurrentEl level
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
   //el.value = gdefaultfile;
   whichBrowser(); // get the browser type
   if ((gdefaultfile !== undefined) && (gdefaultfile !=="")){
   openOpmlFile(gdefaultfile);
   }
}

function openOpmlFile(txt){
	// takes text from drag and drop
	

	var jsonarray = new Array();
	var json;
	$.ajax({
                 type: "POST",
                 url: "./php/opml_text_parser.php", 
                 data: "txt=" + txt,
                 dataType: "JSON",
                 //async: false,
                 success: function(data) {
                   parseOpmlJson(data);
                  // alert(xmlDoc);
                   },
                  error: function (e){
                  	if (e.statusText != "OK"){
                  		json = "Error: " + e;
                  		}
                  	}
             }); //close $.ajax(
   
    // turn json into array
    

}

function openOpmlFile_File(fn){
	// xml parser
	//fname = "http://127.0.0.1/~davidmac2/outlinio2/test6.xml";
	
	//fn = "TESTTitle4.opml"; // DEBUG
	// if not file passed in, then get the name from the input box
	if ((fn=="") || (fn==undefined)){
		fn = $("#filetoopen").val();
		if ((fn=="") || (fn==undefined)) {
			fn = gdefaultfile;
		}
	}

var jsonarray = new Array();
var json;
 $.ajax({
                 type: "POST",
                 url: "php/opml_parser.php", 
                 data: "filename=" + fn,
                 dataType: "JSON",
                 //async: false,
                 success: function(data) {
                  	json=data;
                  	parseOpmlJson(data);
                  // alert(xmlDoc);
                   },
                  error: function (e){
                  	if (e.statusText != "OK"){
                  		json = "Error: " + e;
                  		}
                  	}
             }); //close $.ajax(
   
    // turn json into array
    

}

function parseOpmlJson(json){
	// completes the job once parsed opml comes back as json
	    //var jsonarray = JSON.parse(json);
	var jsonarray = json;
	// get the doc title   
    document.getElementById("titletxtarea").value = jsonarray["title"];
			
	
	// build outline from array
	// remove old outline
	$(".linediv").remove();
    var i, diva, lev, txt;
    
    barray = jsonarray["content"];
    // reset the globals if there's any content to this
    if (barray.length > 0) {
    	initVariables();
    }
    for (var i=0; i < barray.length; i++){
		txt = barray[i]["text"];
		lev = barray[i]["level"];
		// create the class, if necessary
		createClass(parseInt(lev));
		// create the div
		// THIS IS THE ONLY TIME THIS FUNCTION IS CALLED:
		diva = createNewLineDiv(i,lev,"bullet.png",txt);
		//startingdiv.appendChild(diva);
		// fit to content
		//fitToContent(getTextareaFromDiv(diva));
	}
	//gidstr = i;
	visitEveryLine("UPDATEARROWS");
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
	gCurrentEl = newtextarea;
	if (gDebug){
		$(newtextarea).val(idint + "\tLEVEL: " +  "LEVEL: " + (levelint + "") );
	}
	
		$( ".line" ).keypress(function(a) {
  			keyWasPressed();
	});
	
	//autoresize(newtextarea);
	// make it draggable via jquery
	makeDraggable(newimg);
	makeDroppable(newtextarea);
	//fitToContent(newtextarea);
	$(newtextarea).autoResize({
		animate: {
			enabled:  true,
			duration: 'slow',
			complete: function() {
			// reset height. Not sure what's setting it.
			//$(text_area).css("height","auto");
			// var div = $(text_area).parent();
// 			var th = $(text_area).css("height");
// 			$(div).css("height",th);
 			$("#status").text("DIV: " + $(div).css("height") + "TEXT: " + $(text_area).css("height"));
// 			}
		 }
	}
	});



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

function ShowHideDiv(which){
    // show or hide a div
    whichdiv = document.getElementById(which);
    if (whichdiv.style.display == 'none') { // show it
        $(whichdiv).show("slow");
		   }
    else {
        $(whichdiv).hide("slow");
        }
}
function popup(){
	alert("pop");
}
function moveCursor(el,direction){
  // moves cursor into next visible line
  //get parent of textarea
  el = $(gCurrentEl).parent(); 
  if (direction == "DOWN"){
		var nexteldiv = $(el).next()[0];
		var nextel = $(nexteldiv).find("textarea")[0];
		$(nextel).focus();
  }
    if (direction == "UP"){
    	var nexteldiv = $(el).prev()[0];
  		var nextel = $(nexteldiv).find("textarea")[0];
  		$(nextel).focus();
  }
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
  	gCurrentEl = next_el;
  }
  //childs[targetel].focus();

}

function moveLine(el,direction){
	 el = gCurrentEl;
	
	// get all the children
	var a = new Array();
	var done = false;
	var el2,el3,lev2,lev3,i;
	var parcurrent = el.parentNode; // get container of gCurrentEl textbox - whatwe want to move
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
	gWorkingDir = pathstring;
	setCookie("workingdir",gWorkingDir);
	$("#workingdirspan").html(gWorkingDir);
	notify(pathstring);
	$("#savebtn").attr("title",pathstring);
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
	
	if (status == "ERROR"){
		var delaytime = 3000;
		$("#notifybanner").css({"background-color" :   "red"});
	}
	else {
		var delaytime = "1500";
		$("#notifybanner").css({"background-color" : "rgba(128,0,128,0.9)"});
	}
   $("#notifybanner").html(s);
     $("#notifybanner").show("slide", { direction: "right" }, 1000, function(){
     	$(this).delay(delaytime);
     	$(this).hide("slide",{direction: "right"},500);
     });
}

