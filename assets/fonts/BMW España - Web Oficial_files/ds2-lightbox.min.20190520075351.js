/**
 *
 * @description Lightbox component
 */
define(
    'ds2-lightbox',
    [
        'ds2-scroll',
        'ds2-layer-error',
        'ds2-main'
    ],
    function(Scrollbar) {
        'use strict';

        /**
         * Regular Constructor to be returned in scope of Component Loader AMD Architecture
         *
         * @param element DOM element of lightbox
         */
        function ds2Lightbox(element) {
            // Assure correct scope
            var self = this;
            // init global options and constants of lightbox
            self._initGlobalOptions(element);

            // Create Lightbox: Defers Initialization of Lightbox until lightbox-ready event is dispatched
            self._create();

            // trigger callbacks that wait for lightbox to be initialized
            this.element.dispatchEvent(this.events.initialized);
        }


        // "PUBLIC" Functions first

        // Helping Function for opening lightboxes
        ds2Lightbox.prototype.openLightbox = function(trigger) {
            var self = this;
            this.element.classList.add('ds2-lightbox--open');
            document.body.classList.add('ds2-scrolllock');
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                var root = document.getElementsByTagName( 'html' )[0];
                root.classList.add('ds2-scrolllock');
            }
            // only set bar position if
            this.scrollbar && this.scrollbar.setBarPosition();
            // add the fade-in transition with a tiny delay, so display:block by the open class has already been applied
            // and the opacity transition works correctly
            setTimeout(function() { self.element.classList.add('ds2-lightbox--fade-in'); }, 10);
            trigger && (this.events.open.trigger = trigger);
            this.element.dispatchEvent(this.events.open);
        };

        ds2Lightbox.prototype.isOpen = function() {
            return this.element.classList.contains('ds2-lightbox--open');
        };


        // Helping Function for closing layers
        ds2Lightbox.prototype.closeLightbox = function(keepScrolllock) {
            var self = this;
            self.element.classList.add('ds2-lightbox--fade-out');
            self._doWithAnimationTimeout(function() {
                self.element.classList.remove('ds2-lightbox--open');
                self.element.classList.remove('ds2-lightbox--fade-out');
                self.element.classList.remove('ds2-lightbox--fade-in');
                if (!keepScrolllock) {
                    document.body.classList.remove('ds2-scrolllock');
                    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                        var root = document.getElementsByTagName('html')[0];
                        root.classList.remove('ds2-scrolllock');
                    }
                }

                self.element.dispatchEvent(self.events.close);
            });
        };

        ds2Lightbox.prototype._initGlobalOptions = function(element) {
            // Assure correct scope
            var self = this;

            // Cache element
            self.element = element;
            // write Lightbox to element so it is accessible from the outside
            self.element.Lightbox = self;
            // Move lightbox to bottom of the page so it displays correctly on mobile and is detached from other component's context
            self._moveLightboxToBottom();
            // Options object for global lightbox options
            self.options = {
                // Animation Timeout in ms, refer to transition in ds2-lightbox.scss
                ANIMATION_TIMEOUT:  500,
                isGcdmLayer:        self.element.getAttribute('data-lightbox-type') === 'gcdmLayer',
                isSlider:           self.element.getAttribute('data-lightbox-type') === 'slider',
                isAjax:             self.element.getAttribute('data-is-ajax') === 'ajax' // 'False' String otherwise would be true..
            };

            // define event IDs for lightbox
            self.eventIds = {
                ready: 'ds2-lightbox-ready',
                open: 'ds2-lightbox-open',
                close: 'ds2-lightbox-close',
                initialized: 'ds2-lightbox-initialized'
            };

            // define events for lightbox
            // polyfill for IE 11
            self.events = {};
            if (typeof window.Event === 'function') {
                self.events.close = new Event(self.eventIds.close);
                self.events.open = new Event(self.eventIds.open);
                self.events.initialized = new Event(self.eventIds.initialized);
            }
            else {
                self.events.close = document.createEvent('Event');
                self.events.close.initEvent(self.eventIds.close, false, false);
                self.events.open = document.createEvent('Event');
                self.events.open.initEvent(self.eventIds.open, false, false);
                self.events.initialized = document.createEvent('Event');
                self.events.initialized.initEvent(self.eventIds.initialized, false, false);
            }

            // Global DOM Classes for all Lightboxes
            self.domClasses = {
                closeButton: '.ds2-lightbox__close-button',
                closeLightboxButton: '.ds2-lightbox__close',
                lightboxMiddle: '.ds2-lightbox__middle'
            };
        };

        // Creation of Lightbox when it is ready (Markup is loaded on demand)
        ds2Lightbox.prototype._create = function() {
            var self = this;

            if (self.options.isAjax) {
                // Initialize (DOM Caching + Event Listeners) only when lightbox is ready
                self.element.addEventListener(self.eventIds.ready, function () {
                    self._init();
                });
            } else {
                self._init();
            }
        };

        // Initialize Lightbox by Caching DOM Elements and adding event listeners
        ds2Lightbox.prototype._init = function() {
            var self = this;

            // cache DOM elements in element scope
            self._cacheDomElements();

            //EVENT BINDINGS REGISTRY LAYER
            self._addEventListeners();

            if (self.options.isGcdmLayer) {
                self._initGcdmLayer();
            }

            if (self.options.isSlider) {
                self._initSlider();
            }

            // Cache scrollbar
            self.scrollbarElement = self.element.querySelector('.ds2-layer--scrollablepart');
            self.scrollbarElement && (self.scrollbar = new Scrollbar(self.scrollbarElement));

            // clicking cancel should close
            // for login and registration

            // clicking forgot password should open forgotten password layer

            // clicking register from login should open registration layer

            // clicking login from register should open login

            // open policy layer if policy confirmation is required

            // scrolling in lightbox should be possible. if scrolling in dropdown it should be avoided.

            // when data-reveal link is clicked:
            // compare with identifier
            // refresh elements
            // open listener
            // check height
            // do scroll
            // invoke

            //init NSC if it is there

            // when data-reveal is closed, hide everything again

            // add event triggers for resizing and different breakpoints (or solve this with CSS!)


            // integrate auto-open functionality
        };

        // Move Lightbox to bottom of main element to assure correct style and functionality
        ds2Lightbox.prototype._moveLightboxToBottom = function() {
            var self = this,
                main = document.querySelector('main');
            //only copy if not layer inside ng-app
            // if main exists, append lightbox to bottom. appendChild Moves and does not copy (!) so no further steps are needed.
            if (!this._childOf(self.element,document.getElementById('ng-app'))) {
                main && main.appendChild(self.element);
            }
        };

        ds2Lightbox.prototype._childOf = function(c, p) {
            while ((c = c.parentNode) && c !== p) ;
            return !!c
        };


        // Cache General DOM Elements of Lightbox
        ds2Lightbox.prototype._cacheDomElements = function() {
            var self = this;

            // convert querySelectorAll to array
            self.closeButtons = Array.prototype.slice.call(self.element.querySelectorAll(self.domClasses.closeButton));
            self.closeLightboxButtons = Array.prototype.slice.call(self.element.querySelectorAll(self.domClasses.closeLightboxButton));
            self.lightboxMiddle = self.element.querySelector(self.domClasses.lightboxMiddle);
        };

        // Add General Event Listeners of Lightbox
        ds2Lightbox.prototype._addEventListeners = function() {
            var self = this;

            self._addTrigger(self.closeButtons, 'click', function() {
                self.closeLightbox();
            });

            self._addTrigger(self.closeLightboxButtons, 'click', function() {
                self.closeLightbox();
            });
        };

        // Helping Function for replacing layers
        ds2Lightbox.prototype._replaceLightbox = function(lightboxToOpen) {
            var self = this;
            self.lightboxMiddle.classList.add('ds2-lightbox__middle--hide');
            // Put Old Lightbox in front during transition
            self.element.classList.add('ds2-lightbox--transition');
            // ToDo replace with modular / real "require" implementation of "ds2-main"
            window.digitals2.main.openLayer(lightboxToOpen);
            self._doWithAnimationTimeout(function() {
                self.element.classList.remove('ds2-lightbox--transition');
                self.closeLightbox(true);
                // clean up class for animation
                self.lightboxMiddle.classList.remove('ds2-lightbox__middle--hide');
            });
        };

        ds2Lightbox.prototype._doWithAnimationTimeout = function(fun) {
            setTimeout(function() {
                fun();
            }, this.options.ANIMATION_TIMEOUT);
        };

        ds2Lightbox.prototype._addTrigger = function(elem, type, fun) {
            Array.isArray(elem)
                ? elem.forEach(function(e) {e && e.addEventListener(type, fun)})
                : elem && elem.addEventListener(type, fun);
        };

        ds2Lightbox.prototype._delegateTrigger = function(elem, delegate, type, fun) {
            elem.addEventListener(type, function (e) {
                if (e.target.parentNode.matches(delegate)) {
                    fun();
                }
            });
        };

        /**
         * GCDM Layer Specific behaviour for login buttons, Canceling and Layer Switches.
         *
         * Cache GCDM Specific Elements and add Event Triggers only, if Layer has GCDMLayer Type
         */

        // init GCDM Layer special button functions
        ds2Lightbox.prototype._initGcdmLayer = function() {
            var self = this;
            self.gcdmDomClasses = {
                cancelButton: '.ds2-login-js--cancel',
                cancelRegisterButton: 'button.ds2-registration-js--cancel',
                cancelRegisterLink: 'a.ds2-registration-js--cancel',
                switchToForgotPw: '.ds2-login-js--to-password',
                switchToLogin: '.ds2-login-js--to-login',
                switchToRegister: '.ds2-login-js--to-register'
            };

            self._cacheGCDMElements();
            self._addGCDMEventTriggers();

        };

        ds2Lightbox.prototype._initSlider = function() {
            var self = this;
            self._addTrigger(this.element, this.eventIds.opened, function() {
                var jquery = require('jquery');
                var $slider = jquery(self.element).find('.ds2-slider');
                jquery(self.element).find('.slick-slider').each(function(i, o) {
                    jquery(o).slick("refresh");
                });

                $slider.addClass('ds2-slider--slide-single-image opened');
            });
        };

        // Cache GCDM Layer specific elements
        ds2Lightbox.prototype._cacheGCDMElements = function() {
            var self = this;

            self.cancelButton = self.element.querySelector(self.gcdmDomClasses.cancelButton);
            self.cancelRegisterButton = self.element.querySelector(self.gcdmDomClasses.cancelRegisterButton);
            self.cancelRegisterLink = self.element.querySelector(self.gcdmDomClasses.cancelRegisterLink);
            self.switchToForgotPw = self.element.querySelector(self.gcdmDomClasses.switchToForgotPw);
            self.switchToLogin = self.element.querySelector(self.gcdmDomClasses.switchToLogin);
            self.switchToRegister = self.element.querySelector(self.gcdmDomClasses.switchToRegister);
        };

        // Add GCDM Layer specific Event Triggers
        ds2Lightbox.prototype._addGCDMEventTriggers = function() {
            var self = this;

            self._addTrigger([
                    self.cancelButton,
                    self.cancelRegisterButton,
                    self.cancelRegisterLink],
                'click', function() {
                self.closeLightbox();
            });

            self._addTrigger(self.switchToForgotPw, 'click', function() {
                self._replaceLightbox('gcdmForgottenPassword');
            });

            self._addTrigger(self.switchToRegister, 'click', function() {
                self._replaceLightbox('gcdmRegistration');
            });

            self._addTrigger(self.switchToLogin, 'click', function() {
                self._replaceLightbox('gcdmLogin');
            });
        };

        return ds2Lightbox;
    }
);
