_satellite.pushAsyncScript(function(event, target, $variables){
  try {
    function transferConsentCookie() {
        _satellite.notify('c11e: CONSENT CHANGED or initial check');

        function checkCookieControllerConsent(cname) {
            // check if cookie exists and if value is set to ACCEPTED|REJECTED
            // return two values in array, either [found cookie value (full copy), ACCEPTED|REJECTED] or [undefined,undefined]
            return (new RegExp('^(?:|.*;\\s*)' + cname + '=([^=]*(ACCEPTED|REJECTED).*?)(?:;.*|)$').exec(document.cookie) || [undefined, undefined, undefined]).splice(1, 2)
        }
        var consentState = checkCookieControllerConsent('cc_consentCookie');
        var consentTransfer = checkCookieControllerConsent('cc_consentTransfer');
        //var consentTransfer = (/^(?:|.*;\s*)cc_consentTransfer=([^=]*(ACCEPTED|REJECTED).*?)(?:;.*|)$/.exec(document.cookie) || [undefined,undefined,undefined]).splice(1,2)
        if (consentState[0] == consentTransfer[0]) {
            _satellite.notify('c11e: same cookies, nothing to do');
        } else {
            _satellite.notify('c11e: transfer cookie different, updating');
            var meta = '; path=/; domain=' + _satellite.getVar('topLevelDomain') + '; expires=' + (new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)).toUTCString();
            document.cookie = 'cc_consentTransfer=' + consentState[0] + meta
            document.cookie = 'cc_ConsentCookie=' + (consentState[1] !== 'ACCEPTED') + meta;
        }
    }

    var checkForConsentChange = function() {
        if (typeof cookiecontroller != "undefined" && cookiecontroller.api && cookiecontroller.api.registerOnConsentChange) {
            cookiecontroller.api.registerOnConsentChange(transferConsentCookie);
        } else {
            setTimeout(checkForConsentChange, 200);
        }
    }
    checkForConsentChange();
    transferConsentCookie();
} catch (err) {
    console.log("c11e: " + err);
}
});
