// TO DO avoid repetation, namespace the events , put try catches blocks
define('ds2-tracking-gallery', ['jquery', 'ds2-tracking-base', 'ds2-tracking'], function ($, ds2TrackingBase, tracking) {
	$.widget('digitals2.ds2TrackingGallery', ds2TrackingBase, {

		_isCurrentSlideVideo: function (currentSlide, context) {
			if ($('.slick-active', context).find('.ds2-video-player').length) {
				return 'video-' + currentSlide;
			} else {
				return 'image-' + currentSlide;
			}
		},

		_listenersInit: function () {
			var self = this;

			$(window).off('video-start').on('video-start', function (e, trackObj) {
				var trackingOptions = self.bmwTrackOptionsBuilder.options()
					.name(self.TC.START_VIDEO)
					.build();
				self._callExpandEvent(
					trackObj,
					trackingOptions
				);
			});

			$(window).off('video-open').on('video-open', function (e, trackObj) {
				var trackingOptions = self.bmwTrackOptionsBuilder.options()
					.name(self.TC.OPEN_VIDEO)
					.build();
				self._callExpandEvent(
					trackObj,
					trackingOptions
				);
			});
			// $(window).off('open-image').on('open-image', function(e, trackObj) {
			//     var trackingOptions = self.bmwTrackOptionsBuilder.options()
			//         .name(self.TC.OPEN_IMAGE)
			//         .build();
			//     self._callExpandEvent(
			//         trackObj,
			//         trackingOptions
			//     );
			// });
			// $(window).on('start-yt-video', function(e, ytEvent) {
			//   console.log('start YT video');
			// });
			$('.ds2-slider--main', this.element)
				.on('ds2slider-play-video', function (event, trackObj) {
					var trackingOptions = self.bmwTrackOptionsBuilder.options()
						.name(self.TC.START_VIDEO)
						.build();
					self._callExpandEvent(
						trackObj,
						trackingOptions
					);
				})
				.on('download-image', function (event, trackObj) {
					self._callExpandEvent(
						self.eventBuilder.newEvent()
							.eventName(trackObj.eventName)
							.eventAction(trackObj.eventAction)
							.eventPoints(trackObj.eventPoints)
							.primaryCategory(self.TC.ENGAGEMENT)
							.mmdr(trackObj.mmdr)
							.target(trackObj.target)
							.build(),
						self.bmwTrackOptionsBuilder.options()
							.name(self.TC.DOWNLOAD)
							.build());
				});

			$('.ds2-video-player', this.element)
				.on('ds2-video-player-track-absolute-progress', function (event, eventObj) {
					eventObj.eventAction = 'Progress';
					self._trackVideoEvent(this, eventObj);
				})
				.on('ds2-video-player-track-relative-progress', function (event, eventObj) {
					eventObj.eventAction = 'Milestone';
					self._trackVideoEvent(this, eventObj);
				});
		},

		_trackVideoEvent: function (scope, eventObj) {
			var self = this,
				$element = $(scope),
				pMappedEvent,
				pMappedObj = {},
				eventName;

			eventName = $element.data('tracking-options').name;

			if ($element.data('tracking-options') && $element.data('tracking-options').name) {
				// special pMappedEvent for milestone and progress events
				if (eventObj.eventAction === 'Progress') {
					pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_seconds');
				} else if (eventObj.eventAction === 'Milestone') {
					pMappedEvent = self._loopProp(self.options.mappingObj, 'record_video_progress_percent');
				} else {
					pMappedEvent = self._loopProp(self.options.mappingObj, eventName);
				}

				pMappedObj = self._mapFilter(pMappedEvent, $element.data('tracking-options').content);
				eventPoints = $element.closest('.ds2-slider').find('.ds2-slider--gallery').data('slide-index') + 1;
			}

			self._callExpandEvent(
				self.eventBuilder.newEvent()
					.eventName(eventName)
					.eventAction(eventObj.eventAction)
					.eventPoints('image-' + eventPoints)
					.target(eventObj.target)
					.effect(eventObj.milestone)
					.primaryCategoryIsEngagement()
					.videoLength(eventObj.duration)
					.build(),
				pMappedObj
			);
		}
	});

	return function($element){
	    $element.ds2TrackingGallery(tracking.getOptions('ds2-gallery'));
    }
});

