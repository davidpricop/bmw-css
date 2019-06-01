_satellite.pushAsyncScript(function(event, target, $variables){
  try {
    function onConsentChange() {
        _satellite.notify('DTM: CCR: user changed consent manually.');
        window.consentChanged = true;
        // Check whether an Opt-In or Opt-Out occured
        var isRegulationAccepted = _satellite.getVar('isRegulationAccepted');
        if (isRegulationAccepted === 'true') { // an Opt-In occured  
            window.optInClicked = true;
            //_satellite.getToolsByType('sc')[0].initialize();
          	_satellite.aaCustomizedPageCode();
        } else if (isRegulationAccepted === 'false') { // an Opt-Out occured
            _satellite.track('opt-out');
        }
    };

    var checkForConsentChange = function() {
        if (typeof cookiecontroller != "undefined" && cookiecontroller.api && cookiecontroller.api.registerOnConsentChange) {
            cookiecontroller.api.registerOnConsentChange(onConsentChange);
        } else {
            setTimeout(checkForConsentChange, 200);
        }
    }
    checkForConsentChange();
} catch (err) {}
});
