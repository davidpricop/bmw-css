define('ds2-tracking-sticky-sales-bar',
    ['jquery',
     'ds2-tracking-base',
     'ds2-tracking'],
    function ($, ds2TrackingBase, tracking) {
        $.widget('digitals2.ds2TrackingStickySalesbar', ds2TrackingBase, {

            _listenersInit: function () {
                var self = this;

                $('.ds2-sticky-sales-bar__link', self.element)
                    .on('click', function (mouseEvent) {
                        mouseEvent.preventDefault();

                        var $link = $(this);
                        var eventName = $link.text().trim();
                        var href = $link.attr('href') || '';
                        var element = 'Other';

                        var tempLink = document.createElement('a');
                        tempLink.href = href;

                        if (location.hostname === tempLink.hostname) {
                            self._callExpandEvent(
                                self.eventBuilder.newEvent()
                                    .eventName(eventName)
                                    .element(element)
                                    .cause('')
                                    .target(href)
                                    .eventAction('Internal click')
                                    .primaryCategory(self.TC.NAVIGATION)
                                    .delayed()
                                    .build()
                                ,
                                self.bmwTrackOptionsBuilder.options()
                                    .name('salesbar')
                                    .build());
                        } else {
                            self._callExpandEvent(
                                self.eventBuilder.newEvent()
                                    .eventName(eventName)
                                    .element(element)
                                    .cause('')
                                    .target(href)
                                    .eventAction('Outbound click')
                                    .primaryCategory(self.TC.NAVIGATION)
                                    .build()
                                ,
                                self.bmwTrackOptionsBuilder.options()
                                    .name('salesbar')
                                    .build());
                        }
                    });
                this._super();
            }
        });

        return function($stickySalesBar) {
            $stickySalesBar.ds2TrackingStickySalesbar(tracking.getOptions('ds2-sticky-salesbar'));
        }
    }
);

define( 'ds2-sticky-salesbar', ['jquery', 'ds2-tracking-sticky-sales-bar'], function($, stickySalesBarTracking) {
    function StickySalesbar(component) {
        var CSS_CLASS_STICKY = 'is-sticky',
            CSS_CLASS_VISIBLE = 'is-visible',
            CSS_CLASS_UXNENABLED = 'ds2-sticky-sales-bar--uxn';

        var isSticky = component.classList.contains(CSS_CLASS_STICKY),
            isUxnEnabled = component.classList.contains(CSS_CLASS_UXNENABLED),
            footerSelector = isUxnEnabled ? '#the-footer' : '.ds2-main-footer',
            actionBarSelector = '.ds2-action-bar',
            footer = document.querySelector(footerSelector),
            actionBar = document.querySelector('#action-bar'),
            debounceWait = calculateDebounceWait(),
            debounceScrollTimeout;

        function init() {
            if (actionBar) {
                actionBarCheck();
            }
            else {
                component.classList.add(CSS_CLASS_VISIBLE);
                stickyCheck();
            }
            lazyLoadRefresh();
            window.addEventListener('scroll', debounceScrollEvent);

        }

        // different lazy-loaded components do not throw any events after load complete
        // pragmatic approach to try a couple of times to stick or unstick the sticky salesbar correctly
        function lazyLoadRefresh() {
            var bodyUpdateInterval,
                counter = 0;

            var lazyLoadCheck = function() {
                (++counter <= 5) ? handleScrollEvent() : clearInterval(bodyUpdateInterval);
            };

            bodyUpdateInterval = setInterval(lazyLoadCheck, 1000);
        }

        function stick() {
            if (isSticky) {
                return;
            }

            isSticky = true;
            component.classList.add(CSS_CLASS_STICKY);
        }

        function unstick() {
            if (!isSticky) {
                return;
            }

            isSticky = false;
            component.classList.remove(CSS_CLASS_STICKY);
        }

        // dynamic debounce function to check sticky behaviour on scroll
        function debounceScrollEvent() {
            if (!debounceScrollTimeout) {
                debounceScrollTimeout = setTimeout(function() {
                    clearTimeout(debounceScrollTimeout);
                    debounceScrollTimeout = null;
                    handleScrollEvent();
                    calculateDebounceWait();
                }, debounceWait);
            }
        }

        function handleScrollEvent() {
            if (actionBar) {
                actionBarCheck();
            }
            else {
                stickyCheck();
            }
        }

        function stickyCheck() {
            if (getSalesbarPosition() >= getFooterPosition()) {
                unstick();
            } else {
                stick();
            }
        }

        function actionBarCheck() {
            if (!actionBar) return;
            if (getSalesbarPosition() >= getActionBarPosition() - component.offsetHeight) {
                component.classList.remove(CSS_CLASS_VISIBLE);
            } else {
                component.classList.add(CSS_CLASS_VISIBLE);
            }
        }

        // dynamially calculates the debounce delay duration.
        // if we move very close to sticking or unsticking edge, reduce the debounce wait timeout to avoid delayed state changes
        function calculateDebounceWait() {
            var thresholdPosition = actionBar ? getActionBarPosition() : getFooterPosition();
            if (Math.abs(thresholdPosition - getSalesbarPosition()) <= component.offsetHeight) {
                debounceWait = 10;
            } else {
                debounceWait = 200;
            }

        }

        function getSalesbarPosition() {
            var sbp = window.pageYOffset + window.innerHeight;

            if (isSticky) {
                sbp = sbp - component.offsetHeight;
            }

            return sbp;
        }

        function getFooterPosition() {
            if (!footer.offsetTop) {
                footer = document.querySelector(footerSelector);
            }
            return footer.offsetTop;
        }

        function getActionBarPosition() {
            if (!actionBar.offsetTop) {
                actionBar = document.querySelector(actionBarSelector);
            }
            return actionBar.offsetTop;
        }

        init();

        // init tracking
        stickySalesBarTracking($(component));
    }

    return StickySalesbar;
});

