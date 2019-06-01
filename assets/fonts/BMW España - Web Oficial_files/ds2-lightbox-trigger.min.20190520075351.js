/**
 *
 * @description Lightbox Trigger component
 */
define(
    'ds2-lightbox-trigger',
    [
    ],
    function() {
        'use strict';
        function ds2LightboxTrigger(element) {
            var self = this;

            self.element = element;

            this._init();
        }


        ds2LightboxTrigger.prototype._init = function() {
            var self = this;
            self.targetSelector = '[data-lightbox-id=' + self.element.dataset.lightboxTargetId + ']';
            var element = document.querySelector(self.targetSelector);

            self.element.addEventListener('click', function() {
                element.Lightbox && element.Lightbox.openLightbox(self.element);
            })
        };

        return ds2LightboxTrigger;
    }
);