define('ds2-slider', [
    'jquery',
    'jquery-slick',
    'use!log',
    'lazyload',
	'ds2-slider-dots',
    'ds2-tracking-gallery',
	'lodash',
    'ds2-text-direction',
    'ds2-resize-events'
], function ($, slick, log, LazyLoad, DS2SliderDots, trackingGallery, _, Dir) {

    var ds2Slider = function (element) {
        this.options = {
            currentSlide: 0,
            myLazyLoad: new LazyLoad({container: element})
        };
        this.element = $(element);
        this._create();

        var $lightboxTrigger = $(element).find('a[data-component-path="ds2-lightbox-trigger"]').first();

        if ($lightboxTrigger.length) {
            var lightboxId = $lightboxTrigger.data('lightbox-target-id'),
                lightbox = document.querySelector('[data-lightbox-id="' + lightboxId + '"]'),
                lightboxMiddle = lightbox.querySelector('.ds2-lightbox__middle');
            lightboxMiddle.classList.add("ds2-lightbox__middle--hide");
            lightbox.addEventListener('ds2-lightbox-open', function (ev) {
                var $slider = $(this).find('.ds2-slider--main'),
                    slideTo = ev.trigger && $(ev.trigger).closest('[data-slick-index]').attr('data-slick-index') || 0;
                $slider.find('.ds2-slider--main').slick('refresh');
                slideTo && $slider.slick('slickGoTo', slideTo);
                setTimeout(function () {
                    lightboxMiddle.classList.remove("ds2-lightbox__middle--hide");
                }, 500);
            });
        }

        // init tracking
        if(this.element.parent().hasClass('ds2-gallery')){
            trackingGallery(this.element);
        }
    };

    var proto = ds2Slider.prototype;

    proto._create = function () {
        var self = this;
        self.options.$element = self.element;
        this.options.slider = $('.ds2-slider--main', this.element);
        this.options.sliderBottom = $('.ds2-slider--bottom', this.element);
        this.options.fullscreenModeInPlayerIsActive = false;
        this.options.prevArrow = $('.slick-prev', this.options.slider);
        this.options.nextArrow = $('.slick-next', this.options.slider);
        this.options.noSliding = self.element.hasClass('ds2-slider--no-sliding');
		this.options.showDots = true; //this.options.slider.hasClass('ds2-slider-navVisible');

        if (this.options.prevArrow[0] && this.options.nextArrow[0]) {
            this.options.prevArrowHtml = this.options.prevArrow[0].outerHTML;
            this.options.nextArrowHtml = this.options.nextArrow[0].outerHTML;
        }
        this.options.prevArrow.remove();
        this.options.nextArrow.remove();

        // to check if the click has been triggered clicking on an image
        this.options.isImage = false;
        // to disable sending tracking events on page load
        this.options.sliderTrackingActive = false;

        this.options.sliderMaxWidth = 1200;
        this.options.gridMaxWidth = parseFloat($('.ds2-row-padding', '.ds2-lightbox').css('max-width'));
        this.options.rowPadding = $('.ds2-layer .ds2-row-padding');
        this.options.rowPaddingLightbox = $('.ds2-lightbox .ds2-row-padding');
        this.options.videoPlayerContainer = $('.ds2-video-player--player');

        this.options.sliderSize = this.options.slider.find('.ds2-slider--slide').size() - this.options.slider.find('.slick-cloned').size();

        this.options.slickLightboxInit = false;
        this.options.sliderOversizeInit = false;
        this.options.centerPadding = '37px';//parseFloat($('.ds2-slider--space-helper').css('padding-left')) + 'px';
        this.options.adaptiveHeight = false;
        this.options.slidesToShowMedium = 1;

        this.options.AUTOMATIC = 'automatic';
        this.options.ICON = 'icon';
        this.options.SWIPE = 'swipe';
        this.options.IMAGE = 'image';

        this.options.swipeStarted = false;
        this.options.lastEventName = null;

        if ($('.ds2-video-player', this.options.$element).length) {
            $('.ds2-video-player', this.options.$element)
                .on('ds2-video-player-play', function (event, trackObj) {
                    if (digitals2.tracking) {
                        var slider = $(event.target).closest('.ds2-slider');
                        var eventName = 'Start video';
                        var activeElements = $('.slick-current, .slick-active', slider);
                        if (activeElements.length > 1) {
                            eventName = $(activeElements[1]).text().trim();
                        }
                        var imgObj = $(event.target).parent().prev().find('img');
                        var target = $(imgObj).attr('src');
                        trackObj = digitals2.tracking.eventBuilder.newEvent()
                            .eventName(eventName)
                            .eventAction('Start video')
                            .build();
                        trackObj.eventInfo.target = target;

                        $('.ds2-slider--main', self.options.$element).trigger('ds2slider-play-video', trackObj);
                    }
                });
            this._addSwipeEvents();
        }

        $(this.options.$element).off('videoOverlayClose').on('videoOverlayClose', function (e) {
            self._videoOverlayClose();
        });

        $(this.options.$element).off('fullscreenModeInPlayerIsActive').on('fullscreenModeInPlayerIsActive', function (e, pValue, pId) {

            self.options.fullscreenModeInPlayerIsActive = pValue;
            var pActive = $('.ds2-slider--video-player-opener', self.options.$element).parent().not('.slick-cloned').find('[data-id="' + pId + '"]').parent();

            if (pValue === false) {
                self.options.$element.css({
                    'position': 'relative'
                });
                self._videoOverlayUpdate();
            }
            else {
                self.options.$element.css({
                    'position': 'static'
                });
                var pTop = pActive.offset().top;

                $('.ds2-slider--video-container', self.options.$element).css({
                    'top': pTop,
                    'position': 'absolute'
                });

                $(window).on('scroll', function () {
                    if (self.options.fullscreenModeInPlayerIsActive === true) {
                        $('.ds2-slider--video-container', self.options.$element).css({
                            'top': $(window).scrollTop(),
                            'position': 'absolute'
                        });
                    }
                });

            }
        });

        this.options.onAfterChangeTrigger = null;

        if (this.options.slider.hasClass('ds2-autoplay') && !this.options.slider.hasClass('ds2-slider-lightbox')) {
            this.options.sliderAutoPlay = true;
        } else {
            this.options.sliderAutoPlay = false;
        }

        this.options.interactionInAuthorDisabled = this.options.slider.hasClass('ds2-slider--swipe-disabled');

        if (this.options.noSliding) {
            new LazyLoad({container: this.element[0]})
        }
        else {
            if (this.options.slider.hasClass('ds2-slider--gallery')) {
                this.options.view = 1; // gallery videos
                this.options.sliderMaxWidth = 1680;
                this.options.slidesToShow = 1;
                this.options.centerPadding = '23%';
                this.options.centerPaddingMedium = '42.5px';
                this.options.centerPaddingSmall = '17.5px';
                this.options.centerMode = true;
                this.options.centerModeMedium = true;
                this.options.centerModeSmall = true;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

                // modifier for model overview
                if (this.options.slider.hasClass('ds2-slider--gallery-model-overview')) {
                    this.options.modelOverview = true;
                }

            } else if (this.options.slider.hasClass('ds2-slider--gallery-twoColumns')) {
                this.options.view = 2; // gallery images
                //$sliderMaxWidth = 1680;
                this.options.slidesToShow = 2;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = '42.5px';
                this.options.centerPaddingSmall = '17.5px';
                this.options.centerMode = true;
                this.options.centerModeMedium = true;
                this.options.centerModeSmall = true;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--twoColumns')) {
                this.options.view = 4; // fallback detail
                this.options.slidesToShow = 2;
                this.options.slidesToShowMedium = 2;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                if (this.options.slider.closest('.ds2-technical-data-js--slider').length) {
                    this.options.slidesToShowMedium = 1;
                }
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--stage')) {
                this.options.view = 5; // stage teaser
                this.options.sliderMaxWidth = 1680;
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
            } else if (this.options.slider.hasClass('ds2-slider--teaser')) {
                this.options.view = 6; // teaser (large-6)
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--fourColumns')) {
                this.options.view = 4; // fallback detail
                this.options.slidesToShow = 4;
                if (this.options.slider.hasClass('ds2-slider--fourColumns-large-medium')) {
                    this.options.slidesToShowMedium = 4;
                } else {
                    this.options.slidesToShowMedium = 2;
                }
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);

            } else if (this.options.slider.hasClass('ds2-slider--sevenColumns')) {
                this.options.view = 4; // fallback detail
                this.options.slidesToShow = 7;
                this.options.slidesToShowMedium = 3;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = true;
                this.options.centerModeSmall = true;
                this.options.arrowsMedium = true;
                self.showNavButtons(this.options.slider);
            } else {
                //class: ds2-slider--fullSize, ds2-slider--layer
                this.options.view = 3; // standard view
                this.options.slidesToShow = 1;
                this.options.centerPadding = 0;
                this.options.centerPaddingMedium = 0;
                this.options.centerPaddingSmall = 0;
                this.options.centerMode = false;
                this.options.centerModeMedium = false;
                this.options.centerModeSmall = false;
                this.options.arrowsMedium = true;
                if (this.options.slider.hasClass('ds2-slider--layer')) {
                    //this.options.adaptiveHeight = true;
                }
                self.showNavButtons(this.options.slider);
            }

            if (this.options.prevArrowHtml && this.options.nextArrowHtml) {
                self.initSlider(self, this.options.slider, true, this.options.sliderBottom);
                self.sliderUpdate(this.options.slider);
                self.initSliderBottom(self, this.options.sliderBottom, false, this.options.slider);
                self.sliderUpdate(this.options.sliderBottom);

                this.options.slider.slick('slickGoTo', 0, true);//CHANGED: from 1 to 0

                self.setOversizeOuterSpace();
                self.initLightbox();

                $(window.digitals2.resizeEvents).on('ds2ResizeLarge ds2ResizeMedium ds2ResizeSmall', function (event) {

                    if (self.options.slider.hasClass('ds2-slider-lightbox')) {
                        var $sliderLayerWidth = Math.round(self.options.gridMaxWidth * 0.66);
                        var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);
                        // make sure $sliderLayerWidth isn't bigger as viewportWidth
                        $sliderLayerWidth = $sliderLayerWidth > viewportWidth ? viewportWidth : $sliderLayerWidth;
                        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                            self.options.rowPadding.css('width', 'auto');
                            self.options.rowPaddingLightbox.css('width', 'auto');
                            if (self.videoPlayerContainer) {
                                self.videoPlayerContainer.css('height', '100vw');
                            } else {
                                $('.ds2-video-player--player').css('height', '100vw');
                            }
                        } else {
                            self.options.rowPadding.css('width', $sliderLayerWidth);
                            self.options.rowPaddingLightbox.css('width', $sliderLayerWidth);
                        }

                        self.element.closest('.ds2-lightbox').addClass('ds2-lightbox--slider');
                        self.sliderUpdate(self.options.slider);
                        self.sliderUpdate(self.options.sliderBottom);

                    } else {
                        self.sliderUpdate(self.options.slider);
                        self.sliderUpdate(self.options.sliderBottom);

                        if (self.options.slider.hasClass('ds2-slider--gallery-twoColumns')) {
                            self.setOversizeOuterSpace();

                        } else if (self.options.slider.hasClass('ds2-slider--gallery')) {
                            if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeLarge') {
                                $('.slick-prev, .slick-next', self.options.slider).css('width', '23%');
                            }
                            else {
                                $('.slick-prev, .slick-next', self.options.slider).css('width', 'auto');
                            }
                        }
                    }

                    if (event.type === 'ds2ResizeLarge') {
                        self.initLightbox();
                    } else {
                        self.destroyLightbox();
                    }

                    if (event.type === 'ds2ResizeSmall') {
                        self.options.mq = 'small';
                    } else if (event.type === 'ds2ResizeMedium') {
                        self.options.mq = 'medium';
                    } else if (event.type === 'ds2ResizeLarge') {
                        self.options.mq = 'large';
                    }

                    self.playVideo();
                    self.sliderClickableHalf();
                    self.attachClickEvents();
                    self.checkEventsToDisableAutoplay();
                    self.setTriggerTrack();
                    self.navButtonsUpdate();

                });

                $(window).trigger('resize');
            } else {
                $(this.element).hide();
            }

            this.options.slider.on('dragstart', function (event) {
                event.preventDefault();
            });

            $(window).scroll(function () {
                self.navButtonsUpdate();
            });
        }

        self._videoOpenerInit();

    };

    proto._addSwipeEvents = function () {
        var self = this,
            touchobj,
            dist,
            startX;

        log('_addSwipeEvents');

        // swipe over video container on mobile (is position absolute so slider is not working anymore)
        self.options.$element.find('.ds2-slider--video-container').on('touchstart', function (event) {
            touchobj = event.originalEvent.changedTouches[0];
            dist = 0;
            startX = touchobj.pageX;
        });

        self.options.$element.find('.ds2-slider--video-container').on('touchend', function (event) {
            touchobj = event.originalEvent.changedTouches[0];
            dist = touchobj.pageX - startX;

            if (dist > 20) {
                log('show prev');
                self.options.slider.slick('slickPrev');
            } else if (dist < -20) {
                log('show next');
                self.options.slider.slick('slickNext');
            }
        });
    };

    proto.initSlider = function (self, $slider, $arrowsLarge, $sliderSibling) {
        this.options.slider.on('init reInit', function () {
            // fix lazyload images in slick clones
            self.options.myLazyLoad.update();
            self.options.sliderTrackingActive = true;
        });
        if (this.options.showDots) {
			this.options.slider.on('init', function () {
				setTimeout(function () {
					self.dots = new DS2SliderDots(self.options.slider);
					self.fixSliderHeight();
				}, 0);
			});
        }

        this.options.slider.slick({
			dots: this.options.showDots,
            appendDots: this.options.showDots && $(".ds2-slider--pagination-dots", this.element),
            centerPadding: this.options.centerPadding,
            centerMode: this.options.centerMode,
            focusOnSelect: false,
            arrows: $arrowsLarge,
            prevArrow: this.options.prevArrowHtml,
            nextArrow: this.options.nextArrowHtml,
            infinite: true,
            lazyLoad: 'anticipated',
            slidesToShow: this.options.slidesToShow,
            slidesToScroll: 1,
            asNavFor: $sliderSibling,
            autoplay: this.options.sliderAutoPlay,
            speed: 500,
            autoplaySpeed: 5000,
            pauseOnHover: false,
            adaptiveHeight: this.options.adaptiveHeight,
            swipe: !this.options.interactionInAuthorDisabled,
            draggable: !this.options.interactionInAuthorDisabled,
            zIndex: 120,
            rtl: !Dir.isLTR
        });

        this.options.slider.on('swipe afterChange beforeChange', function () {
            $(window).trigger('scroll');
            setTimeout(function () {
                $(window).trigger('scroll');
            }, 800);
        });

        this.options.slider.on('setPosition', function (event, slick, currentSlide, nextSlide) {
            self._videoOverlayUpdate();
            self.navButtonsUpdate();
        });

        this.options.slider.on('beforeChange', function (event, slick, currentSlide, nextSlide) {
            if ($slider.hasClass('ds2-slider--main') && !$slider.hasClass('ds2-slider--sound')) {
                self.stopAllVideos();
            }
			self.dots && self.dots.activeDots(currentSlide, nextSlide);
        });

        this.options.slider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
            if ($slider.hasClass('ds2-slider--main')) {
                self._videoOpenerInit();

                $slider.data('slide-index', currentSlide);

                if ($slider.hasClass('fireSlideChange')) {
                    $slider.parent().parent().trigger("ds2-slide-change", currentSlide);
                }

                if(self.options.lastEventName){
                    self.trackSlider('Impression', 'impression', self.options.lastEventName);
                    self.options.lastEventName = null;
                }else {
                    self.trackSlider('Impression', 'impression');
                }
            }
        });

        this.options.slider.on("onSwipeMove", function (event, slick, offset) {
            var ratio = 1;
            var bottomSlick = self.options.sliderBottom && self.options.sliderBottom.slick("getSlick");

            if (bottomSlick && bottomSlick.changePosition) {
                ratio = bottomSlick.slideWidth / slick.slideWidth;
                bottomSlick.changePosition(offset * ratio);

                self.trackSlider('Impression', 'impression');
            }
        });

        self.navButtonsUpdate();

        setTimeout(function () {
            $('button', self.options.slider).on('click touch swipe', function (event) {
                self.options.lastEventName ="icon";
               // self.trackSlider('Impression', 'impression',"icon");
            });
        }, 1000);
    };

	proto.fixSliderHeight = _.debounce(function () {
	    if (this.options && this.options.$element && typeof this.options.$element.find == "function") {
			var $fixedHeightElm = this.options.$element.find(".js_keep-height");
			if ($fixedHeightElm.length) {
				$fixedHeightElm.css({"height": ""});
				$fixedHeightElm.height($fixedHeightElm.height());
			}
        }
    }, 100);

    proto.trackSlider = function (eventAction, eventTrack,cause) {
        var self = this;
        if (self.options.sliderTrackingActive) {
            if (!$('.ds2-slider--main', self.options.$element).hasClass('ds2-slider--sound')) {
                var trackObj = self._createTrackingObj();

                if (trackObj) {
                    trackObj.numSlides = self.options.sliderSize;
                    if (eventAction) {
                        trackObj.eventAction = eventAction;
                    }
                    if (eventTrack) {
                        trackObj.eventTrack = eventTrack;
                    }
                    if(cause){
                        trackObj.cause = cause;
                        self.options.lastEventName = trackObj.eventName;
                    }
                     $('.ds2-slider--main', self.options.$element).trigger('sliderChanged', trackObj);


                }
            }
        }
    };

    proto.initSliderBottom = function (self, $slider, $arrowsLarge, $sliderSibling) {

        this.options.sliderBottom.on('init', function () {

            // trigger js in cloned slides for sliders with more than one slide in view
            if ((self.options.view === 2 || self.options.view === 4) && $('.slick-cloned [data-loader="amdLoader"]', $slider).length) {
                require(['componentInitializer'], function (componentInitializer) {
                    componentInitializer.initAll($('.slick-cloned', $slider));
                });
            }
        });

        this.options.sliderBottom = $slider.slick({
            centerPadding: this.options.centerPadding,
            centerMode: this.options.centerMode,
            focusOnSelect: false,
            arrows: $arrowsLarge,
            prevArrow: this.options.prevArrowHtml,
            nextArrow: this.options.nextArrowHtml,
            infinite: true,
            slidesToShow: this.options.slidesToShow,
            slidesToScroll: 1,
            asNavFor: $sliderSibling,
            autoplay: this.options.sliderAutoPlay,
            autoplaySpeed: 5000,
            pauseOnHover: false,
            adaptiveHeight: this.options.adaptiveHeight,
            swipe: !this.options.interactionInAuthorDisabled,
            draggable: !this.options.interactionInAuthorDisabled,
            zIndex: 100,
            rtl: !Dir.isLTR
        });
    };

    proto._createTrackingObj = function () {
        try {
            var trackObj = {};
            var sliderSlide = $('.ds2-slider--slide.slick-active', this.element);
            var pImage = $(sliderSlide).first().find('img');

            trackObj.currentSlide = this.options.currentSlide;

            if (pImage.data('tracking-event') &&
                pImage.data('tracking-event').eventInfo &&
                pImage.data('tracking-event').eventInfo.eventName
            ) {
                trackObj.eventName = pImage.data('tracking-event').eventInfo.eventName;
            } else {
                var isVideo = $(pImage).children()[0];
                isVideo = $(isVideo).hasClass('ds2-slider--video-player-opener');
                var currentTextObj;
                if (isVideo) {
                    currentTextObj = $('div[data-slick-index="' + trackObj.currentSlide + '"]:has(h4)');
                    if (currentTextObj.length > 0) {
                        currentTextObj = $(currentTextObj)[1];
                    } else {
                        currentTextObj = $(currentTextObj)[0];
                    }
                } else {
                    currentTextObj = $('div[data-slick-index="' + trackObj.currentSlide + '"]:has(h4)')[0];
                }

                currentTextObj = $(currentTextObj).find('h4');
                trackObj.eventName = $(currentTextObj).text().trim()
            }

            var trackingHeadline = $(sliderSlide).data('tracking-headline');
            if(trackingHeadline && trackingHeadline.length > 0){
                trackObj.target = trackingHeadline;

            }else {
                trackObj.target = pImage.attr('src');
            }
            trackObj.timeStamp = Date.now();

            if (this.options.sliderAutoPlay === true) {
                trackObj.cause = this.options.AUTOMATIC;
            } else {
                var deviceIndex = window.digitals2.responsivePlus.responsivePlusDeviceGet();

                if (this.options.isImage === true) {
                    trackObj.cause = this.options.IMAGE;
                    trackObj.element = 'Image';
                } else if (deviceIndex === 0) {
                    trackObj.cause = this.options.ICON;
                    trackObj.element = 'Button';
                } else {
                    trackObj.cause = this.options.SWIPE;
                    trackObj.element = 'Other';
                }
            }
            return trackObj;

        } catch (error) {
            log(error);
        }
    };

    proto.sliderUpdate = function ($slider) {
        this.options.fullscreenModeInPlayerIsActive = false;
        var $centerMode;
        var $centerPadding;
        var $slidesToShow;
        var $arrows;

        if (!$slider.hasClass('ds2-slider-lightbox') && !this.options.fullscreenModeInPlayerIsActive) {
            if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                $centerMode = this.options.centerModeSmall;
                $centerPadding = this.options.centerPaddingSmall;
                $slidesToShow = 1;
                $arrows = !$slider.hasClass('ds2-slider--bottom') ? this.options.arrowsMedium : false;

            } else if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                $centerMode = this.options.centerModeMedium;
                $centerPadding = this.options.centerPaddingMedium;
                $slidesToShow = this.options.slidesToShowMedium ? this.options.slidesToShowMedium : 1;
                $arrows = !$slider.hasClass('ds2-slider--bottom') ? this.options.arrowsMedium : false;

                if (this.options.$element.find('.ds2-slider--main.ds2-slider--twoColumns').length > 0) {
                    $slidesToShow = 2;
                }

            } else if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeLarge') {
                $centerMode = this.options.centerMode;//true;
                $centerPadding = this.options.centerPadding;//'125px';
                $slidesToShow = this.options.slidesToShow;//2;
                $arrows = true;
            }

            var redraw = false;

            if ($slider.slick('slickGetOption', 'centerMode') !== $centerMode) {
                $slider.slick('slickSetOption', 'centerMode', $centerMode, false);
                redraw = true;
            }
            if ($slider.slick('slickGetOption', 'centerPadding') !== $centerPadding) {
                $slider.slick('slickSetOption', 'centerPadding', $centerPadding, false);
                redraw = true;
            }
            if ($slider.slick('slickGetOption', 'slidesToShow') !== $slidesToShow) {
                $slider.slick('slickSetOption', 'slidesToShow', $slidesToShow, false);
                redraw = true;
            }
            if ($slider.slick('slickGetOption', 'arrows') !== $arrows) {
                $slider.slick('slickSetOption', 'arrows', $arrows, false);
                redraw = true;
            }

            if (redraw === true) {
                $slider.slick('slickSetOption', 'arrows', $arrows, true);
            }

        }
    };

    proto.attachClickEvents = function () {
        var self = this;

        var $slide = $('.ds2-slider--slide', this.options.slider);
        $slide.off('touchstart mousedown touchmove mousemove touchend mouseup');

        $slide.on('touchstart mousedown', function (e) {
            self.options.swipeStarted = false;
        });

        $slide.on('touchmove mousemove', function (e) {
            self.options.swipeStarted = true;
            e.preventDefault();
        });

        $slide.on('touchend mouseup', function (e) {
            if (!self.options.swipeStarted) {
                var $activeSlides = self.options.slider.find('.slick-active');
                if (self.options.slider.hasClass('ds2-slider-clickable') && $activeSlides.length === 1) {
                    var currentSlide = self.options.slider.slick('slickCurrentSlide');
                    self.options.$element.trigger('ds2-slider-slide-clicked', currentSlide);
                    e.preventDefault();
                }
            }

        });
    };

    proto.sliderClickableHalf = function () {
        var self = this;

        if (this.options.view !== 1 && this.options.view !== 2 && !this.options.interactionInAuthorDisabled) {
            $('.ds2-slider--slide', self.options.slider).off('click');
            $('.ds2-slider--slide', self.options.slider).on('click', function (e) {
                var $activeSlides = self.options.slider.find('.slick-active');
                if ((!self.options.slider.hasClass('ds2-slider-clickable') || $activeSlides.length > 1) && !$(e.target).parents('.ds2-buttonlist').length) {
                    if ($(e.target).is('.ds2-video-player--play') || $(e.target).is('.ds2-sound-player--play') || $(e.target).is('.ds2-icon--play-white') || $(e.target).is('.ds2-info-icon')) {
                        return;
                    }
                    if (self.options.view === 4) {
                        var $activeSiblings = $(this).closest('.slick-slider').find('.slick-active'),
                            slideDirection = $activeSiblings.index(this);

                        if (self.options.slider.hasClass('ds2-slider-navVisible')) {
                            if (self.options.sliderSize <= self.options.slider.slick('slickGetOption', 'slidesToShow')) {
                                self.options.$element.trigger('ds2-slider-slide-clicked', slideDirection);
                            } else {
                                var slideToGoTo = self.options.slider.slick('slickCurrentSlide') + slideDirection;
                                self.options.slider.slick('slickGoTo', slideToGoTo);
                            }
                        } else {
                            if (slideDirection === 0) {
                                self.options.slider.slick('slickPrev');
                            } else {
                                self.options.slider.slick('slickNext');
                            }
                        }

                    } else {
                        var x = e.pageX - $('img', this).offset().left;

                        var width = $('img', this).width(),
                            where = width / 2;
                        if (x > where) {
                            self.options.slider.slick('slickNext');
                        } else {
                            self.options.slider.slick('slickPrev');
                        }
                    }
                }
            });
        }
    };

    proto.setOversizeOuterSpace = function () {
        var $centerPadding;

        if (this.options.view === 2 && $(window).width() > this.options.gridMaxWidth) {

            if ($(window).width() < 1680) {
                $centerPadding = ($(window).width() - 1200) / 2 + 'px';
            } else {
                $centerPadding = 240 + 'px'; // max-width
            }

            this.options.slider.slick('slickSetOption', 'centerPadding', $centerPadding, true);
            $('.slick-prev, .slick-next', this.options.slider).css('width', $centerPadding);
            this.options.sliderOversizeInit = true;

        } else if (this.options.view === 2) {

            var redrawValue;
            if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeSmall') {
                redrawValue = this.options.centerPaddingSmall;
            } else if (window.digitals2.resizeEvents.mediaQueryWatcherCheck() === 'ds2ResizeMedium') {
                redrawValue = this.options.centerPaddingMedium;
            } else {
                redrawValue = '37px';
            }
            if (redrawValue && redrawValue !== this.options.slider.slick('slickGetOption', 'centerPadding')) {
                this.options.slider.slick('slickSetOption', 'centerPadding', redrawValue, true);
            }
        }
    };

    proto._videoOpenerInit = function () {
        var self = this;
        var pId;
        var pPlayButton;
        var singleVideos;

        if (self.options.noSliding) {
            pId = $('.ds2-slider--slide .ds2-slider--video-player-opener', this.options.$element).data('id');
            pPlayButton = $('.ds2-slider--slide .ds2-slider--video-player-opener', this.options.$element).find('.ds2-video-player--play');

            // fix for BMWST-6851
            singleVideos = $('.ds2-slider--video-single', this.options.$element);
            if (singleVideos.length > 0) {
                singleVideos.toggleClass('hide', true);
            }
        }
        else {
            pId = $('.slick-active.slick-center .ds2-slider--video-player-opener', this.options.$element).data('id');
            pPlayButton = $('.slick-active .ds2-slider--video-player-opener', this.options.$element).find('.ds2-video-player--play');
        }

        self.options.$element.on('stopAllVideos allVideosStopped', function () {
            pPlayButton.removeClass('hidden');
        });

        $(pPlayButton, this.options.$element).off('click').on('click touchend', function (event) {
            if (digitals2.tracking.eventBuilder) {
                var slider = $(event.target).closest('.ds2-slider');
                var eventName = 'Open video',
                    target = '',
                    element = '';

                pPlayButton.toggleClass('hidden');

                var activeElements = $('.slick-current, .slick-active', slider);
                if (activeElements.length > 1) {
                    eventName = $(activeElements[1]).text().trim();
                }

                var dataEvent;
                if (self.options.noSliding) {
                    dataEvent = singleVideos.find('.ds2-tracking-js--event').first().data('tracking-event');
                } else {
                    dataEvent = $('#' + pId).find('.ds2-tracking-js--event').first().data('tracking-event');
                }
                if (dataEvent) {
                    target = dataEvent.eventInfo.target ? dataEvent.eventInfo.target : '';
                    element = dataEvent.eventInfo.element ? dataEvent.eventInfo.element : '';
                }

                var trackObj = digitals2.tracking.eventBuilder.newEvent()
                    .eventName(eventName)
                    .eventAction('Open video')
                    .target(target)
                    .element(element)
                    .build();
                $(window).trigger('video-open', trackObj);
            }
            self._videoOverlayOpen(pId);
        });

        $(window).resize(function (event) {
            self._videoOverlayUpdate();
			self.fixSliderHeight();
        });
    };

    proto._videoOverlayOpen = function (pId) {
        var self = this,
            videoContainer = $('.ds2-slider--video-container', this.options.$element),
            pVideoPlayer = $('#' + pId, videoContainer),
            playerArray = window.ds2.cl.ds2Videoplayer,
            target = '';

        //console.log(pId, playerArray);
        if (pVideoPlayer.length) {
            self.options.activeLayerVideoId = pId;

            self._videoOverlayUpdate();
            self.autoPlayDisable();

            videoContainer.removeClass('hide');
            pVideoPlayer.removeClass('hide');

            // invoke video from initialized player array
            for (var i = 0; i < playerArray.length; ++i) {
                if (playerArray[i].options.parentID === pId) {
                    playerArray[i].invokeFromLayer();
                }
            }
            if (digitals2.tracking.eventBuilder) {
                var dataEvent = pVideoPlayer.find('.ds2-tracking-js--event').first().data('tracking-event');
                if (dataEvent) {
                    target = dataEvent.eventInfo.target ? dataEvent.eventInfo.target : '';
                }
                $(window).trigger('video-start',
                    digitals2.tracking.eventBuilder.newEvent()
                        .eventName('Start video')
                        .eventAction('Start video')
                        .target(target)
                        .build());
            }
        }
    };

    proto._clearVideoLayer = function (pId) {
        var $layer = $('#' + pId);
        $layer.find('.s7videotime').remove();
        $layer.find('.s7iconeffect').remove();
        $layer.find('.s7videoplayer').empty();
        $layer.find('.s7controlbar').empty();
    };

    proto._videoOverlayClose = function () {
        var videoContainer = $('.ds2-slider--video-container', this.options.$element),
            pVideoPlayer = $('.ds2-slider--video-single', this.options.$element);

        if (pVideoPlayer) {
            videoContainer.addClass('hide');
            pVideoPlayer.addClass('hide');
        }

        this.options.activeLayerVideoId = null;
        this.options.$element.trigger('allVideosStopped');
    };

    proto._videoLayerCalculatePosition = function () {
    };

    proto._videoOverlayUpdate = function () {
        var pActive = $('.ds2-slider--video-player-opener', this.options.$element).parent().not('.slick-cloned').find('[data-id="' + this.options.activeLayerVideoId + '"]').parent();

        if (pActive.length <= 0) {
            //log('no active video layer');
            return;
        }

        var pW = pActive.find('.ds2-video-player--img-outer').innerWidth();

        if (this.options.fullscreenModeInPlayerIsActive === false) {
            $('.ds2-slider--video-container', this.options.$element).css({
                'top': 0,
                'left': '50%',
                'margin-left': -pW / 2,
                'width': pW,
                'position': 'absolute'
            });

        }
    };

    proto.playVideo = function () {
    };

    proto.stopAllVideos = function () {
        var self = this;
        self.options.$element.trigger('stopAllVideos');
        if (!self.options.slider.hasClass('ds2-slider--sound')) {
            self._videoOverlayClose();
        }
    };

    proto.checkEventsToDisableAutoplay = function () {
        var self = this;

        $('.slick-prev, .slick-next', this.options.slider).on('click', function () {
            self.autoPlayDisable();
        });
        this.options.$element.on('autoPlayDisable', function () {
            self.autoPlayDisable();
        });
    };

    proto.autoPlayDisable = function () {
        var self = this;
        if (!self.options.noSliding) {
            if (this.options.slider.slick('slickGetOption', 'autoplay') === true) {
                this.options.slider.slick('slickPause');
                this.options.slider.slick('slickSetOption', 'autoplay', false, false);
                this.options.sliderBottom.slick('slickPause');
                this.options.sliderBottom.slick('slickSetOption', 'autoplay', false, false);
            }
        }
    };

    proto.showNavButtons = function () {
        var self = this;
        this.options.slider.hover(function () {
            if (self.options.slider.hasClass('ds2-slider-navVisible')) {
                return;
            }
            $('.slick-prev, .slick-next', this).css('opacity', 1);
        }, function () {
            if (self.options.slider.hasClass('ds2-slider-navVisible')) {
                return;
            }
            $('.slick-prev, .slick-next', this).css('opacity', 0);
        });
    };

    proto.navButtonsUpdate = function () {
        var self = this,

            $prev = $('.slick-prev', self.options.slider),
            $next = $('.slick-next', self.options.slider);

        if (self.options.sliderSize <= 1 || !self.options.slider.hasClass('ds2-slider-navVisible')) {
            return;
        }

        $prev.css('opacity', 1);
        $next.css('opacity', 1);

        var pPosition,
            pRight,
            pLeft,
            pTop,
            sliderTopPos = $('.slick-slide img', self.options.slider).first().height() / 2 - $prev.height() / 2;

        pPosition = 'absolute';

        if (self.options.mq === 'small') {
            pRight = -12.5;
            pLeft = -12.5;
        } else {
            pRight = -27.5;
            pLeft = -27.5;
        }
        pTop = sliderTopPos;
        if (pPosition && !isNaN(pRight) && !isNaN(pLeft) && pTop !== undefined) {
            if (Dir.isLTR) {
                $next.css({
                    position: pPosition,
                    right: pRight,
                    top: pTop
                });
                $prev.css({
                    position: pPosition,
                    left: pLeft,
                    top: pTop
                });
            } else {
                $next.css({
                    position: pPosition,
                    left: pRight,
                    top: pTop
                });
                $prev.css({
                    position: pPosition,
                    right: pLeft,
                    top: pTop
                });
            }
        }
    },

        proto.setTriggerTrack = function () {
            var self = this;
            var download_icon = self.options.$element.find('.ds2-icon--download-white');

            download_icon.off('click').on('click', function (e) {

                var trackObj = {};
                var updatedIndex = self.options.currentSlide;

                trackObj.eventPoints = 'image-' + updatedIndex;
                trackObj.eventName = $(this).attr('download');
                trackObj.timeStamp = Date.now();
                trackObj.eventAction = 'Download';
                trackObj.target = $(this).attr('download');

                var dataEvent = $(this).data('tracking-event');
                var dataOptions = $(this).data('tracking-options');

                trackObj.mmdr = dataEvent.category.mmdr;

                $('.ds2-slider--main', self.options.$element).trigger('download-image', trackObj);

            });

        };

    proto.destroyLightbox = function () {
        $('.ds2-slider--zoom', this.options.$element).off('click');
    };

    proto.initLightbox = function () {
        var self = this;

        $('.ds2-slider--zoom', self.options.$element).off('click').on('click', function (event) {

            self.autoPlayDisable();

            var pId = '#' + $(this).attr('data-lightbox-id');
            var $activeSlide = $(this).closest('.ds2-slider--slide').data('slick-index');
            var layerSliders = $('.ds2-slider-lightbox', pId);
            //layerSliders.slick('slickSetOption', 'centerPadding', 0, true);
            layerSliders.slick('slickGoTo', $activeSlide, true);

            setTimeout(function () {
                self.sliderUpdate(layerSliders);
                layerSliders.slick('slickGoTo', $activeSlide);
            }, 750);

            var download_icon = layerSliders.parent().find('.ds2-icon--download-white');
            download_icon.off('click').on('click', function (e) {

                var trackObj = {};
                var closest = $(this).closest('.ds2-slider-lightbox');
                var updatedIndex = closest.slick('slickCurrentSlide');

                trackObj.eventPoints = 'image-' + updatedIndex;
                trackObj.eventName = $(this).data('tracking-options').name;
                trackObj.timeStamp = Date.now();
                trackObj.eventAction = 'Download';
                trackObj.target = $(this).attr('download');

                var dataEvent = $(this).data('tracking-event');
                var dataOptions = $(this).data('tracking-options');

                trackObj.mmdr = dataEvent.category.mmdr;
                $('.ds2-slider--main', self.options.$element).trigger('download-image', trackObj);
                e.stopPropagation();
            });

            self.trackSlider('Open image', 'open_image');
        });
    };

    return ds2Slider;
});

/*
 * Fallback in case AMD Markup is missing
 * @TODO check if it can be removed with QA
 */
require(['ds2-slider'], function (ds2Slider) {
    $('.ds2-slider').not("[data-loader='amdLoader']").each(function () {
        return new ds2Slider(this);
    });

    $(window).trigger('ds2-slider-ready');
});

