/*
tacho seite 


TODO:
besser auftrennen in init, show, hide
gibt es bei jqm onpagehide oder onpageblur oder so?
warum Fehler bei Seitenstart IN APP??
 
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
			// TODO: weitere Transform (opera, mozilla ...)
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
		window.myHudTimeout = window.setTimeout("onFadeHud()",5000); // TODO: als function oder var für 5000
		$(".autofade").css({"opacity":"1"});
		//$(".autofade").fadeout(1000);
	});
}

function onFadeHud(){
	$(".autofade").animate({"opacity":"0.0"},2000);
}

/*
 * beachte, dass meist speed===null auf Computern ohne GPS-Hardware, auch wenn Position bekannt und anzeigbar. 
 */
function onGeoSuccess(pos){
	if (pos.coords.speed) $("#speed").html(pos.coords.speed+'.');
	$('#gps-status').html('GPS ok.');
}
function onGeoError(error) {
	kwd_log('geo code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	$('#gps-status').html('GPS nicht aktiv.');  // TODO: Ausgabe String var
 } 

