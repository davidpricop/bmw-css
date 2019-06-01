define('ds2-tracking-tooltip', ['jquery', 'ds2-tracking-base', 'ds2-tracking'], function ($, ds2TrackingBase, tracking) {
	$.widget('digitals2.ds2TrackingTooltip', ds2TrackingBase, {

		_create: function () {
			var ret = this._super();

			var self = this;
			var element = self.element[0];
			$(element).on('click', function (e) {
				var $dataElement = $(element);
				var trackOptions = self._getTrackOptionsData($dataElement);
				var trackingEvent = self._getTrackingEventData($dataElement);
				if (!trackOptions || !trackingEvent) {
					$dataElement = $dataElement.closest('.ds2-tracking-tooltip--event');
					if ($dataElement.length === 0) {
						$dataElement = $(element).find('[data-tracking-event]');
					}
					if ($dataElement.length > 0) {
						e.currentTarget = $dataElement;
						self.options.$element = $dataElement;
						trackOptions = self._getTrackOptionsData($dataElement);
						trackingEvent = self._getTrackingEventData($dataElement);
					}
				}
				if (trackOptions && trackingEvent) {
					trackOptions = self.bmwTrackOptionsBuilder.options().name((trackingEvent.eventInfo.track || trackOptions.name || '')).build();
					if (window && window.location) {
						trackingEvent.eventInfo.target = window.location.href;
					}
					var pEvent = self._populateClickEvent(e, trackOptions.name, trackingEvent.eventInfo.target, trackingEvent.eventInfo.eventName, trackingEvent.eventInfo.cause, trackingEvent.eventInfo.effect);
					pEvent.eventInfo.eventAction = 'Open Tooltip';
					self._parseDataFromEvent(pEvent, trackOptions, e, true);
				}
			});
			return ret;
		},

		_getTrackingEventData: function (element) {
			return $(element).data('tracking-event') || null;
		},

		_getTrackOptionsData: function (element) {
			return $(element).data('tracking-options') || null;
		}
	});
    return function ($element) {
        $element.ds2TrackingTooltip(tracking.getOptions('ds2-tooltip'));
    }
});

/**
 * sub: tooltip
 * author:  martin, patrick
 * refactoring: NC / Thu Jan 19, 2017
 */

