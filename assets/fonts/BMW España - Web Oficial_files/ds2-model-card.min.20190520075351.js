define('ds2-model-card', [
    'lazyload'
], function (LazyLoad) {
    var ModelCard = function(element) {

        var modelCardImageElem = element.classList.contains('ds2-model-card--image') ? element : element.parentNode,
            enterCb = function(el) {
                modelCardImageElem.classList.add('ds2-model-card--image--loading');
                var isEnhanced = el.classList.contains('ds2-model-card--street-lazy-load');
                if(isEnhanced){
					el.classList.add('ds2-model-card--street-background-img');
                }
            },
            loadErrorCb = function() {
                modelCardImageElem.classList.remove('ds2-model-card--image--loading');
            };

		new LazyLoad({
             threshold: 100,
             callback_set:loadErrorCb,
             callback_enter: enterCb,
             callback_load: loadErrorCb,
             callback_error: loadErrorCb
        });
    };

    return ModelCard;
});
