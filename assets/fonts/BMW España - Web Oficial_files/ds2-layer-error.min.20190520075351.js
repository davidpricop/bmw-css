define('ds2-tracking-error-layer', ['jquery', 'ds2-tracking-base', 'ds2-tracking'], function ($, ds2TrackingBase, tracking) {
	$.widget('digitals2.ds2TrackingErrorLayer', ds2TrackingBase, {

		triggerTrackingErrorEvent: function () {
			this._callExpandEvent(
				this.eventBuilder.newEvent()
					.from(this.element.data('tracking-event'))
					.eventAction(this.TC.ERROR)
					.primaryCategory(this.TC.ERROR_MESSAGE)
					.build(),
				this.bmwTrackOptionsBuilder.options()
					.name(this.TC.ERROR)
					.build());
		}
	});
		return function($element) {
    		$element.ds2TrackingErrorLayer(tracking.getOptions('ds2-layer-error'));
    	}
});

define('ds2-layer-error', ['jquery', 'ds2-tracking-error-layer'], function($, tracking) {
        function LayerError(element) {
                this.$element = $(element);
                tracking(this.$element);
        }
        return LayerError;
});

