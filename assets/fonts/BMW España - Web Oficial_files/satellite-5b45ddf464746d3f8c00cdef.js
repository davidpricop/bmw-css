_satellite.pushAsyncScript(function(event, target, $variables){
  // Tracking of Usabilla layer and interactions

window.usabilla_live("setEventCallback", function(category, action, label, value) {
  
  //EventListener to get Information about successful completion of Usabilla 
  window.addEventListener("message", function(event) {

    if(!/d6tizftlrpuof\.cloudfront\.net/.test(event.origin)) {
      return;
    }
  
    var data = JSON.parse(event.data);
		
    //Set Adobe Analytics Variables for Usabilla Success
    if(data.type === "pageSwitch" && data.end) {     
      if(data.data.nps != undefined || data.data.Comment != undefined) {
        
       
 //<----Start of Setting independent Adobe Analytics Variables----->    
        // get and set default vars
        _satellite.getVar("defaultVars");

        // initialize event variable
        var events = "";

     
        // set eVars
        // TO DO: Set eVar18
        //s.eVar18 =
        s.eVar45 += "~rn:Usabilla";

        // set vars for vco pages
        if (_satellite.getVar('pa_cat_primaryCategory') === "VCO") {
          s.eVar9 = _satellite.getVar('pr_att_mmdr');
          s.eVar10 = _satellite.getVar('pr_att_mmdr');

          var configuratorUrl =  _satellite.getVar('URLNoParam') + "#/" + _satellite.getVar('pa_cat_subCategory01');
          s.eVar63 = configuratorUrl;  
          s.eVar34 = "VCO: Usabilla Feedback";
          s.eVar46 =  _satellite.getVar('pa_cat_subCategory01') + "|" + _satellite.getVar('pa_pag_pageName');
        }	 

        events += "event91,";    
//<----End of Setting independent Adobe Analytics Variables----->
        
//<----Start of Setting Usabilla Status dependent Adobe Analytics Variables----->       
      	s.eVar16 = "Open Layer~Finished User Feedback~Usabilla~Not available~" +  _satellite.getVar('URLNoParam') + "~Not available";
        
        if(data.data.ACTIVE_NPS_CMT != undefined) {
          var commentStatus = "yes";
        }
        else{
          var commentStatus = "no";
        }
        
        console.log(event);
        console.log(event.data);
        
        s.eVar79 = "id:" + label + "~sc:" + data.data.nps + "~co:" + commentStatus + "~pp:not set"; 
        
        // get clickPropValues
    		var clickProp = s.eVar16.split("~");
   			s.prop16 = clickProp[1] + "~" + clickProp[2] + "~" + clickProp[5];
        
        events += "event241,event242=" + data.data.nps + ",";
//<----End of Setting Usabilla Status dependent Adobe Analytics Variables----->       

        
//<----Start of Collection of all Adobe Analytics Variables----->    
    s.linkTrackVars+='eVar16,prop16,eVar9,eVar10,eVar46,eVar34,eVar79';
    s.linkTrackEvents+='event91,event37,event38,event250,event251,event42,event45,event46,event49,event44,event240,event241,event242';

    // remove last commata from events variable and put in s.events
    events = events.slice(0, - 1);
    s.events += events;
    
    s.tl(true,"o","Usabilla Tracking");
//<----End of Collection of all Adobe Analytics Variables----->    
        
      }      
    }
  });
    
  //Set Adobe Analytics Variables for Usabilla Start
  if(action == "Campaign:Open"){

//<----Start of Setting independent Adobe Analytics Variables----->
    // get and set default vars
    _satellite.getVar("defaultVars");

    // initialize event variable
    var events = "";


    // set eVars
    //s.eVar18 =
    s.eVar45 += "~rn:Usabilla";

    // set vars for vco pages
    if (_satellite.getVar('pa_cat_primaryCategory') === "VCO") {
      s.eVar9 = _satellite.getVar('pr_att_mmdr');
      s.eVar10 = _satellite.getVar('pr_att_mmdr');

      var configuratorUrl = _satellite.getVar('URLNoParam') + "#/" + _satellite.getVar('pa_cat_subCategory01');
      s.eVar63 = configuratorUrl;  
      s.eVar34 = "VCO: Usabilla Feedback";
      s.eVar46 =  _satellite.getVar('pa_cat_subCategory01') + "|" + _satellite.getVar('pa_pag_pageName');
    }	 

    events += "event91,";

//<----End of Setting independent Adobe Analytics Variables----->

//<----Start of Setting Usabilla Status dependent Adobe Analytics Variables----->           
    s.eVar16 = "Open Layer~Started User Feedback~Usabilla~Not available~" + _satellite.getVar('URLNoParam') + "~Not available";    
    s.eVar79 = "id:" + label + "~sc:not set~co:not set~pp:not set";

    // get clickPropValues
    var clickProp = s.eVar16.split("~");
    s.prop16 = clickProp[1] + "~" + clickProp[2] + "~" + clickProp[5];

    events += "event240,";
//<----End of Setting Usabilla Status dependent Adobe Analytics Variables----->       
    
//<----Start of Collection of all Adobe Analytics Variables----->    
    s.linkTrackVars+='eVar16,prop16,eVar9,eVar10,eVar46,eVar34,eVar79';
    s.linkTrackEvents+='event91,event37,event38,event250,event251,event42,event45,event46,event49,event44,event240,event241';

    // remove last commata from events variable and put in s.events
    events = events.slice(0, - 1);
    s.events += events;

    s.tl(true,"o","Usabilla Tracking");
//<----End of Collection of all Adobe Analytics Variables----->    

  }
});
});
