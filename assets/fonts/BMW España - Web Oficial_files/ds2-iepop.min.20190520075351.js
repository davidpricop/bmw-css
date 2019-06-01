define('ds2-iepop', [ 'jquery', 'ds2-main' ], function($) {
	function IEPop(component) {
		this.$component = $(component);
		var self = this;

	    if (cookiecontroller && cookiecontroller.api) {
	      if (!cookiecontroller.api.isInitialized()) {
	        cookiecontroller.api.registerOnInitialized(function () {
		  		self.init();
	        });
	      } else {
		  	self.init();
	      }
	    }
	}

	var proto = IEPop.prototype;
	var userAgent = window.navigator.userAgent;
	var mobile = [ 'iPhone', 'android', 'blackberry', 'nokia', 'opera mini', 'windows mobile', 'windows phone', 'iemobile', 'ipad' ];
	var CONF_IE_COOKIE = 'cc_ie_popup_bmw';

	proto.init = function() {
		var self = this;
		self._showHideIEPop();
		self._addEvents();
	}

	proto._showHideIEPop = function() {
		var self = this;

		if (self._isIE()) {
			if (self._cookiesEnabled()) {
				if (self._cookieIEPopCreated()) {
					self._displayIEPopContent(false);
				} else {
					self._displayIEPopContent(true);
				}
			} else {
				self._displayIEPopContent(true);
			}
		} else {
			self._displayIEPopContent(false);
		}
	}

	proto._displayIEPopContent = function(display) {
		if (display) {
			$('.ds2-iepop-content').addClass('ds2-cookie-disclaimer--slidedown')
	        						.removeClass('ds2-cookie-disclaimer--hide');

		} else {
			$('.ds2-iepop-content').removeClass('ds2-cookie-disclaimer--slidedown')
									.addClass('ds2-cookie-disclaimer--hide ds2-cookie-disclaimer--slideup');
		}
	}

	proto._addEvents = function() {
		var self = this;
		$('.ds2-iepop-js--close', self.$element).on('click', function(e) {
			e.preventDefault();
			if (self._cookiesEnabled()) {
				cookiecontroller.api.setCookie(CONF_IE_COOKIE, true);
			}
			self._displayIEPopContent(false);
		});
	}

	proto._isIE = function() {
		return userAgent.indexOf('MSIE ') > -1 || userAgent.indexOf('Trident/') > -1
	}

	proto._cookiesEnabled = function() {
		return cookiecontroller.api.areBrowserCookiesEnabled() && cookiecontroller.api.isRegulationAccepted();
	}

	proto._cookieIEPopCreated = function() {
		return cookiecontroller.api.getCookie(CONF_IE_COOKIE);
	}

	return IEPop;
});
