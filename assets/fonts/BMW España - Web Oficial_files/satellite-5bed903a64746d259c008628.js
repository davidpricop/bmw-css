_satellite.pushAsyncScript(function(event, target, $variables){
    //setting scroll tracking to true so that scroll components are loaded on the page.
if(_satellite.getVar('activateScrollTracking') === 'true') { 
  window.scrolltracking=true;
}
else {
  window.scrolltracking=false;
}  
});
