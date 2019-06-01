define('ds2-cookie-controller',
  [
    'jquery',
    'use!log'
  ],
  function($) {

    function ds2CookieController() {
      this.$window = $(window);
      this.initTrigger();

    }

    var proto = ds2CookieController.prototype;

    proto.initTrigger = function() {

      this.init();

    };

    proto.init = function() {
      var self = this;

      if (cookiecontroller.api.isInitialized()) {
        self.generellCookieBehaviorSet();
      } else {
        cookiecontroller.api.registerOnInitialized(function() {
          self.generellCookieBehaviorSet();
        });
      }
    }

    proto.generellCookieBehaviorSet = function() {
      var self = this,
        pShowDisclaimer = cookiecontroller.api.showDisclaimer();
      // cookiecontroller.api.switchDebugOn();
      //OPT_OUT: SET immediately the regulation accepted
      //
      if (cookiecontroller.api.areBrowserCookiesEnabled()) {
        if (cookiecontroller.api.hasRegulation()) {
          if (cookiecontroller.api.getRegulationType() == 'OPT_OUT') {
            if (pShowDisclaimer === true) {
              cookiecontroller.api.setRegulationAccepted();
            }
          }
        }
      }
      //display Disclaimer or not
      $(window).ready(function() {
        if (cookiecontroller.api.areBrowserCookiesEnabled()) {
          var optoutConfirmed = Boolean(cookiecontroller.api.getCookie('cc_optoutConfirmed'));
          if (!cookiecontroller.api.hasRegulation()) {
            //NONE: do nothing
          } else if ((cookiecontroller.api.getRegulationType() == 'OPT_IN' || cookiecontroller.api.getRegulationType() == 'SOFT_OPT_IN') && pShowDisclaimer === true) {
            self.cookieOptInOpen();
          } else if (cookiecontroller.api.getRegulationType() == 'OPT_OUT' && pShowDisclaimer === true ||
            cookiecontroller.api.getRegulationType() == 'OPT_OUT' && optoutConfirmed !== true) {
            self.cookieOptOutOpen();
          }
        }
        else {
          self.cookieErrorOpen();
        }
      });
      // consent change
      cookiecontroller.api.registerOnConsentChange(self.consentChanged);

      // events from cookie-disclaimer
      $(window).on('ds2-setRegulationAccepted ds2-setRegulationRejected ds2-closeAll ds2-optoutConfirmed', function(event) {
        switch (event.type) {
          case 'ds2-setRegulationAccepted':
            self.setRegulationAccepted();
            self.closeAll();
            break;
          case 'ds2-setRegulationRejected':
            self.setRegulationRejected();
            self.closeAll();
            break;
          case 'ds2-closeAll':
            self.closeAll();
            break;
          case 'ds2-optoutConfirmed':
            self.optoutConfirmedCookieSave();
            break;
          default:
        }
      });

    }

    proto.cookieContentRemove = function() {
    }
    proto.optoutConfirmedCookieSave = function() {
      if (cookiecontroller.api.areBrowserCookiesEnabled() && cookiecontroller.api.getRegulationType() == 'OPT_OUT') {
        cookiecontroller.api.setCookie('cc_optoutConfirmed', true);
      }
    }
    proto.cookieContentRevert = function() {
    }
    proto.cookieErrorOpen = function() {
      $('.ds2-cookie-controller-js--no-cookies').show();
    }
    proto.cookieErrorClose = function() {
      $('.ds2-cookie-controller-js--no-cookies').hide();
    }

    //Changed to CSS Animations BMWDGTLTP-17748
    proto.cookieOptInOpen = function() {
      $('.ds2-cookie-controller-js--opt-in')
        .addClass('ds2-cookie-disclaimer--slidedown')
        .removeClass('ds2-cookie-disclaimer--hide');
      $(window).trigger('opt-in-show');
      this.increaseFooterPadding('.ds2-cookie-controller-js--opt-in');
    }
    proto.cookieOptInClose = function() {
      this.decreaseFooterPadding('.ds2-cookie-controller-js--opt-in');
      $('.ds2-cookie-controller-js--opt-in')
        .removeClass('ds2-cookie-disclaimer--slidedown')
        .addClass('ds2-cookie-disclaimer--hide ds2-cookie-disclaimer--slideup');
    }
    proto.cookieOptOutOpen = function() {
      $('.ds2-cookie-controller-js--opt-out')
        .removeClass('ds2-cookie-disclaimer--hide')
        .addClass('ds2-cookie-disclaimer--slidedown');
      this.increaseFooterPadding('.ds2-cookie-controller-js--opt-out');
    }
    proto.cookieOptOutClose = function() {
      this.decreaseFooterPadding('.ds2-cookie-controller-js--opt-out');
      $('.ds2-cookie-controller-js--opt-out')
        .removeClass('ds2-cookie-disclaimer--slidedown')
        .addClass('ds2-cookie-disclaimer--hide ds2-cookie-disclaimer--slideup');
      $(window).trigger('opt-in-hide');
    }

    proto.increaseFooterPadding = function(disclaimerClass) {
        var _this = this;
        setTimeout(function() {
            var $footer = _this.getFooter();
            var $disclaimer = $(disclaimerClass);
            var originalFooterPaddingBottom = parseInt($footer.css('padding-bottom'));
            var extraPadding = originalFooterPaddingBottom + $disclaimer.height() + 10;
            $footer.css('padding-bottom', extraPadding + 'px');
        }, 1200);
    }

    proto.decreaseFooterPadding = function(disclaimerClass) {
        var $footer = this.getFooter();
        var $disclaimer = $(disclaimerClass);
        var totalPaddingBottom = parseInt($footer.css('padding-bottom'));
        if ($disclaimer.length > 0 && $disclaimer.height()) {
            var padding = totalPaddingBottom - $disclaimer.height() - 10;
            if (padding < 0) {
                padding = 0;
            }
            $footer.css('padding-bottom', padding + 'px');
        }
    }

    proto.getFooter = function() {
        // standard navigation
        var $footer = $('.ds2-main-footer');
        if ($footer.length < 1) {
            // uxn navigation
            $footer = $('#the-footer');
        }
        return $footer;
    }

    proto.setRegulationRejected = function() {
      cookiecontroller.api.setRegulationRejected();
    }

    proto.setRegulationAccepted = function() {
      if (cookiecontroller.api.isRegulationAccepted() === false) {
        cookiecontroller.api.setRegulationAccepted();
      }
    }
    proto.consentChanged = function() {
      log('consentChanged');
      $(window).trigger('ds2-consentChanged');
    }
    proto.closeAll = function() {
      this.cookieErrorClose();
      this.cookieOptInClose();
      this.cookieOptOutClose();
    }

    window.digitals2 = window.digitals2 || {};
    window.digitals2.cookieController = new ds2CookieController();

    return ds2CookieController;

  });

