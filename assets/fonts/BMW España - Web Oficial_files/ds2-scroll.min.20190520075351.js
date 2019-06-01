define('ds2-scroll', [], function() {
    var scroll = function(element) {
        this.el = element;
        this.startY = 0;
        this.startTop = 0;
        this.lineHeight = 16; // used for firefox wheel event

        // initialize the scrollbar
        this.setScrollBar = function() {
            // set the data-scroll attribute on the div
            this.el.setAttribute('data-scroll', true);

            // add the scrollBar to the container
            var isScrollable = this.el.scrollHeight > this.el.offsetHeight;
            var scrollBarContent = $(this.el).children(".scroll-bar-content");
            var hasScroll = scrollBarContent.length > 0;

            if (!hasScroll) {
                this.scrollBarContent = document.createElement("div");
                this.scrollBarContent.classList.add("scroll-bar-content");
                this.el.appendChild(this.scrollBarContent);
            } else {
                this.scrollBarContent =  scrollBarContent[0];
            }

            var scrollBar = this.scrollBarContent.getElementsByClassName('scroll-bar');
            var hasScrollBar = this.scrollBarContent && scrollBar.length > 0;
            if (!hasScrollBar) {
                this.scrollBar = document.createElement("div");
                this.scrollBar.classList.add("scroll-bar");
                this.scrollBarContent.appendChild(this.scrollBar);
            } else {
                this.scrollBar = scrollBar[0];
            }

            if (isScrollable) {
                this.scrollBarContent.classList.add('scrollable');
            } else if (!isScrollable) {
                this.scrollBarContent.classList.remove('scrollable');
            }
        }.bind(this);

        // get the scroll current bar settings
        this.getMetrics = function() {
            var scrollTop = this.el.scrollTop,
                offsetHeight = this.el.offsetHeight,
                totalHeight = this.el.scrollHeight,
                scrollBot = scrollTop + offsetHeight,
                elTop = this.el.offsetTop,
                elBottom = elTop + totalHeight,
                visibleTop = elTop < scrollTop ? scrollTop : elTop,
                visibleBottom = elBottom > scrollBot ? scrollBot : elBottom,
                visibleHeight = scrollBot - scrollTop,
                scrollBarContentHeight = this.scrollBarContent ? this.scrollBarContent.offsetHeight : 0,
                heightAr = totalHeight / visibleHeight,
                scrollBarHeight = parseInt(scrollBarContentHeight / heightAr),
                scrollBarTop = parseInt(scrollTop / heightAr);
            // scrollBarTop should never be < 0 and more than the height of the container - the height of the bar
            scrollBarTop = scrollBarTop + scrollBarHeight > totalHeight ? totalHeight - scrollBarHeight : scrollBarTop >= 0 ? scrollBarTop :  0 ;

            return {
                scrollTop: scrollTop,
                scrollBot: scrollBot,
                elTop: elTop,
                elBottom: elBottom,
                visibleBottom: visibleBottom,
                visibleTop: visibleTop,
                visibleHeight: visibleHeight,
                offsetHeight : offsetHeight,
                totalHeight: totalHeight,
                scrollBarHeight: scrollBarHeight,
                scrollBarContentHeight: scrollBarContentHeight,
                scrollBarTop: scrollBarTop,
                heightAr: heightAr,
            };
        }.bind(this);

        // sets the position of the scroll bar
        this.setBarPosition = function() {
            // verify if the scroll bar has been initialized
            this.setScrollBar();

            // set the current values for the scroll bar
            var metrics = this.getMetrics();
            this.scrollBar.setAttribute('style', 'height:' + metrics.scrollBarHeight + 'px; top:' + metrics.scrollBarTop + 'px');
            this.scrollBarContent.setAttribute('style', 'top:' + metrics.scrollTop + 'px');
        }.bind(this);

        // scroll to top
        this.scrollTop = function(top) {
            // if !top scroll all the way to the top
            this.el.scrollTop = top || 0;
        }.bind(this);

        // sets the dragging state
        this.setDragging = function(dragging) {
            this.dragging = dragging;
            if (dragging) {
                this.el.classList.add('scrolling');
            } else {
                this.el.classList.remove('scrolling');
            }
        }.bind(this);

        // set the initial parameters when starting to drag
        this.startDragging = function(ev, touch) {
            // on mouse down set the dragging to true
            this.setDragging(true);
            this.startY = !touch ? ev.clientY : ev.targetTouches[0].clientY;
            this.startTop = this.el.scrollTop;
        }.bind(this);

        this.init = function() {

            // initialize
            this.setBarPosition();

            // events
            window.addEventListener('resize', function() {
                // recalculate the scroll bar size and position on window resize
                this.setBarPosition();
                this.setDragging(false);
            }.bind(this));

            this.el.addEventListener('scroll', function() {
                // recalculate the scroll bar position on scroll
                this.setBarPosition();
            }.bind(this));

            this.scrollBar.addEventListener('mousedown', function(ev) {
                this.startDragging(ev);
            }.bind(this));

            this.el.addEventListener('mousedown', function(ev) {
                if (ev.which === 2) {
                    this.startDragging(ev);
                }
            }.bind(this));

            document.addEventListener('mousemove', function(ev) {
                // if the mouse is dragging recalculate the scroll bar position
                if (this.dragging) {
                    var metrics = this.getMetrics();
                    var thisY = ev.clientY;
                    this.el.scrollTop = this.startTop + ((thisY - this.startY) * metrics.heightAr);
                    this.setBarPosition();
                }
            }.bind(this));

            document.addEventListener('wheel', function(ev) {
                if (this.getScrollParent(ev.target) === this.el) {
                    ev.preventDefault();
                    // recalculate the scroll bar position on mouse wheel
                    var metrics = this.getMetrics();
                    // deltaY on firefox returns the number of lines not pixels
                    var deltaY = ev.deltaY >= 15 || ev.deltaY <= -15? ev.deltaY : ev.deltaY * this.lineHeight;
                    this.el.scrollTop = metrics.scrollTop + deltaY;
                    this.setBarPosition();
                }
            }.bind(this));

            this.scrollBarContent.addEventListener('click', function(ev) {
                // recalculate the position of the scroll on click
                if (ev.target !== this.scrollBar) {
                    var metrics = this.getMetrics();
                    this.el.scrollTop = ev.offsetY * metrics.heightAr;
                    this.setBarPosition();
                }
                this.setDragging(false);
            }.bind(this));

            document.addEventListener('mouseup', function() {
                // set dragging as false if mouse is up
                this.setDragging(false);
            }.bind(this));

            // mobile events
            document.addEventListener('touchstart', function(ev) {
                if (this.getScrollParent(ev.target) === this.el) {
                    if (event.stopPropagation) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    this.el.classList.add('touching');
                    this.startDragging(ev, true);
                }
            }.bind(this));

            this.scrollBar.addEventListener('touchstart', function(ev) {
                this.el.classList.add('touching');
                this.startDragging(ev, true);
                this.touchDirection = -1; // invert touch direction for mobile
            }.bind(this));

            document.addEventListener('touchmove', function(ev) {
                ev.preventDefault;
                if (this.dragging) {
                    var metrics = this.getMetrics();
                    var thisY = ev.targetTouches[0].clientY;
                    this.el.scrollTop = this.startTop + ((this.touchDirection * (this.startY - thisY)) * metrics.heightAr);
                    this.setBarPosition();
                }
            }.bind(this));

            document.addEventListener('touchend', function() {
                this.el.classList.remove('touching');
                this.setDragging(false);
                this.touchDirection = 1;
            }.bind(this));

            this.getScrollParent = function(node) {
                var isHtmlDocumentType = node instanceof HTMLDocument;

                if (!node) {
                    return null;
                }

                if (!isHtmlDocumentType &&
                    node.getAttribute('data-scroll') &&
                    node.scrollHeight > node.clientHeight) {
                    return node;
                } else {
                    return this.getScrollParent(node.parentNode);
                }
            }.bind(this);

        };

        // initialize only of element is present
        if (this.el) {
            this.init();
        }

        return this;
    };

    return scroll;
});
