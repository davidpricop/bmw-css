_satellite.pushAsyncScript(function(event, target, $variables){
  var isRegulationAccepted = _satellite.getVar('isRegulationAccepted');
if (isRegulationAccepted === 'true') 
{
//console.log("from the new container");
_satellite.track('checkAllPageRules');
}

_satellite.notify("container B");
});
