/*
tacho seite 


TODO:
besser auftrennen in init, show, hide
gibt es bei jqm onpagehide oder onpageblur oder so?
warum Fehler bei Seitenstart IN APP??
 
*/
function onTachoInit() {

	$("#page-tacho").click(function(){
		
		if(window.isHUD) {
			// TODO: weitere Transform (opera, mozilla ...)
			$("#speed").css({"transform":"scale(1,1)"});
			$("#speed").css({"-webkit-transform":"scale(1,1)"});
			window.isHUD = false;
		}
		else {
			$("#speed").css({"transform":"scale(-1,1)"});
			$("#speed").css({"-webkit-transform":"scale(-1,1)"});
			window.isHUD=true; 
		}
		// ggf. ausgeblendetes anzeigen und wieder ausblenden
		// nach ca. 5s
		if (window.myHudTimeout) window.clearTimeout(window.myHudTimeout); // alten löschen, damit nicht mehrere unterwegs sind
		window.myHudTimeout = window.setTimeout("onFadeHud()",5000); // TODO: als function oder var für 5000
		$(".autofade").css({"opacity":"1"});
	});
}

function onTachoShow() {
//	<button onclick="window.plugins.insomnia.keepAwake()">keep awake</button>
//<button onclick="window.plugins.insomnia.allowSleepAgain()">allow sleep again</button>

	$(".autofade").css({"opacity":"1"});

	// due to body color set bei jqm...:
	// because you cannot invoke '!important' by $('body').css(...  
	//var csstxt = $('body').css('cssText') + ';background-color: black !important;';
	//$('body').css('cssText', csstxt);
	$('body').css({'background':'black'});

	// code hier wirkt bei öffnen der Seite
	if (window.myHudTimeout) window.clearTimeout(window.myHudTimeout); // alten löschen, damit nicht mehrere unterwegs sind
	window.myHudTimeout = window.setTimeout("onFadeHud()",5000);
	// starte Abfrage neu
	// enableHighAccuracy meist *nötig*, um coords.speed zu erhalten. 
	if (navigator.geolocation) {
		if(window.gpsinterval) {
			window.geoInterval=window.setInterval(function(){navigator.geolocation.getCurrentPosition(onGeoSuccess,onGeoError,{ enableHighAccuracy: true });},1000);
			kwd_log('gps interval enabled');
		}
		else window.geoWatchId=navigator.geolocation.watchPosition(onGeoSuccess,onGeoError,{ enableHighAccuracy: true });
	}
	//screen timeout ausschalten
	if (window.plugins && window.plugins.insomnia) window.plugins.insomnia.keepAwake();	
}
function onTachoHide() {

	if (window.geoInterval) {
		window.clearInterval(window.geoInterval);
		window.geoInterval=null;
	}
	if(window.geoWatchId) {
		navigator.geolocation.clearWatch(window.geoWatchId);
		window.geoWatchId = null;
	}
	if (window.myHudTimeout) window.clearTimeout(window.myHudTimeout);
	window.myHudTimeout = null;
	$(".autofade").css({"opacity":"1"});

	// because you cannot invoke '!important' by $('body').css(... in some browsers  
	//var csstxt = $('body').css('cssText');
	//var c = $('body').css;
	//kwd_log("css:"+c);
	//$('body').css('cssText', csstxt);
	$('body').css({'background':'#83C2FD'});
	
	//screen timeout wieder an
	if (window.plugins && window.plugins.insomnia) window.plugins.insomnia.allowSleepAgain();	
}

function onFadeHud(){
	$(".autofade").animate({"opacity":"0.0"},2000);
}

/*
 * beachte, dass meist speed===null auf Computern ohne GPS-Hardware, auch wenn Position bekannt und anzeigbar. 
 */
function onGeoSuccess(pos){

var s;

	if(!window.geocounter) window.geocounter = 1;
	else window.geocounter++;
	
	//$('#gps-status').html('GPS ok ['+window.geocounter+'] ');
	if (pos.coords) {
		//$('#gps-status').append((JSON.stringify(pos.coords)).replace(/,/g,', '));
	}
	if (pos.coords.speed!==null) {
		s = pos.coords.speed*3.6;
		if (s>5) s=s|0;
		$("#speed").html(s);
		window.mylastspeed = s;
	}

}
function onGeoError(error) {

	kwd_log('geo code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	//$('#gps-status').html('GPS nicht aktiv.');  // TODO: Ausgabe String var
	if(window.mylastspeed===0 || window.mylastspeed>0) {
		$("#speed").html(window.mylastspeed);
	}
 } 

