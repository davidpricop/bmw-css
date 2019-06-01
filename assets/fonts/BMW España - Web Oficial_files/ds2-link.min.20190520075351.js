/**
 * sub: link
 * author: Manuel
 */

define(
    'ds2-link', [
        'jquery',
        'ds2-video-layer-link',
        'ds2-animation',
        'ds2-lightbox-trigger'
    ],
    function($, videoLayerLink, Animation, ds2LightboxTrigger) {
        'use strict';
        function ds2Link(element) {
            this.element = $(element);
            this.options = {
                linkTruncateClass: 'ds2-ellipsis',
                linkTruncateClassShort: 'ds2-ellipsis-short',
                maxLineNumber: 4,
                maxLineNumberShort: 2
            };
            this.animation = new Animation();
            this.initTrigger();
            new videoLayerLink(element);

            // initialize if it is a lightbox trigger
            if (this.element.attr('data-lightbox-target-id')) {
                this.lightboxTrigger = new ds2LightboxTrigger(element);
            }
        }

        var proto = ds2Link.prototype;

        proto.initTrigger = function() {
            var self = this,
            $element = self.element;

            self.options.$element = $element;

            if (this.options.$element.hasClass(this.options.linkTruncateClass)) {
                self._linkTruncate(this.options.maxLineNumber);
            } else if (this.options.$element.hasClass(this.options.linkTruncateClassShort)) {
                self._linkTruncate(this.options.maxLineNumberShort);
            }

            this.animation.smoothScrollingToAnchorSamePage($element);
        }

        proto._linkTruncate = function(maxLineNumber) {
            var options = this.options,
                link = $(this.options.$element),
                lineHeight = parseInt($(this.options.$element).css('line-height')),
                maxHeight = lineHeight * maxLineNumber;

            $(this.options.$element).parent().dotdotdot({
                height: maxHeight,
                // fallbackToLetter: false,
                wrap: 'letter',
                watch: true,
                tolerance : 12,
            });
        }


        return ds2Link;
    }
);
