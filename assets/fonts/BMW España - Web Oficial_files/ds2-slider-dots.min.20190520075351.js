/**
 * @module ds2-slider-dots
 * @description Insta Style Dots Pagination Component for Slick Sliders
 * @author Patrick Rathke
 */

define(
    'ds2-slider-dots',
    [
        'jquery',
        'jquery-slick',
        'ds2-main'
    ],
    function ($, slick) {
        'use strict';

        /**
         * Create a new Dots Component for Sliders.
         * @alias module: ds2-slider-dots
         * @param {HTMLElement} slider - the slider element.
         * @param {number} showDots - optional param for controlling amount of visible dots.
         * @constructor
         */
        function DS2SliderDots(slider, showDots) {

            /**
             * @type {*|jQuery|HTMLElement} this parent component element
             */
            this.$element = $(slider);
            var dotsWrapper = this.$element;

            /**
             * Sets dots to true in slick slider
             */
            if (this.$element.slick) {
                this.$element.slick('slickSetOption', 'dots', true, true);
				dotsWrapper = this.$element.slick("slickGetOption", "appendDots");
			}

            /**
             * jquery elements
             * @type {{dots: (*|jQuery|HTMLElement)}}
             */
            this.$elements = {
                container: $('.slick-dots', dotsWrapper),
                dots: $('.slick-dots li button', dotsWrapper)
            };

            /**
             * component and slider options
             * @type {{showDots: number, dotCount, vertical: boolean}}
             */
            this.options = {
                showDots: showDots || 6,
                dotCount: this.$elements.dots.length,
                vertical: false
            };

            /**
             * modifier classes
             * @type {{active: string, small: string, vertical: string}}
             */
            this.classes = {
                active: 'is-active',
                small: 'is-small',
                vertical: 'is-vertical'
            };

            /**
             * calculates upper lower amount of dots
             * @type {number}
             */
            this.options.showDotsUpper = Math.ceil((this.options.showDots-1)/2);
            this.options.showDotsLower = Math.floor((this.options.showDots-1)/2);
            this.options.showDotsOdd = (this.options.showDotsUpper === this.options.showDotsLower) ? 1 : 0;

            /**
             * Init
             */
            this.activeDots(-1, 0);
        }

        /**
         * Updates slick dots to show only a limited number of dots around the active slide/dot
         * @param prevDot - the slide before change
         * @param activeDot - the slide after change
         */
        DS2SliderDots.prototype.activeDots = function (prevDot, activeDot) {
            var self = this,
                i = 0,
                direction = (prevDot < activeDot) ? 'right' : 'left';

            /**
             * Find active dots and make them visible + hide all other dots
             */
            self.$elements.dots.each( function () {
                var dot = $(this);

                if ((direction === 'right' && activeDot >= i-self.options.showDotsUpper && activeDot <= i+self.options.showDotsLower) ||
                    (direction === 'left' && activeDot >= i-self.options.showDotsLower && activeDot <= i+self.options.showDotsUpper) ||
                    (activeDot < self.options.showDotsUpper && i < self.options.showDots) ||
                    (activeDot >= self.options.dotCount - self.options.showDotsUpper && i >= self.options.dotCount - self.options.showDots) ) {
                    dot.addClass(self.classes.active);
                }
                else {
                    dot.removeClass(self.classes.active);
                }
                i++;
            });

            /**
             *  Add small class to first and last active dot if that one is not the first/last visible dot
             */
            self.$elements.activedots = self.$elements.dots.filter('.' + self.classes.active).removeClass(self.classes.small);
            if (self.options.dotCount >= self.options.showDots) {
                if ((direction === 'right' && activeDot >= self.options.showDotsUpper + self.options.showDotsOdd) ||
                    (direction === 'left' && activeDot > self.options.showDotsUpper) ||
                    (self.options.dotCount === self.options.showDots && activeDot >= self.options.showDotsUpper) ) {
                    self.$elements.activedots.first().addClass(self.classes.small);
                }
                if ((direction === 'right' && activeDot < self.options.dotCount - self.options.showDotsUpper - 1) ||
                    (direction === 'left' && activeDot <= self.options.dotCount - self.options.showDotsUpper - 1 - self.options.showDotsOdd) ||
                    (self.options.dotCount === self.options.showDots && activeDot <= self.options.dotCount - self.options.showDotsUpper - 1) ) {
                    self.$elements.activedots.last().addClass(self.classes.small);
                }
            }

            /**
             * Checks direction of Slider and set Dot direction
             */
            self.options.vertical = self.$element.slick('slickGetOption', 'vertical');
            self.$elements.container.toggleClass(self.classes.vertical, self.options.vertical)

        };

        /**
         * Updates slick dots option to display or hide the dots
         * @param show - display or hide the dots
         */
        DS2SliderDots.prototype.toggleDots = function (show) {
            var self = this;

            if (show) {
                self.$elements.container.show();
            }
            else {
                self.$elements.container.hide();
            }

        };

        return DS2SliderDots;
    });
