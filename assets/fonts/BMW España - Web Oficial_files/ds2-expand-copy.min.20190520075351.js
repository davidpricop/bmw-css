/**
 * @author Andrei Dumitrescu
 * @description Expand copy component refactored using AMD
 */
define(
    'ds2-expand-copy',
    [
        'jquery',
        'ds2-resize-events'
    ],
    function($, ds2ResizeEvents) {
        'use strict';
        function ds2ExpandCopy(element) {
            this.element = $(element);
            this.options = {
                copyClass: '.ds2-cms-output',
                buttonClass: '.ds2-expand--body-expand-button',
                maxLineNumber: 5,
                maxHeight: 0 //205
            };

            this.create();
        }
        ds2ExpandCopy.prototype.create = function() {

            // old way
            this.expandButton = $(this.options.buttonClass, this.element);

            // if small, set up expanded container on create
            if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                if (this.lineNumbersReached()) {
                    this.expandButtonOn();
                } else {
                    this.expandButton.css({
                        display: 'none'
                    });
                    this.element.attr('data-expanded', true);
                }
            }
            this.registerEventListeners();
        };
        ds2ExpandCopy.prototype.lineNumbersReached = function() {
            //set this to display block so height for element can be calculated
            this.element.closest('form').attr("style", "display: block !important");
            var divHeight = this.element.height(),
                lineHeight = parseInt($(this.options.copyClass, this.element).first().css('line-height'), 10),
                lineNumbers = Math.floor(divHeight / lineHeight),
                $firstheadline = $('.ds2-expand--copy-content .ds2-expand--copy-title', this.element).first(),
                headlineheight = 0,
                extraSpace = 65;
            //remove inline style after height has ben calculated
            this.element.closest('form').attr("style", "");
            if ($firstheadline.length) {
                headlineheight = $firstheadline.height() + parseInt($firstheadline.css('margin-bottom'), 10);
            }

            this.options.maxHeight = lineHeight * this.options.maxLineNumber + extraSpace + headlineheight;
            return (lineNumbers > this.options.maxLineNumber);
        };
        ds2ExpandCopy.prototype.expandButtonOn = function() {
            var self = this;
            self.expandButton.on('click', function(e) {
                self.expandCopyContainer();
            });
        };
        ds2ExpandCopy.prototype.registerEventListeners = function() {
            var self = this;
            // on resize, either set up expanded container ...
            $(window.digitals2.resizeEvents).on('ds2ResizeSmall', function(event) {
                self.expandButtonOff();
                if (self.lineNumbersReached()) {
                    if (!self.element.hasClass('open')) {
                        self.expandButtonOn();
                    }
                } else {
                    self.expandButton.css({
                        display: 'none'
                    });
                    self.element.attr('data-expanded', true);
                }
            });
            // ...  or reset it
            $(window.digitals2.resizeEvents).on('ds2ResizeMedium ds2ResizeLarge', function(event) {
                self.resetCopyContainer(self.element);
                if (self.lineNumbersReached()) {
                    self.expandButtonOff();
                }
            });
        };
        ds2ExpandCopy.prototype.expandCopyContainer = function() {
            var self = this;
            var sectionHeight = self.element[0].scrollHeight;
            self.element.addClass("ds2-expand--body-copy-container--expanded").css({'max-height' : sectionHeight + 'px'});
            self.element.attr('data-expanded', true).trigger('expandCopyContainerEnded');
            self.expandButton.addClass("ds2-expand--body-expand-button--hidden");
            setTimeout(function() {
                $(window).trigger('resize');  //fixing overflow problems if expand copy inside slider
            }, 300);
        };
        ds2ExpandCopy.prototype.expandButtonOff = function() {
            this.expandButton.off('click');
            this.resetCopyContainer();
        };
        ds2ExpandCopy.prototype.resetCopyContainer = function() {
            this.element.css({
                'height': ''
            });
        };
        return ds2ExpandCopy;
    }
);
