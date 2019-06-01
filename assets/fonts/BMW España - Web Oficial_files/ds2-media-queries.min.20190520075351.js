/**
 * ds2-media-queries static utility module
 * author: joel
 */
define('ds2-media-queries', function () {

    var mediaQueries = {
        'small'             : 'only screen',
        'medium'            : 'only screen and (min-width: 521px)',
        'large'             : 'only screen and (min-width: 981px)',
        'xlarge'            : 'only screen and (min-width: 1281px)',
        'xxlarge'           : 'only screen and (min-width: 1921px)',
        'small-navi'        : 'only screen and (min-width: 0em)',
        'medium-navi'       : 'only screen and (min-width: 45.063em)',
        'large-navi'        : 'only screen and (min-width: 64.063em)',
        'small-integration' : 'only screen and (min-width: 0em)',
        'medium-integration': 'only screen and (min-width: 40em)',
        'large-integration' : 'only screen and (min-width: 64.063em)'
    };


    var matches = function(breakpoint) {
        var mq = window.matchMedia(this.mediaQueries[breakpoint]);
        return mq.matches;
    };

    return {
        mediaQueries: mediaQueries,
        matches: matches
    };
});
