_satellite.pushAsyncScript(function(event, target, $variables){
  // Get Adform Page Name
var dataLayer = digitals2.tracking.api.getPageObject(digitals2.tracking.api.getCurrentPageIndex());

var subCategory01 = dataLayer.page.category.subCategory01;
var subCategory02 = dataLayer.page.category.subCategory02;
var subCategory03 = dataLayer.page.category.subCategory03;
var subCategory04 = dataLayer.page.category.subCategory04;
var pageName = dataLayer.page.pageInfo.pageName;

var pageArray = [subCategory01, subCategory02, subCategory03, subCategory04, pageName];

var adformPageName = "";

for (i = 0; i < pageArray.length; i++) { 
    
  if(pageArray[i] != undefined){
    
    adformPageName = adformPageName + pageArray[i] + " ";
    
  }  
}
adformPageName = adformPageName.substring(0, adformPageName.length-1);

//<!-- Adform Tracking Code BEGIN -->
    window._adftrack = Array.isArray(window._adftrack) ? window._adftrack : (window._adftrack ? [window._adftrack] : []);
    window._adftrack.push({
        pm: 1542485,
        divider: encodeURIComponent('|'),
        pagename: encodeURIComponent(adformPageName)
    });
    (function () { var s = document.createElement('script'); s.id = "Adform Script"; s.type = 'text/javascript'; s.async = true; s.src = 'https://track.adform.net/serving/scripts/trackpoint/async/'; var x = document.getElementsByTagName('script')[0]; x.parentNode.insertBefore(s, x); })();

//<!-- Adform Tracking Code END -->
});
