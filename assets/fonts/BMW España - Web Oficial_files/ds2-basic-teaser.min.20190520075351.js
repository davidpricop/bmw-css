/**
 * Created by maxchristl on 11.12.16.
 * modified Andrei C 6/6/2017 added lazy loading
 */
define(
  'ds2-basic-teaser',
  [
    'jquery',
    'use!log',
	'lazyload',
    'ds2-text-direction'
  ],
  function ($, log, LazyLoad, Dir) {
    'use strict';

    function BasicTeaser(component) {
      this.$component = $(component);
      new LazyLoad({ container: component });
      this.initTrigger();
    }

    BasicTeaser.prototype.initTrigger = function () {

      this._initOfferTeaser();
      this._getDomElements();
      this._registerEventListeners();

      log('BasicTeaser initialized', this);
    };

    BasicTeaser.prototype._initOfferTeaser = function () {

          var containerElem = this.$component.find('.ds2-offer-teaser--container');
          if(containerElem.length > 0) {
              containerElem.addClass(Dir.isLTR ? 'isLTR' : 'isRTL');
          }
      };

    BasicTeaser.prototype._getDomElements = function () {
      this.$link = this.$component.find('.ds2-basic-teaser--component-link');
      this.link = this.$link.attr('href');
      this.linkTarget = this.$link.attr('target');
    };

    BasicTeaser.prototype._registerEventListeners = function () {
      var self = this;

      $('.ds2-footnote, .ds2-tooltip, .ds2-basic-teaser--iframe-container', this.$component).on('click', function (event) {
        event.stopPropagation();
      });

      if (this.$component.not('.slider-padding').not('.ds2-video-layer-link').length === 0) {
        // wenn slider dann click fläche auf ds2-basic-teaser--content-container
        $('.ds2-basic-teaser--content-container', this.$component).not('.slider-padding')
          .not('.ds2-video-layer-link')
          .on('click', function (event) {
            self._click(this, event);
          });
      } else {
        this.$component.not('.slider-padding')
          .not('.ds2-video-layer-link')
          .on('click', function (event) {
            self._click(this, event);
          });
      }

    };

    BasicTeaser.prototype._click = function (clicked, event) {
      event.preventDefault();
      var childHasVideo = $(clicked).children().has('.ds2-video-layer-link').length > 0;
      var $clickedElement = $(event.target);
      var trackingEventData = this.$link.data('trackingEvent');
      var trackingEventInfoData = trackingEventData ? trackingEventData.eventInfo : {};
      var trackingCategoryData = trackingEventData ? trackingEventData.category : {};

      if (!childHasVideo) {
        $(window).trigger('ds2-manual-click:ds2-basic-teaser', [$clickedElement, event]);
        event.stopPropagation();

        $(window).trigger('ds2-user-action');

        //BMWDGTLTP-15766 - fix for tracking non-trackable button
        if ($clickedElement.closest('.ds2-button--responsive-line').length) {
          trackingEventInfoData.eventName = $clickedElement.closest('.ds2-button--responsive-line').find('span').text();
          trackingEventInfoData.eventAction = 'Internal click';
          trackingEventInfoData.element = 'Button';
          trackingEventInfoData.track = 'internal_click';
          trackingCategoryData.eventType = 'delayed';
        }

        if (this.$component.data('tracking-component')) {
          setTimeout(function () {
            this.$link.trigger('click');
          }.bind(this), 500);
        } else {
          // on author ds2TrackingBase might not be available so links are not handled by ds2-manual-click event handler
          if (this.link && this.linkTarget) {
            window.open(this.link, this.linkTarget);
          } else if (this.link) {
            window.location.href = this.link;
          }
        }

      }
    };

    return BasicTeaser;
  }
);
