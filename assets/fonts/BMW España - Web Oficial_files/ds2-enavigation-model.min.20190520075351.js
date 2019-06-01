define('ds2-tracking-enavigation-model',
    ['jquery',
     'ds2-tracking-base',
     'ds2-tracking'],
    function ($, ds2TrackingBase, tracking) {
        $.widget('digitals2.ds2TrackingEnavigationModel', ds2TrackingBase, {

            _create: function () {
                var ret = this._super();
                var self = this;

                self.$modelNavigationComponent = $('#ds2-model-navigation'); //tracking component data
                self.$modelMenu = self.$modelNavigationComponent.children('#ds2-model-menu'); //tracking event data

                self.$modelNavigationComponent.on('navigationItemActiveChange', function (event) {
                    if (event.eventType.toLowerCase() === 'click' || event.eventType.toLowerCase() === 'swipe') {
                        self._trackModelNavigation(event);
                    }
                });

                return ret;
            },

            _trackModelNavigation: function (event) {
                var self = this;
                var trackingEvent = self._getTrackingEvent() || {};
                var trackingOptions = self._getTrackingOptions() || {};
                var pEvent;
                var eventName = self._getActiveNavItemName(event);
                var eventAction = trackingEvent.eventInfo ? trackingEvent.eventInfo.eventAction : '';
                var eventPoints = '';
                var target = window.location.href;
                var cause = self._isSeriesOrBodyRange();
                var effect = event.eventType;
                var element = trackingEvent.eventInfo ? trackingEvent.eventInfo.element : '';

                trackingOptions.name = trackingEvent.eventInfo ? trackingEvent.eventInfo.track : '';

                pEvent = self._populateClickEvent(event, trackingOptions.name, target, eventName, cause, effect);
                pEvent.eventInfo.eventPoints = eventPoints;
                pEvent.eventInfo.eventAction = eventAction;
                pEvent.eventInfo.element = element;
                var pEventOptions = self.bmwTrackOptionsBuilder.options()
                    .name((trackingOptions.name || '')).build();
                self._parseDataFromEvent(pEvent, pEventOptions, event, true);
            },

            _isSeriesOrBodyRange: function () {
                return $('#pad1 li.active').data('id') === 1 ? 'Series' : 'Body type';
            },

            _getActiveNavItemName: function (event) {
                return event.isSeriesOrBodyChanged ? $('#pad1 li.active a').text().trim() : event.activeSubNavItem.text().trim();
            },

            _getTrackingEvent: function () {
                return this.$modelMenu.data('trackingEvent');
            },

            _getTrackingOptions: function () {
                return this.$modelMenu.data('trackingOptions');
            }
        });

        return function($eNavModel) {
            $eNavModel.ds2TrackingEnavigationModel(tracking.getOptions('ds2-model-navigation'));
        }
    }
);

