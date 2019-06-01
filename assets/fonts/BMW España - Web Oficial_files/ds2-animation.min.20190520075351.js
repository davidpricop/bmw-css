define('ds2-animation', ['jquery'], function ($) {

    'use strict';

    function Ds2animation() {}

    var proto = Ds2animation.prototype;

    /**
     *  BWMST-23689 Scrolling for Anchors
     *  On click on a link, if an anchor hash is in the url and targets the same page,
     *  it scrolls smoothly to that anchor.
     */
    proto.smoothScrollingToAnchorSamePage = function($element) {
        var href = $element.attr('href'),
            contentBarHeight = 0,
            anchor = '',
            pathname = window.location.pathname;

        if (href != null) {
            anchor = href.split('#', 1).pop();
            if (href.indexOf('#') > 0 &&
                href.length > 3 &&
                href.indexOf('#/') < 0 &&
                anchor == pathname) {

                $element.on('click', function(e) {
                    e.preventDefault();
                    if ($('.ds2-navigation-content-bar').length) {
                        contentBarHeight = -$('.ds2-navigation-content-bar').outerHeight(true);
                    }
                    var $target = $('#' + href.split('#').pop());
                    var targetTopOffset = $target.offset().top;
                    animateScrolling(contentBarHeight,targetTopOffset,$target);
                });
            }
        }
    }

    /**
     *  BWMST-3503 Scrolling for Anchors
     *  If an anchor hash is in the url when the page loads
     *  Correct the position after anchor-scroll-event
     */
    proto.smoothScrollingToAnchorByUrl = function() {
        var self = this,
            contentBarHeight = 0,
            userScrolled = false,
            target = window.location.hash.substring(1),
            isIntegrationUrl = target.indexOf("/") >= 0;

        // Prevent none anchor urls from executing the scrolling
        if (isIntegrationUrl) {
            return;
        }
        // Correct anchor scrolling
        if (!target) {
            return;
        }

        // is scrolling enable?
        window.digitals2 = window.digitals2 || {};
        window.digitals2.main = window.digitals2.main || {};
        window.digitals2.main.scrollToAnkers = typeof(window.digitals2.main.scrollToAnkers) === 'undefined' || window.digitals2.main.scrollToAnkers;
        if (!window.digitals2.main.scrollToAnkers) {
            return;
        }

        // get target element
        var $target;
        try {
            $target = $('#' + target);
        }
        catch(err) {
            return;
        }
        if ($target.length <= 0) {
            return;
        }

        // check if used had scrolled
        $(window).on('mousewheel DOMMouseScroll MozMousePixelScroll', function () {
            userScrolled = true;
        });

        // scroll
        var delay = function(ms) {
            return function(x) {
                return new Promise(function(res) {
                    setTimeout(function() { res(x) }, ms);
                })
            }
        };
        require(['componentInitializer'], function(componentInitializer) {
            componentInitializer.initAll(self.$window)
                .then(delay(3000))
                .then(function() {
                    if (userScrolled) {
                        return;
                    }
                    var targetTopOffset = $target.offset().top;
                    self.animateScrolling(contentBarHeight,targetTopOffset,$target);
                });
        });
    }

    proto.animateScrolling = function (contentBarHeight,targetTopOffset,target){
        $('html, body')
            .animate({
                scrollTop: targetTopOffset
            }, {
                duration: 500,
                step: function(now, fx) {
                    targetTopOffset = target.offset().top;
                    var $nav = $('.ds2-navigation-content-bar--container');
                    if ($nav.length) {
                        contentBarHeight = $nav.height();
                    }
                    fx.end = targetTopOffset - contentBarHeight;
                    return fx;
                }
            });
    }

    return Ds2animation;
});
