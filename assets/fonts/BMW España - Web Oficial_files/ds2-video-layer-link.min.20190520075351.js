/**
 * sub: VideoLayerLink
 * author: Christoph Behounek <cb@eggs.de>
 */

define(
    'ds2-video-layer-link',
    [
        'jquery',
        'ds2-lightbox-trigger',
        'use!log',
        'ds2-main'
    ],
    function($, ds2LightboxTrigger, log) {
        'use strict';

        function ds2LayerLink(element) {
            this.element = $(element);
            this.init();
        }

        var proto = ds2LayerLink.prototype;

        proto.init = function() {
            if (this.element.length &&
                this.element.data('lightbox-target-id') &&
                this.element.data('lightbox-target-id').length) {

                new ds2LightboxTrigger(this.element[0]);

                if (window.digitals2.main.cqIsInEditMode) {

                    log('disable video playing in layer when in author mode');
                    this.element.removeAttr('data-lightbox-id');
                }
            }
        };

        return ds2LayerLink;

    });
