define('ds2-tracking-model-overview',
    ['jquery',
    'ds2-tracking-base',
    'ds2-tracking'],
    function($, ds2TrackingBase, tracking) {
  $.widget('digitals2.ds2TrackingModelOverview', ds2TrackingBase, {

    _listenersInit: function() {
      var self = this;
      $(window).on('ds2-model-overview--filtered', function( event ,dataTrackObj) {
          var TC = digitals2.tracking.TrackingConstants;

          var trackingEvent = self.eventBuilder.newEvent()
            .eventAction('Filter')
            .primaryCategoryIsInteraction()
            .eventName(dataTrackObj.eventName)
            .cause(dataTrackObj.cause)
            .build();

          trackingEvent.category.mmdr = dataTrackObj.category.mmdr;

          var trackingOptions = self.bmwTrackOptionsBuilder.options()
            .name(TC.FILTER)
            .useTimer(true)
            .build();

          self._callExpandEvent(trackingEvent, trackingOptions);
        });
      this._super();
    }
  });

  return function($element) {
      $element.ds2TrackingModelOverview(tracking.getOptions('ds2-models'));
  }
});

define('ds2-models', [
    'jquery',
    'lodash',
    'ds2-tracking-model-overview',
    'ds2-resize-events',
    'ds2-main'
], function($, _, modelOverviewTracking) {
    var ds2ModelSeries = function (element) {
        this.options = {
            modelsCardItems: '.ds2-models-js--card-item',
            modelsOptions: '.ds2-models-js--options',
            modelsSeries: '.ds2-models-js--series',
            modelsSeriesHeader: '.ds2-models-js--series-header',
            modelsWrapper: '.ds2-models-js--container',
            modelsAnchors: '.ds2-models-js--anchors li',
            modelsCounterId: '#ds2-models-js--counter',
            checkbox: '.ds2-models--filter .ds2-checkbox',
            modelsRowClasses: 'ds2-row-padding row',
            modelsWrapperClass: 'ds2-models--series-wrap',
            modelsWrapperId: 'ds2-models-js--series-wrap',
            animationEndEvent: 'animationend',
            selectedClass: 'ds2-selected',
            fadeInClass: 'ds2-fade-in',
            fadeOutClass: 'ds2-fade-out',
            inAnimationKey: 'cardFadeIn',
            outAnimationKey: 'cardFadeOut',
            hiddenClass: 'ds2-hidden',
            lastElementClass: 'end',
            customEventToStartFadeInAnimations: 'customEventToStartFadeInAnimations',
            baseMargin: 15,
            outSize: 0,
            counter: 0
        };
        this.element = $(element);
        this._create();

        // init tracking loaded via require above
        modelOverviewTracking(this.element);
    };

    Object.assign(ds2ModelSeries.prototype, {
        _create: function () {
            var self = this;
            self.checkboxes = $(self.options.checkbox, $('.show-for-medium-up', self.element));
            self.modelSeries = $(self.options.modelsSeries, self.element);
            self.modelSeriesHeaders = $(self.options.modelsSeriesHeader, self.modelSeries);
            self.modelsWrapper = $(self.options.modelsWrapper, self.element);
            self.modelsCardItems = $(self.options.modelsCardItems, self.element);
            self.activeModelsCount = self.modelsCardItems.length;
            self.modelsCounter = $(self.options.modelsCounterId, self.element);
            self.modelsOptions = $(self.options.modelsOptions, self.element);
            self.anchorsList = $(self.options.modelsAnchors, self.modelsOptions);
            self.layerCheckboxes = $(self.options.checkbox, '.ds2-tooltip-element--filter');
            self.modelsToAnimateOut = $();
            self.modelsToAnimateIn = self.modelsCardItems;
            self._setDeviceValues();
            self._handleModelOptions();
            self._addCategoryName();
            self.modelsToAnimateOut = {};
            self.modelsToAnimateIn = {};
            self.checkboxes.on('click', function (e) {
                self._filter();
                self._trackFilter(this);
            });
            self.layerCheckboxes.on('click', function (e) {
                self._syncCheckboxes(true);
                self._filter();
                self._trackFilter(this);
            });
            if (self.modelsOptions.length > 0) {
                $(window).on('scroll', _.debounce(function () {
                    self._handleModelOptions();
                }, 200));
            }
            $(window.digitals2.resizeEvents).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', function () {
                self._onResize();
            });
            $(window.digitals2.main).on( self.options.customEventToStartFadeInAnimations,  {'self': self}, self._startBatchInAnimation );
            self.modelsCardItems.addClass( self.options.fadeInClass );
        },
        _filter: function () {
            var self = this;
            self.checkedBoxes = self.checkboxes.filter(':checked');
            self.modelsCardItems.removeClass(self.options.selectedClass);

            if (self.checkedBoxes.length === 0) {
                self.modelsToAnimateIn  = self.modelsCardItems;
            } else {
                self.checkedBoxes.each(function( idx, el ) {
                    self.modelsCardItems.filter('.' + $(el).val()).addClass(self.options.selectedClass);
                });
                self.modelsToAnimateIn  = self.modelsCardItems.filter('.' + self.options.selectedClass);
            }
            self.modelsToAnimateOut = self.modelsCardItems.filter('.' + self.options.fadeInClass);
            self.modelsCardItems.removeClass(self.options.fadeInClass).removeClass(self.options.fadeOutClass);
            self.options.outSize = self.modelsToAnimateOut.length - 1;
            self.modelsToAnimateOut.one( self.options.animationEndEvent, {'self': self}, self._animationEndEventHandler );

            self._updateSeriesNumber( $() );
            self.modelsToAnimateOut.addClass(self.options.fadeOutClass);

            self._syncCheckboxes();
            self._updateCounter();
            self._addCategoryName();
        },
        _animationEndEventHandler: function( event ) {
            var animationEvent = event.originalEvent,
                passedData = event.data.self,
                $currentElement = $( event.currentTarget );
            if ( animationEvent.animationName === passedData.options.outAnimationKey ) {
                $currentElement.addClass(passedData.options.hiddenClass);
                if ( passedData.options.counter === passedData.options.outSize ) {
                    passedData.options.counter = 0;
                    passedData.options.outSize = 0;
                    $( window.digitals2.main ).trigger( passedData.options.customEventToStartFadeInAnimations );
                } else {
                    passedData.options.counter++;
                }
            }
        },
        _startBatchInAnimation: function( event ) {
            var passedData = event.data.self, selectedModels = passedData.modelsToAnimateIn;
            if ( selectedModels && selectedModels.length > 0 ) {
                selectedModels.removeClass(passedData.options.hiddenClass).addClass( passedData.options.fadeInClass );
            }
            passedData._updateSeriesNumber( selectedModels );
        },
        _updateSeriesNumber: function( list ) {
            var self = this;
            if ( list.length > 0 ) {
                list.closest( self.options.modelsSeries ).find( self.options.modelsSeriesHeader ).removeClass( self.options.hiddenClass );
            } else {
                self.modelSeriesHeaders.addClass( self.options.hiddenClass );
            }
        },
        _handleModelOptions: function () {
            var self = this;
            if (self.isMobile) {
                this.modelsOptions.addClass('ds2-visible');
                var optionsHeight = this.modelsOptions.height(), componentTop = this.element.offset().top, componentBottom = componentTop + this.element.height(), scrollTop = $(window).scrollTop(), minOffset = this.options.baseMargin * 3;
                if (componentBottom - optionsHeight - scrollTop < minOffset) {
                    this.modelsOptions.css({
                        position: 'absolute',
                        top: 'auto',
                        bottom: '0'
                    });
                } else if (componentTop - scrollTop < minOffset) {
                    this.modelsOptions.css({
                        position: 'fixed',
                        top: minOffset,
                        bottom: 'auto'
                    });
                } else {
                    this.modelsOptions.css({
                        position: 'absolute',
                        top: '0',
                        bottom: 'auto'
                    });
                }
            } else {
                this.modelsOptions.removeClass('ds2-visible').css({
                    position: '',
                    top: '',
                    bottom: ''
                });
            }
        },
        _setDeviceValues: function () {
            var self = this;
            switch (window.digitals2.resizeEvents.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                    self.isMobile = true;
                    self.isTablet = false;
                    break;
                case 'ds2ResizeMedium':
                    self.isTablet = true;
                    self.isMobile = false;
                    break;
                default:
                    self.isMobile = false;
                    self.isTablet = false;
                    break;
            }
            switch (window.digitals2.resizeEvents.mediaQueryNaviWatcherCheck()) {
                case 'ds2ResizeSmallNavi':
                    self.isTablet = true;
                    this.modelsCardItems.removeClass('medium-4').addClass('medium-6');
                    break;
                case 'ds2ResizeMediumNavi':
                    self.isTablet = true;
                    this.modelsCardItems.removeClass('medium-6').addClass('medium-4');
                    break;
            }
        },
        _trackFilter: function (clickedElement) {
            var id = $(clickedElement).attr('id');
            var label = $(clickedElement).closest('.ds2-label--group').find('label[for="' + id + '"]');
            if (label.data('trackingEvent')) {
                var dataTrackObj = label.data('trackingEvent');
                dataTrackObj.eventName = dataTrackObj.cause = $.trim(label.text());
                $(window).trigger('ds2-model-overview--filtered', dataTrackObj, this);
            }
        },
        _addCategoryName: function () {
            var self = this;
            self.anchorsList.removeClass('ds2-active');
            self.modelsToAnimateIn.each(function () {
                var category = '.' + $(this).closest('.ds2-models--series').data('category-class');
                self.anchorsList.filter(category).addClass('ds2-active');
            });
        },
        _syncCheckboxes: function (layer) {
            if (layer) {
                this.layerCheckboxes.each(function () {
                    var a = $(this);
                    var b = $($(this).data('checkbox-sync'));
                    var prop = a.prop('checked');
                    b.prop('checked', prop);
                });
            } else {
                this.checkboxes.each(function () {
                    var a = $(this);
                    var b = $($(this).data('checkbox-sync'));
                    var prop = a.prop('checked');
                    b.prop('checked', prop);
                });
            }
        },
        _updateCounter: function () {
            this.activeModelsCount = this.modelsToAnimateIn.length;
            this.modelsCounter.text(this.activeModelsCount);
        },
        _onResize: function () {
            this._setDeviceValues();
            this._handleModelOptions();
        }
    });
    return ds2ModelSeries;
});