define('ds2-enavigation-model', [
    'jquery',
    'lodash',
    'ds2-tracking-enavigation-model'
], function($, _, eModelNavTracking) {

  var padNavigation = {
    resizeTimer: null,
    windowWidth: $(window).width(),
    rtimeOut: function (callback, delay) {
      var dateNow = Date.now,
        requestAnimation = window.requestAnimationFrame,
        start = dateNow(),
        stop,
        timeoutFunc = function () {
          dateNow() - start < delay ? stop || requestAnimation(timeoutFunc) : callback()
        };
      requestAnimation(timeoutFunc);
      return {
        clear: function () {
          stop = 1
        }
      }
    },
    init: function (containers, $element) {
      this.containers = containers;
      this.$element = $element;
      this.$modelCars = this.$element.find('#ds2-model-cars')

      // initialy hide all model-car's
      this.$element.find('.ds2-model-car').addClass('hide');

      this.attachEvents();
      this.containers.each(function (index, container) {
        var $container = $(container);
        padNavigation.initScrollBehavior($container.find('ul').first());
        padNavigation.scrollToItem($container.find('.active').first(), $container.find('ul').first());

        if (index === 0) {
          padNavigation.updateContent($container, 'init');
        }
      });

      padNavigation.adaptSameHeightCars();
    },
    attachEvents: function () {
      padNavigation.containers.each(function (index, container) {
        var $container = $(container);

          $container.on('click', '.model-nav li', function (event) {
            var $self = $(this);
            event.preventDefault();
            padNavigation.scrollToItem($self, $self.closest('ul'));
            padNavigation.updateContent($container, event.type);
        });
      });

      $(window).on('resize', function () {
        var newWindowWidth = $(window).width();
        if (padNavigation.windowWidth !== newWindowWidth) {
            padNavigation.windowWidth = newWindowWidth;
            clearTimeout(padNavigation.resizeTimer);
            padNavigation.resizeTimer = setTimeout(function () {
                padNavigation.containers.each(function (index, container) {
                    var $container = $(container);
                    padNavigation.initScrollBehavior($container);
                    padNavigation.scrollToItem($container.find('.active').first(), $container.find('ul'));
                    padNavigation.adaptSameHeightCars();
                });
            }, 250);
        }
      });

      this.$element.find('.model-nav-prev-button').on('click', function (event) {
        var $self = $(this);
        var currentLi = $self.closest('.model-nav').find('li.active');
        var prevLi = currentLi.prev().not('.clone');

        if (prevLi.length) {
          padNavigation.scrollToItem(prevLi, prevLi.closest('ul'));
          padNavigation.updateContent($self.closest('.model-nav-holder'), event.type);
        }
      });

      this.$element.find('.model-nav-next-button').on('click', function (event) {
        var $self = $(this);
        var currentLi = $self.closest('.model-nav').find('li.active');
        var nextLi;

        if (currentLi.length !== 0) {
          nextLi = currentLi.next().not('.clone');
        } else {
          nextLi = $self.closest('.model-nav').find('li:first-child').not('.clone').addClass('active');
        }

        if (nextLi.length) {
          padNavigation.scrollToItem(nextLi, nextLi.closest('ul'));
          padNavigation.updateContent($self.closest('.model-nav-holder'), event.type);
        }
      });
    },

    initScrollBehavior: function (scrollContainer) {
      if (scrollContainer.hasClass('infinite')) {
        padNavigation.addInfiniteItems(scrollContainer, true, true);
      }

      if (padNavigation.windowWidth < 980) {
        var scrollTimer;
        scrollContainer.on('scroll', _.debounce(function () {
          if (scrollTimer) {
            scrollTimer.clear();
          }
          scrollTimer = padNavigation.rtimeOut(function () {
            if (false === scrollContainer.hasClass('disable-scroll')) {
              var containerCenter = scrollContainer.width() / 2,
                  scrollContainerOffset = scrollContainer.offset().left,
                  scrollLeft = 0,
                  minimum = 1000000,
                  minimumItem = null;

              scrollContainer.find('li').removeClass('active');
              scrollContainer.find('li').each(function () {
                $self = $(this);
                var itemOffset = $self.offset().left;
                var itemWidth = $self.outerWidth();
                var itemCenter = (itemOffset + (itemWidth / 2)) - scrollContainerOffset;

                if (itemCenter >= 0) {
                  if (minimum > Math.abs(containerCenter - itemCenter)) {
                    minimum = Math.abs((containerCenter - itemCenter));
                    scrollLeft = (containerCenter - itemCenter);
                    minimumItem = $self;
                  }
                  else {
                    return false;
                  }
                }
              });
              scrollContainer.addClass('disable-scroll');
              minimumItem.addClass('active');
              padNavigation.rtimeOut(function () {
                padNavigation.updateContent(scrollContainer.closest('.model-nav-holder'), 'swipe');

                var itemCenter = (minimumItem.offset().left + (minimumItem.outerWidth() / 2)) - scrollContainerOffset;
                scrollLeft = (containerCenter - itemCenter);

                scrollContainer.animate({scrollLeft: (scrollContainer.scrollLeft() + -scrollLeft)}, 50);

                padNavigation.rtimeOut(function () {
                  scrollContainer.removeClass('disable-scroll');
                }, 150);

                padNavigation.rtimeOut(function () {
                  padNavigation.padPosition(scrollContainer.closest('.model-nav-holder').find('.pad'), scrollContainer);
                }, 50);

                // check if new clones must be add (left or right end reached)
                if (scrollContainer.scrollLeft() === 0) {
                  padNavigation.rtimeOut(function () {
                    scrollContainer.addClass('disable-scroll');
                    // add the first clones left
                    padNavigation.addInfiniteItems(scrollContainer, true, false);

                    padNavigation.rtimeOut(function () {
                      padNavigation.scrollToItem(minimumItem, scrollContainer);
                    }, 100);
                  }, 50);
                }
                else if ((scrollContainer.scrollLeft() + scrollContainer.outerWidth()) >= scrollContainer[0].scrollWidth) {
                  padNavigation.rtimeOut(function () {
                    scrollContainer.addClass('disable-scroll');
                    // add the first clones right
                    padNavigation.addInfiniteItems(scrollContainer, false, true);

                    padNavigation.rtimeOut(function () {
                      padNavigation.scrollToItem(minimumItem, scrollContainer);
                    }, 100);
                  }, 50);
                }
              }, 200);
            }
          }, 100);
        }, 200));
      }
    },
    addInfiniteItems: function (scrollContainer, left, right) {
      var clonedItems = [];

      scrollContainer.find('li').not('.clone').each(function () {
        var clonedItem = $(this).clone();
        clonedItem.removeClass('active').addClass('clone');
        clonedItems.push(clonedItem);
      });

      // add the first clones left and right
      for (var i = 0; i < 5; i++) {
        if (left) {
          for (var k = clonedItems.length - 1; k >= 0; k--) {
            scrollContainer.prepend(clonedItems[k].clone());
          }
        }
        if (right) {
          for (k = 0; k < clonedItems.length; k++) {
            scrollContainer.append(clonedItems[k].clone());
          }
        }
      }
    },
    padPosition: function (pad, scrollContainer) {
      if (scrollContainer.find('.active').first().offset()) {
        pad.css({
          'left': scrollContainer.find('.active').first().offset().left,
          'width': scrollContainer.find('.active').first().outerWidth()
        });
      }

    },
    scrollToItem: function (item, scrollContainer) {
      scrollContainer.addClass('disable-scroll');

      scrollContainer.find('li').removeClass('active');
      item.addClass('active');

      padNavigation.rtimeOut(function () {
        var scrollContainerOffset = scrollContainer.offset().left;
        var containerCenter = scrollContainer.width() / 2;
        var itemOffset = item.offset() ? item.offset().left : 0;

        var itemWidth = item.outerWidth();
        var itemCenter = (itemOffset + (itemWidth / 2)) - scrollContainerOffset;
        var scrollLeft = (containerCenter - itemCenter);

        scrollContainer.animate({scrollLeft: (scrollContainer.scrollLeft() + -scrollLeft)}, 150);
        padNavigation.rtimeOut(function () {
          scrollContainer.removeClass('disable-scroll');
          padNavigation.rtimeOut(function () {
            padNavigation.padPosition(scrollContainer.closest('.model-nav-holder').find('.pad'), scrollContainer);
            padNavigation.showHideNextPrevButtons(scrollContainer.closest('.model-nav-holder'));
          }, 25);
        }, 250);
      }, 100);
    },

    showHideCars: function ($activeNavItem, eventType, isSeriesOrBodyChanged) {
      var displayTime = 100,
        occurrenceTimeout = 100,
        hideClassTimeout = 250,
        carAnimationTimeout = 300;
      var $carsList = $('.ds2-model-car');
      var series = $activeNavItem.data('series') || null;
      var bodyType = $activeNavItem.data('body-type') || null;
      var visibleCarModelsListLength = $carsList.filter(function () {
        var car = $(this);
        return car.data('car-series') === series || car.data('car-body-type') === bodyType;
      }).length;

      $carsList.each(function (index, element) {
        var car = $(this);

        if (car.data('car-series') === series || car.data('car-body-type') === bodyType) {
          // car is filtered by series or body type
          padNavigation.rtimeOut(function () {
            if (car.hasClass('hide')) {
              padNavigation.rtimeOut(function () {
                car.removeClass('hide');
              }, hideClassTimeout);
              padNavigation.rtimeOut(function () {
                car.find('.ds2-model-card').removeClass('car-hidden').addClass('car-visible');
              }, carAnimationTimeout);
            }
          }, displayTime);
          displayTime += occurrenceTimeout;
        }
        else {
          // car is not filtered by series or body type
          if (false === car.hasClass('hide')) {
            padNavigation.rtimeOut(function () {
              car.addClass('hide');
            }, hideClassTimeout);
            padNavigation.rtimeOut(function () {
              car.find('.ds2-model-card').removeClass('car-visible').addClass('car-hidden');
            }, carAnimationTimeout);
          }
        }
      });

      if (visibleCarModelsListLength) {
        padNavigation.adaptCarsWrapperHeight(true);
      } else {
        padNavigation.adaptCarsWrapperHeight(false);
      }

      $('#ds2-model-menu').trigger({
        type: 'navigationItemActiveChange',
        eventType: eventType,
        activeSubNavItem: $activeNavItem,
        isSeriesOrBodyChanged: isSeriesOrBodyChanged
      });
    },

    updateContent: function (container, eventType) {
      var $activeNavItem;
      var $pad2 = $('#pad2');
      var $pad3 = $('#pad3');

      // change on series/bodytype filter
      if (container.attr('id') === 'pad1') {
        var selectedContainerId = container.find('li.active').first().data('id');

        if (selectedContainerId === 1) {
          //series
          $pad2.show();
          $pad3.hide();
          $activeNavItem = $pad2.find('li.active').first();

          padNavigation.showHideCars($activeNavItem, eventType, true);
          padNavigation.scrollToItem($activeNavItem, $pad2.find('ul'));

          setTimeout(function () {
            padNavigation.padPosition($pad2.find('.pad'), $pad2.find('ul'));
          }, 20);
        }
        else if (selectedContainerId === 2) {
          // body types
          $pad3.show();
          $pad2.hide();
          $activeNavItem = $pad3.find('li.active').first();

          padNavigation.showHideCars($activeNavItem, eventType, true);
          padNavigation.scrollToItem($activeNavItem, $pad3.find('ul'));

          padNavigation.rtimeOut(function () {
            padNavigation.padPosition($pad3.find('.pad'), $pad3.find('ul'));
          }, 20);
        }
      }

      // changes on series
      if (container.attr('id') === 'pad2') {
        //series
        $activeNavItem = container.find('li.active').first();
        padNavigation.showHideCars($activeNavItem, eventType, false);
      }

      // changes on body types
      if (container.attr('id') === 'pad3') {
        //series
        $activeNavItem = container.find('li.active').first();
        padNavigation.showHideCars($activeNavItem, eventType, false);
      }
    },
    showHideNextPrevButtons: function (container) {
      var leftButton = container.find('.model-nav-prev-button');
      var rightButton = container.find('.model-nav-next-button');
      var lastLi = container.find('ul li').not('.clone').last();

      if ($('html').attr('dir') === 'rtl') {
        var tempButton = leftButton;
        leftButton = rightButton;
        rightButton = tempButton;
        lastLi = container.find('ul li').not('.clone').first();
      }


      if (container.find('ul').scrollLeft() === 0) {
        leftButton.hide();
      }
      else {
        leftButton.show();
      }

      if (lastLi.length) {
        var offsetRight = lastLi.offset().left + lastLi.outerWidth() - lastLi.closest('ul').offset().left;

        if (container.find('ul').width() >= offsetRight) {
          rightButton.hide();
        }
        else {
          rightButton.show();
        }
      }
    },

    adaptSameHeightCars: function () {
      var $carBoxesWithoutAllItem = this.$element.find('.ds2-model-car').not('.ds2-model-car--all');
      var maxHeight = 0;
      var carBoxTotalHeight;

      $carBoxesWithoutAllItem.css('min-height', 'auto');
      $carBoxesWithoutAllItem.each(function () {
        var carBoxHeight = $(this).height();
        if (maxHeight < carBoxHeight) {
          maxHeight = carBoxHeight;
        }
      });

      $carBoxesWithoutAllItem.css('min-height', maxHeight);
      carBoxTotalHeight = maxHeight + parseInt($carBoxesWithoutAllItem.css('margin-bottom'), 10);
      this.$modelCars.data('min-height', carBoxTotalHeight);
    },

    /**
     * Add height of the car box to the cars boxes wrapper to avoid content blinking
     * @param carBoxTotalHeight - boolean
     */
    adaptCarsWrapperHeight: function (carBoxTotalHeight) {

      if (carBoxTotalHeight) {
        this.$modelCars.css('min-height', this.$modelCars.data('min-height'));
      } else {
          this.$modelCars.css('min-height', 'auto');
      }
    }
  };

    var eModelNav = function(element) {
        var $element = $(element);
        padNavigation.init($element.find('.model-nav-holder'), $element);

        // initialize tracking
        eModelNavTracking($element);
    };

  return eModelNav;

});

