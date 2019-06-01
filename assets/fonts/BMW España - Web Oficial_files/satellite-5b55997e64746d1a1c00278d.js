_satellite.pushAsyncScript(function(event, target, $variables){
  var psymaTag = document.createElement("script"); 
psymaTag.src = "//scripts.psyma.com/scripts/abes/abes_bmw.php";
psymaTag.type = "text/javascript"; 
psymaTag.async = true; 
psymaTag.defer = true;


document.body.appendChild(psymaTag);
});
