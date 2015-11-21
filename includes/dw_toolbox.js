/**
 * @author davidmac2
 */

//------------------- AJAX 
var XMLHttpRequestObject = false; // the object that does ajax
// firefox only
XMLHttpRequestObject = new XMLHttpRequest();
var XMLHttpRequestObjects = new Array(); // create area of request objects

function escapeIt(s){
	// uses js escape  but cleans up uncaught terms
	var news = s;
	//news = escape(s);
	// get rid of +
	news = encodeURIComponent(s);
	return news;
}



 function getLegitTitle(t){
    // get a legit file tile from a string
    var title = t
    if (title == "") {
        title = prompt("Enter a title");
        if (title.length > 0) {
            document.getElementById("posttitle").value = title;
        }
        
    }
    
    var s1, s2, c, p, forbiddenchar;
	var includedate = false;
	if (includedate == true) {
		var mydate = new Date();
		var datestr = (mydate.getMonth() + 1) + "-";
		datestr = datestr + mydate.getDate() + "-";
		datestr = datestr + (mydate.getYear() + 1900);
		title = title + ":" + datestr;
	}
    var forbidden = " !%#$&*{};:></\\," + "'" + '"';
    for (i = 0; i < title.length; i++) {
        c = title.substring(i, i + 1);
        p = forbidden.indexOf(c);
        // hande ? as exception
        if (c == "?") {
            title = title.substring(1, i - 1) + "_Q" + title.substring(i + 1);
            p = -1;
        }
        // if not ?, use regexp to replace
        if (p > -1) {
            // this character in the title is one of the no-no's
            forbiddenchar = forbidden.substring(p, p + 1);
            s1 = RegExp(forbiddenchar, "g");
            title = title.replace(s1, "_");
        }
    }
    
    return title;
    
}
 
 function getCalendarDate()
{
	// http://www.web-source.net/web_development/javascript_date.htm
   var months = new Array(13);
   months[0]  = "January";
   months[1]  = "February";
   months[2]  = "March";
   months[3]  = "April";
   months[4]  = "May";
   months[5]  = "June";
   months[6]  = "July";
   months[7]  = "August";
   months[8]  = "September";
   months[9]  = "October";
   months[10] = "November";
   months[11] = "December";
   var now         = new Date();
   var monthnumber = now.getMonth();
   var monthname   = months[monthnumber];
   var monthday    = now.getDate();
   var year        = now.getYear();
   if(year < 2000) { year = year + 1900; }
   var dateString = monthname +
                    ' ' +
                    monthday +
                    ', ' +
                    year;
   return dateString;
}
 
 function getClockTime()
{
	// http://www.web-source.net/web_development/javascript_date.htm
   var now    = new Date();
   var hour   = now.getHours();
   var minute = now.getMinutes();
   var second = now.getSeconds();
   var ap = "AM";
   if (hour   > 11) { ap = "PM";             }
   if (hour   > 12) { hour = hour - 12;      }
   if (hour   == 0) { hour = 12;             }
   if (hour   < 10) { hour   = "0" + hour;   }
   if (minute < 10) { minute = "0" + minute; }
   if (second < 10) { second = "0" + second; }
   var timeString = hour +
                    ':' +
                    minute +
                    ':' +
                    second +
                    " " +
                    ap;
   return timeString;
}

// wraps things in quotes
http://javascript.crockford.com/remedial.html
String.prototype.quote = function () {
    var c, i, l = this.length, o = '"';
    for (i = 0; i < l; i += 1) {
        c = this.charAt(i);
        if (c >= ' ') {
            if (c === '\\' || c === '"') {
                o += '\\';
            }
            o += c;
        } else {
            switch (c) {
            case '\b':
                o += '\\b';
                break;
            case '\f':
                o += '\\f';
                break;
            case '\n':
                o += '\\n';
                break;
            case '\r':
                o += '\\r';
                break;
            case '\t':
                o += '\\t';
                break;
            default:
                c = c.charCodeAt();
                o += '\\u00' + Math.floor(c / 16).toString(16) +
                    (c % 16).toString(16);
            }
        }
    }
    return o + '"';
};
