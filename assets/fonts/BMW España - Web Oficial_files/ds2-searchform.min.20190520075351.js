define(
    'ds2-searchform',
    [
        'jquery',
        'ds2-resize-events'
    ],
    function($) {
        'use strict';
        function ds2Searchform(element) {
            this.element = $(element);
            this.options = {
                trigger: '.ds2-navigation-main--search',
                target: '.ds2-searchform-js',
                closeTrigger: '.ds2-searchform-js--close',
                navigationClass: 'ds2-navigation-main--container',
                navigationTopBar: '.ds2-navigation-main--top-bar',
                navigationTopBarOpen: 'ds2-navigation-main--top-bar-open',
                hasCloseButton: false,
                closeBtnContent: 'ds2-navigation-element--flyout-close',
                searchFormOpen: 'ds2-searchform--open',
            };
            this.$document = $(document);
            this.init();
        }

        ds2Searchform.prototype.init = function() {
            var self = this,
                $trigger = $('a', this.options.trigger),
                $closeTrigger = $(this.options.closeTrigger),
                areWeOnSearchResultsPage = false,
                wcagExist = ($('.ds2-wcag').length > 0) ? true : false,
                closeIcon = $(".ds2-searchform-js--close");

            $('.ds2-navigation-main--container').on('searchform:menu:close', self, function(){
                self.autoHeightAnimate('ds2-inactive');
            });
            areWeOnSearchResultsPage = ($('.aems-sr-searchbox').length > 0) ? true : false;

            if (wcagExist) {
                if (closeIcon.hasClass("icon-close-dark")) {
                    closeIcon.removeClass("icon-close-dark");
                    closeIcon.addClass("icon-close-white");
                }
            }

            if (!areWeOnSearchResultsPage) {
                // Trigger in main navi
                $trigger.off();
                $trigger.on('click', function(e) {
                    e.preventDefault();
                    self.toggleSearchForm($(this));
                });

                // trigger in close icon
                $closeTrigger.off();
                $closeTrigger.on('click', function(e) {
                    e.preventDefault();
                    self.toggleSearchForm($(this));
                });
            } else {
                $trigger.off();
                $trigger.on('click', function(e) {
                    e.preventDefault();
                    $('#aems-inputsearch').focus();
                });
                // TODO: When backend cant set that variable
                // $trigger.addClass('ds2-active-page');
            }
            $(window.digitals2.resizeEvents).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', self, self.onResize);

            if ($('div').hasClass(this.options.closeBtnContent)) {
                this.options.hasCloseButton = true;
            }
        };

        ds2Searchform.prototype.toggleSearchForm = function($trigger) {
            var self = this,
                $target = $(this.options.target),
                isSearchFormOpen = $target.hasClass(this.options.searchFormOpen);

            if (!isSearchFormOpen) {
                self.closeFlyout();
                self.autoHeightAnimate('ds2-open');

                //BMWST-3149 Change phone and tablet header height
                self.openHeaderHeight();

            } else {
                    self.setTriggerClass('ds2-inactive');
                    this.$document.trigger('models:click');
                    self.autoHeightAnimate('ds2-inactive');

                //BMWST-3149 Change phone and tablet header height
                self.closeHeaderHeight();
            }
        };

        ds2Searchform.prototype.autoHeightAnimate = function(mode) {
                mode === 'ds2-open' ? this.setTriggerClass('ds2-active') : this.setTriggerClass('ds2-inactive');
                this.$document.trigger('models:click');
        };

        ds2Searchform.prototype.closeFlyout = function() {
            var flyoutContainer = $('.ds2-navigation-main--flyout-container'),
                navigationSalesbar = $('.ds2-navigation-salesbar');

            if (flyoutContainer.hasClass('.ds2-navigation-main--flyout-container--open')) {
                this.element = flyoutContainer;
            } else if (navigationSalesbar.hasClass('ds2-active')) {
                $('.ds2-navigation-main--salesbar a').removeClass('ds2-active');
                this.element = navigationSalesbar;
            }
            flyoutContainer.removeClass('ds2-navigation-main--flyout-container--open');
            $('.ds2-navigation-main--level-1 li a').removeClass('ds2-active');
            $('.ds2-navigation-main--menu li a').removeClass('ds2-active');
            navigationSalesbar.removeClass('ds2-active');
            $('.ds2-searchform').css({
                display: '',
                height: '',
                overflow: ''
            });
        };

        ds2Searchform.prototype.closeHeaderHeight = function() {
            $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
        };

        ds2Searchform.prototype.openHeaderHeight = function() {
            if (!this.options.hasCloseButton) {
                if ($('.ds2-navigation-main--id-module').css('display') != 'none') {
                    $(this.options.navigationTopBar).addClass(this.options.navigationTopBarOpen);
                } else {
                    $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
                }
            } else {
                $(this.options.navigationTopBar).removeClass(this.options.navigationTopBarOpen);
            }
        };

        ds2Searchform.prototype.setTriggerClass = function(mode) {
            var $trigger = $('a', this.options.trigger),
                $target = $(this.options.target),
                activeClass = 'ds2-active';

            switch (mode) {
                case 'ds2-active':
                    $trigger.addClass(activeClass);
                    $target.addClass(this.options.searchFormOpen);
                break;
                case 'ds2-inactive':
                    $trigger.removeClass(activeClass);
                    $target.removeClass(this.options.searchFormOpen);
                break;
            }
        };

        ds2Searchform.prototype.onResize = function(self) {};

        return ds2Searchform;
    }
);
