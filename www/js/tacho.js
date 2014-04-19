/*
tacho seite 

besser auftrennen in init, show, hide
gibt es bei jqm onpagehide oder onpageblur oder so?
*/
function onTachoInit() {

	// code hier wirkt bei öffnen der Seite
	if (window.myHudTimeout) window.clearTimeout(window.myHudTimeout);
	window.myHudTimeout = window.setTimeout("onFadeHud()",5000);
	// starte Abfrage neu
	if (navigator.geolocation)
		window.geoWatchId=navigator.geolocation.watchPosition(onGeoSuccess,onGeoError);	

	// ermögliche touch auf gesamter Seite
	// TODO: besser nur einmal bei Programmstart setzen
	$("#page-tacho").click(function(){
		
		if(window.isHUD) {
			$("#speed").css({"-webkit-transform":"scale(1,1)"});
			window.isHUD = false;
		}
		else {
			$("#speed").css({"-webkit-transform":"scale(-1,1)"});
			window.isHUD=true; 
		}
		// ggf. ausgeblendetes anzeigen und wieder ausblenden
		// nach ca. 5s
		if (window.myHudTimeout) window.clearTimeout(window.myHudTimeout);
		window.myHudTimeout = window.setTimeout("onFadeHud()",5000);
		$(".autofade").css({"opacity":"1"});
		//$(".autofade").fadeout(1000);
	});
}

function onFadeHud(){
	$(".autofade").animate({"opacity":"0.0"});
}

function onGeoSuccess(pos){
	$("#speed").html(pos.coords.speed);
}
function onGeoError(error) {
alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
 } 

