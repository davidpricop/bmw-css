_satellite.pushAsyncScript(function(event, target, $variables){
  var ebRand = Math.random()+'';
ebRand = ebRand * 1000000;
//<![CDATA[ 
  var sizmekTag = document.createElement("script");
sizmekTag.src = "//bs.serving-sys.com/Serving/ActivityServer.bs?cn=as&amp;ActivityID=948558&amp;rnd=" + ebRand + "";
sizmekTag.async = "true";
 
document.body.appendChild(sizmekTag);

//]]>



});