define( 'ds2-tooltip', [
    'jquery',
    'ds2-scroll',
    'ds2-tracking-tooltip',
    'jquery-qtip',
    'ds2-resize-events'
], function( $, ScrollBar, tracking ) {

    var ds2Tooltip = function(element) {
        var self = this;
        self.options = {
            topOffset: 16,
            topOffsetMobileTablet: 28,
            bottomOffset: 0,
            bottomOffsetMobileTablet: 8
        };
        self.$element = $(element);
        self._body = $('body');
        //ATTENTION: BMWST-3197: on touch devices we need higher buttons and these need a different offset
        if ($('html').hasClass('touch')) {
            self.options.topOffset = self.options.topOffsetMobileTablet;
            self.options.bottomOffset = self.options.bottomOffsetMobileTablet;
        }
        self.options.dynamicTopOffset = parseInt(self.$element.css('line-height')) || self.options.topOffset;
        self.iscroll;
        self.lastPosition = '';
        self._checkForFullscreen();
        self._setDeviceValues();
        self._initTooltips();
        // on resize
        $(window.digitals2.resizeEvents).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, self._onResize);
        tracking(self.$element);
    };

    var Proto = ds2Tooltip.prototype;

    Proto._setDeviceValues = function() {
        var self = this;
        switch (window.digitals2.resizeEvents.mediaQueryWatcherCheck()) {
            case 'ds2ResizeSmall':
                self.isMobile = true;
                self.isTablet = false;
                self.fullscreenMode = true;
                break;
            case 'ds2ResizeMedium':
                self.isTablet = true;
                self.isMobile = false;
                self.fullscreenMode = false;
                break;
            default:
                self.isMobile = false;
                self.isTablet = false;
                self.fullscreenMode = false;
                break;
        }
    };

    Proto._initTooltips = function() {

        var self = this,
            options = this.options,
            $element = this.$element;

        var dataTooltipId = $element.data('tooltip-id'),
            $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]'),
            $toolTipContainer = $(window),
            tooltipPosition = $element.data('position'),
            tooltipOpenByDefault = $tooltip.data('open-default'),
            tooltipShowReady = false,
            tooltipOpenOnClick = $element.data('open-onclick'),
            tooltipType = $('.ds2-icon', $element).data('tooltip-type'),
            setContainer = $element.data("set-container"),
            showObject,
            hideObject,
            newMy,
            newAt,
            newOffsetY,
            newOffsetX = (tooltipPosition === 'top-center') ? 0 : 10, // define x offsets
            newViewport = (tooltipPosition === 'top-center') ? (setContainer == true ? $toolTipContainer : "") : $toolTipContainer, // don't use container for top-center
            tipOffset,
            isPlcTooltip = dataTooltipId.indexOf('plcPrice') > -1,
            isNeedAnalyzerTooltip = dataTooltipId.indexOf('tooltip-needanalyzer') > -1;

        if(!tooltipType) {
            tooltipType = $element.data('tooltipType');
        }
        self.tooltipId = dataTooltipId;
        if (self._isOnLayer()) {
            tooltipPosition = "layer";
        }
        // define offsets and positions
        switch (tooltipPosition) {
            case 'top-center':
                newMy = 'bottom center';
                newAt = 'top center';
                newOffsetY = options.bottomOffset;
                break;
            case 'layer':
                newMy = 'left center';
                newAt = 'right center';
                newOffsetY = 0;
                tipOffset = 0;
                break;
            default:
                switch (tooltipType) {
                    case 'spotlight':
                        newMy = 'center left';
                        newAt = 'center right';
                        newOffsetY = options.bottomOffset;
                        break;
                    case 'needanalyzer-sharing-medium-down':
                        newMy = 'bottom right';
                        newAt = 'top right';
                        newOffsetY = 14;
                        newOffsetX = -15;
                        tipOffset = 15;
                        break;
                    case 'needanalyzer-sharing-large':
                        newMy = 'left top';
                        newAt = 'right top';
                        newOffsetY = 40;
                        tipOffset = 35;
                        break;
                    default:
                        newMy = 'left top';
                        newAt = 'right top';
                        newOffsetY = options.dynamicTopOffset;
                        break;
                }
                break;
        }

        showObject = {
            solo: true,
            ready: tooltipShowReady // Show the tooltip when ready
        };

        hideObject = {
            event: false
        };

        //online sales package options  ||  need analyzer
        if( isPlcTooltip || isNeedAnalyzerTooltip ) {
            hideObject = {
                event: 'unfocus',
                fixed: true,
                delay: 300
            };
        }

        if (tooltipOpenByDefault) {
            tooltipShowReady = true;
            hideObject = {
                event: 'click'
            };
        }

        if (tooltipOpenOnClick || self.fullscreenMode) { // click event on all tooltips when mobile
            showObject = {
                solo: true,
                event: 'click',
                ready: tooltipShowReady // Show the tooltip when ready
            };
        }

        self.content = $tooltip;

        if (tooltipType !== 'spotlight' && (!self.isTablet || !self.isMobile)) { // don't init when spotlight and <= tablet
            var debounceFlag = false;
            $element.qtip({ // Grab some elements to apply the tooltip to
                overwrite: true,
                content: {
                    // text: $tooltip.wrapAll('<div>').parent().html() //tooltipContent
                    // selection of first element needed for onlinesalse package
                    text:$tooltip[0]
                },
                style: {
                    tip: {
                        corner: true,
                        width: 20,
                        height: 10,
                        offset: tipOffset
                    }
                },
                position: {
                    viewport: newViewport,
                    my: newMy,
                    at: newAt,
                    adjust: {
                        y: newOffsetY,
                        x: newOffsetX
                    }
                },
                show: showObject,
                hide: hideObject,
                events: {
                    show: function(event, api) {
                        $('[data-qtip-id=\'' + api.id + '\']').addClass('qtip-fadeIn');
                        self.$element.addClass('ds2-tooltip--open');
                    },
                    move: function(event, api) {
                        if (!debounceFlag) {
                            debounceFlag = true;
                            var position = api.position.my.x + '_' + api.position.my.y;
                            if (self.lastPosition !== position) { //api.cache.posClass) {
                                self.lastPosition = position; //api.cache.posClass;
                                self._repositionTooltipCorner(position);//api.cache.posClass);
                            }
                        } else {
                            setTimeout(function() {
                                debounceFlag = false;
                            }, 1000);
                        }
                    },
                    hide: function(event, api) {
                        $element.qtip('option', 'show.ready', false);
                        $element.qtip('option', 'hide.fixed', true);
                        $element.qtip('option', 'hide.delay', 300);
                        self._body.removeClass('no-scroll');
                        $('[data-qtip-id=\'' + api.id + '\']').removeClass('qtip-fadeIn');
                        self.$element.removeClass('ds2-tooltip--open');
                    },
                    visible: function(event, api) {
                        self._checkForFullscreen();
                        if (self.fullscreenMode) { // prevents body scrolling (double scrollbars) on full width tooltips
                            self._body.addClass('no-scroll');
                        }
                        self._buildFullSize($tooltip, self.fullscreenMode); // build fullsize tooltip for mobile
                        self.scrollBar.setBarPosition();
                    }
                }
            });
        }
        $('.ds2-tooltip-element--close a, .qtip-close', self.content)
            .unbind()
            .bind('click', $element, self._onCloseClick);

        self.$element[0].addEventListener('ds2-tooltip--close', function () {
            self.$element.qtip('hide');
        }, false);
    };

    /*********************************************************
     *                  EVENT LISTENER                       *
     * *******************************************************/
    Proto._onCloseClick = function(event) {
        var tooltip = event.data,
            pId = $(tooltip).data('tooltip-id'),
            pTooltips = $("[data-tooltip-id='" + pId + "']");
        event.preventDefault();
        pTooltips.qtip('hide');
    };

    Proto._onResize = function(event) {
        var self = event.data,
            $element = self.$element,
            dataTooltipId = $element.data('tooltip-id'),
            tooltipType = $element.data('tooltip-type'),
            $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]'),
            isFinance = dataTooltipId === 'plcPrice-carview-' && !$('.ds2-ols-finance--car-view.ds2-ols-finance--dropdown_expanded').length;

        self._setDeviceValues();
        self._checkForFullscreen();
        if (tooltipType === 'spotlight' || isFinance  && (self.isTablet || self.isMobile)) {
            $element.qtip('hide');
        } else {
            self._buildFullSize($tooltip, self.fullscreenMode);
        }
        if (tooltipType === 'needanalyzer-sharing-large' && (self.isTablet || self.isMobile)) {
            $('.ds2-tooltip[data-tooltip-type="needanalyzer-sharing-large"]').qtip('hide');
        }
        if (tooltipType === 'needanalyzer-sharing-medium-down' && (!self.isTablet && !self.isMobile)) {
            $('.ds2-tooltip[data-tooltip-type="needanalyzer-sharing-medium-down"]').qtip('hide');
        }
        if (self.fullscreenMode && $tooltip.closest('.qtip').hasClass('qtip-focus')) { // prevents body scrolling (double scrollbars) on full width tooltips
            self._body.addClass('no-scroll');
        }
        else if ($tooltip.closest('.qtip').hasClass('qtip-focus')) {
            self._body.removeClass('no-scroll');
            $element.qtip('reposition');
        }
    };

    Proto._buildFullSize = function(tooltip, fullscreenMode) {
        var $tooltip = tooltip,
            $tooltipBody = $('.ds2-tooltip-element--body', $tooltip),
            $topElement = $('.ds2-tooltip-element--close', $tooltip),
            $bottomElement = $('.ds2-tooltip-element--footer', $tooltip),
            offsetTop = $('html').offset().top,
            offsetBottom = 31, // bottom offset when no buttons are shown
            viewportHeight = $(window).outerHeight(), // height of viewport
            topHeight = $topElement.length ? $topElement.outerHeight() : 0, // height of close button
            bottomHeight = $bottomElement.length ? $bottomElement.outerHeight() : offsetBottom, // height of footer/buttons
            resultHeight = viewportHeight - (topHeight + bottomHeight); // get the actual height
        $tooltip.each(function() {
            var closest = $tooltip.closest('.qtip-default');
            if (fullscreenMode) {
                $tooltipBody.css('max-height','95vh');
                closest.addClass('qtip-inFullscreenMode');
            } else {
                // reset height when resize back to desktop
                $tooltipBody.removeAttr('style');
                closest.removeClass('qtip-inFullscreenMode');
            }
        });
    };

    Proto._isOnLayer = function() {
        return this.$element.parents('.ds2-layer--container').length > 0;
    };

    Proto._repositionTooltipCorner = function(position_) {
        var self = this,
            options = self.options,
            $element = self.$element,
            tooltipType = $element.data('tooltip-type');
        setTimeout(function() {
            switch (position_) {
                case 'left_top':
                    $element.qtip('option', 'style.tip.mimic', 'left center');
                    $element.qtip('option', 'style.tip.offset', 40);
                    if (tooltipType !== 'spotlight') $element.qtip('option', 'position.adjust.y', options.topOffset);
                    if (tooltipType !== 'infoIcon') $element.qtip('option', 'position.adjust.y', options.dynamicTopOffset);
                    break;
                case 'left_bottom':
                    $element.qtip('option', 'style.tip.mimic', 'left center');
                    $element.qtip('option', 'style.tip.offset', 40);
                    $element.qtip('option', 'position.adjust.y', options.bottomOffset);
                    break;
                case 'right_top':
                    $element.qtip('option', 'style.tip.mimic', 'right center');
                    if (tooltipType !== 'needanalyzer-sharing') $element.qtip('option', 'style.tip.offset', 40);
                    if (tooltipType !== 'spotlight' && tooltipType != 'needanalyzer-sharing-large') $element.qtip('option', 'position.adjust.y', options.topOffset);
                    if (tooltipType !== 'infoIcon' && tooltipType != 'needanalyzer-sharing-large') $element.qtip('option', 'position.adjust.y', options.dynamicTopOffset);
                    if (tooltipType === 'needanalyzer-sharing-large') {
                        $element.qtip('option', 'style.tip.offset', 35);
                        $element.qtip('option', 'position.adjust.y', 40);
                    }
                    break;
                case 'right_bottom':
                    $element.qtip('option', 'style.tip.mimic', 'bottom center');
                    if (tooltipType === 'needanalyzer-sharing-medium-down') {
                        $element.qtip('option', 'position.adjust.y', 14);
                        $element.qtip('option', 'position.adjust.x', -15);
                        $element.qtip('option', 'style.tip.offset', 15);
                    }
                    // $element.qtip('option', 'style.tip.offset', 15);
                    // $element.qtip('option', 'position.adjust.y', options.bottomOffset);
                    break;
                case 'left_center':
                case 'right_center':
                    $element.qtip('option', 'style.tip.mimic', false);
                    $element.qtip('option', 'style.tip.offset', 0);
                    break;
            }
        }, 1);
    };

    Proto._createScrollBar = function() {
        var self = this,
            dataTooltipId = self.$element.data('tooltip-id'),
            $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"] .ds2-tooltip-element--body');
        self.scrollBar = new ScrollBar($tooltip[0]);
    };

    Proto._checkForFullscreen = function() {
        var self = this,
            $element = self.$element,
            tooltipType = $element.data('tooltip-type'),
            tooltipPosition = $element.data('position'),
            dataTooltipId = $element.data('tooltip-id'),
            $tooltip = $('.ds2-tooltip-element[data-id="' + dataTooltipId + '"]'),
            documentwidth = $(document).width(),
            tooltipwidth = $tooltip.width() + 12 + 40, //tooltip width incl paddings and tip
            elementwidth = $element.width(),
            elementposition = $element.offset(),
            elementpositionfromleft = elementposition.left,
            elementpositionfromright = documentwidth - elementwidth - elementpositionfromleft,
            elementisleft = false,
            elementisright = false;
        tooltipwidth = (tooltipwidth > 410) ? 410 : tooltipwidth;

        if (tooltipPosition === 'top-center') {
            tooltipwidth = $tooltip.width() / 2;
            elementpositionfromleft = elementpositionfromleft + elementwidth / 2;
            elementpositionfromright = documentwidth - elementpositionfromleft;
            (elementpositionfromleft > elementpositionfromright) ? elementisright = true : elementisleft = true;
            tooltipwidth = (tooltipwidth > 205) ? 205 : tooltipwidth;
        }
        if ((tooltipType !== 'spotlight') &&
            (tooltipPosition !== 'top-center') &&
            (elementpositionfromleft <= tooltipwidth) &&
            (elementpositionfromright <= tooltipwidth)) {
            //change tooltip to fullscreen version
            self.fullscreenMode = true;
        }
        else if ((tooltipType !== 'spotlight') &&
            (tooltipPosition === 'top-center') &&
            ((elementisleft && (elementpositionfromleft <= tooltipwidth)) ||
                (elementisright && (elementpositionfromright <= tooltipwidth))
            )) {
            //change tooltip to fullscreen version
            self.fullscreenMode = true;
        }
        else if (!self.isMobile) {
            //change tooltip back to left/right version
            self.fullscreenMode = false;
        }
        if (self.iscroll) {
            self.iscroll = null;
        }
        setTimeout(function() {
            self._createScrollBar();
        }, 50);
    };

    return ds2Tooltip;
});

