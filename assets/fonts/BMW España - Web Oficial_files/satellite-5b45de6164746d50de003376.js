_satellite.pushBlockingScript(function(event, target, $variables){
  /*
// fire search direct call as soon as searchTerm is in data layer
function callSearch() {
  var searchTerm = _satellite.getVar("searchTerm");

  
  if(searchTerm != "") {
 // _satellite.track("search_simulated_page");
  
	} else {
	setTimeout(function(){ callSearch(); }, 1000);
	}
}


// trigger for search results
if (_satellite.getVar('pa_att_template').indexOf("/templates/search") > -1) {
  callSearch();
  
}   
*/
_satellite.notify("in page bottom 3rd party script");
// trigger for form start and success
function callForm() {
  var classBefore = document.getElementsByClassName('before-success')
	var beforeSuccess = $(classBefore).is(":visible");
  
  if(beforeSuccess) {
  _satellite.track("temp_form_start");
  
	} else {
	setTimeout(function(){ callForm(); }, 3000);
	}
}

var pa_att_template = _satellite.getVar("pa_att_template");

if(pa_att_template == "requests" || pa_att_template.indexOf("rfc") > -1 || pa_att_template.indexOf("tda") > -1 || pa_att_template.indexOf("rfo") > -1 || pa_att_template.indexOf("rfs") > -1) {
	console.log("khubruy123" + pa_att_template);
  callForm();
}

if(_satellite.getVar("isRegulationAccepted") == "false") {
    // delete the following 1st Party cookies; 2DO: check if domain is set correct / check if list is complete  
  var cookieList = _satellite.getVar('cookieList')

  // delete cookies on top level domain
  for (i = 0; i < cookieList.length; i++) {
    document.cookie = cookieList[i] + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT ;domain=.' + _satellite.getVar("topLevelDomain") + ';path=/';
  };
  
  // delete cookies on current hostname (e.g. relevant for Marketing Tag Cookies on m.bmw.at)
  for (i = 0; i < cookieList.length; i++) {
    document.cookie = cookieList[i] + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
  }; 
  
  // delete cookies on current hostname (e.g. relevant for adobe target mbox cookie on m.bmw.at)
  for (i = 0; i < cookieList.length; i++) {
    document.cookie = cookieList[i] + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT ;domain=' + window.location.hostname + ';path=/';
  };
  
  
  // output if in debug mode
  if (localStorage.getItem('sdsat_debug') == "true") {
    console.log("SATELLITE: Page Load request triggerd by _satellite.track suppressed -- regulation not accepted by user");
  };
}
  
});
