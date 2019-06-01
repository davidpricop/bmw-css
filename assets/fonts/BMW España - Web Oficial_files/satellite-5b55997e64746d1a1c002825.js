_satellite.pushAsyncScript(function(event, target, $variables){
  // Usabilla for BMW

// A Usabilla Campaign Form is triggered after a certain waiting time. 
// The waiting time counts from start of the Visit and is adjustable in this code.
// In addition the campaign conditions within Usabilla apply (See section 'User targeting' in Usabilla)
//-------------------------------------------------------------------------------------------


// Combi code BMW ES

window.lightningjs||function(c){function g(b,d){d&&(d+=(/\?/.test(d)?"&":"?")+"lv=1");c[b]||function(){var i=window,h=document,j=b,g=h.location.protocol,l="load",k=0;(function(){function b(){a.P(l);a.w=1;c[j]("_load")}c[j]=function(){function m(){m.id=e;return c[j].apply(m,arguments)}var b,e=++k;b=this&&this!=i?this.id||0:0;(a.s=a.s||[]).push([e,b,arguments]);m.then=function(b,c,h){var d=a.fh[e]=a.fh[e]||[],j=a.eh[e]=a.eh[e]||[],f=a.ph[e]=a.ph[e]||[];b&&d.push(b);c&&j.push(c);h&&f.push(h);return m};return m};var a=c[j]._={};a.fh={};a.eh={};a.ph={};a.l=d?d.replace(/^\/\//,(g=="https:"?g:"http:")+"//"):d;a.p={0:+new Date};a.P=function(b){a.p[b]=new Date-a.p[0]};a.w&&b();i.addEventListener?i.addEventListener(l,b,!1):i.attachEvent("on"+l,b);var q=function(){function b(){return["<head></head><",c,' onload="var d=',n,";d.getElementsByTagName('head')[0].",d,"(d.",g,"('script')).",i,"='",a.l,"'\"></",c,">"].join("")}var c="body",e=h[c];if(!e)return setTimeout(q,100);a.P(1);var d="appendChild",g="createElement",i="src",k=h[g]("div"),l=k[d](h[g]("div")),f=h[g]("iframe"),n="document",p;k.style.display="none";e.insertBefore(k,e.firstChild).id=o+"-"+j;f.frameBorder="0";f.id=o+"-frame-"+j;/MSIE[ ]+6/.test(navigator.userAgent)&&(f[i]="javascript:false");f.allowTransparency="true";l[d](f);try{f.contentWindow[n].open()}catch(s){a.domain=h.domain,p="javascript:var d="+n+".open();d.domain='"+h.domain+"';",f[i]=p+"void(0);"}try{var r=f.contentWindow[n];r.write(b());r.close()}catch(t) { 
 f[i]=p+'d.write("'+b().replace(/"/g,String.fromCharCode(92)+'"')+'");d.close();'}a.P(2)};
 a.l&&setTimeout(q,0)})()}();c[b].lv="1";return c[b]}var o="lightningjs",k=window[o]=g(o);k.require=g;k.modules=c}({}); if(!navigator.userAgent.match(/Android|BlackBerry|BB10|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/8445c5a2cf12.js"); } else {window.usabilla_live = lightningjs.require("usabilla_live", "//w.usabilla.com/3008841f7269.js"); }

// Combi code End

// Direct Call Rule for Adobe Analytics Tracking
_satellite.track("Usabilla_AA_Tracking");

//Trigger Script Start of Visit

(function() {
 //pageViewCounter Code begin.
  function setCookie(name, value, expiryValue, unit){
  var expires = ""
  
  if(expiryValue){
    var date = new Date();
      if(unit){
        switch(unit){
          case 'm':   date.setTime(date.getTime()+(expiryValue*60*1000));
                break;
          case 'h':   date.setTime(date.getTime()+(expiryValue*60*60*1000));
                break;
          case 'd':   date.setTime(date.getTime()+(expiryValue*24*60*60*1000));
                break;
          //default case is considered as days!
          default :   date.setTime(date.getTime()+(expiryValue*24*60*60*1000));
        }
        expires = "; expires="+date.toGMTString();
      }
  }

  document.cookie = name + "=" + (value || "") + expires + "; domain=bmw.es" + "; path=/";
}

function getCookie(name){
  var cookieList = document.cookie.split(';');
  var cookieName = name + "=";
    for(var i=0; i<cookieList.length; i++){
      var cookieValue = cookieList[i];
      while(cookieValue.charAt(0) === ' ')
        cookieValue = cookieValue.substring(1, cookieValue.length);
      if(cookieValue.indexOf(cookieName) === 0)
        return cookieValue.substring(cookieName.length, cookieValue.length);
    }
  return null;
}


function checkPageViewCount(){
  var pageViewCount = getCookie('pageViewCount')
  if(pageViewCount === null){
    setCookie('pageViewCount', '1');
  }
  else{
    var count = Number(pageViewCount)
    count = count + 1;
    setCookie('pageViewCount', String(count))
    if(count >= 3){
      // console.debug('Page View Requirement Complete!')
      return true;
    }
    else{
      return false;
    }
  }
}
  
//pageViewCount Code ends.

var pageCountDone = checkPageViewCount();

//timer Code begins.


function ifTimeOver(){
  var timeSpent = getCookie('time_spent');

  if(timeSpent === null){
    setCookie('time_spent', String(0));
  }
  else{
    if(timeSpent >= 60){
      clearInterval(timeInterval)
      // console.debug('Timer Complete!')
      return true;
    }
    else{
      timeSpent = parseInt(timeSpent);
      timeSpent = timeSpent + 1;
      setCookie('time_spent', timeSpent);
      return false;
    }
  }
}

function checkTimeAndPage(){
  var timeOver = ifTimeOver();

  if(timeOver && pageCountDone){
    clearInterval(timeInterval)
    // console.debug('Usabilla executed!');
		window.usabilla_live('trigger', 'waiting_time_reached')
  }
}

var timeInterval = setInterval(function(){
  checkTimeAndPage();
},1000);

  
//timer Code ends.
        
})();
});
