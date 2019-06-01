/*
 FitText.js 1.2
 !!! customized by martin: added option for parent element !!!

 Copyright 2011, Dave Rupert http://daverupert.com
 Released under the WTFPL license
 http://sam.zoy.org/wtfpl/

 Date: Thu May 05 14:23:00 2011 -0600
*/
"function"==typeof define&&define.nextId("fittext");(function(a){a.fn.fitText=function(b,e){var f=b||1,c=a.extend({minFontSize:Number.NEGATIVE_INFINITY,maxFontSize:Number.POSITIVE_INFINITY,masterWithElement:a(this)},e);return this.each(function(){var b=a(this),d=function(){b.css("font-size",Math.max(Math.min(c.masterWithElement.width()/(10*f),parseFloat(c.maxFontSize)),parseFloat(c.minFontSize)))};d();a(window).on("resize.fittext orientationchange.fittext",d)})}})(jQuery);