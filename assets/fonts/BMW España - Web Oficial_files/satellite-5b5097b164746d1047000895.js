window.addScript = function(a, b) {
    (function(a, b, g, e, c, f) {
        c = a.createElement(b);
        f = a.getElementsByTagName(b)[0];
        c.async = !0;
        "function" == typeof e && (c.addEventListener ? c.addEventListener("load", e, !1) : c.readyState && (c.onreadystatechange = function() {
            "complete" != c.readyState && "loaded" != c.readyState || e();
        }));
        c.src = g;
        f.parentNode.insertBefore(c, f);
    })(document, "script", a, b);
};

//-----------------------------------------------//

window.addAdwords = function(p, c){
    var g = 'google_trackConversion';
    function tr(p, c){
        if (c) { p.google_custom_params = c; }
        window[g](p);
    }
    if (typeof window[g] == 'function') {
        tr(p, c);
    } else {
        addScript('//www.googleadservices.com/pagead/conversion_async.js', function(){tr(p,c)});
    }
};
