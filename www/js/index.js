/*
alle Deviceready Funktionen
und Event Handler


* ich nehme an, dass das Verwenden der Klasse app dazu dient,
 * diesen Code zu ignorieren, falls er im Browser gestartet wird.
 * 
 * interessante Struktur aber unnötig für diesen einfachen Fall
 * zumal lieber der Listener in document ready einfgefügt wird. 
 
 Stattdessen ist es Vorlage für das geplante kwd-Object
 "KwdApp"
 
 Features
 - code to make it run under DroidScript
 */


/*
 * TODO: isDevice als Parameter?
 */
$(document).ready(function() {
	
	kwd_debugscreen=true;// TODO: mache doch einen Schalter :-)
		
	// no name like 'app' because of other js libs
	kwd = new KwdApp(); // wird hier schon gebraucht
	

    if( kwd.isDevice ) {
    	kwd_log('Wird als Device erkannt.');
        document.addEventListener("deviceready", onDeviceReady, false); 
        kwd_log('app:added listener');
    } else {
        onDeviceReady();
    }
});


function onDeviceReady() {

 	kwd_debugscreen=true;// mache doch einen Schalter :-)
 	if (!kwd_debug) {
 		$('.debug').css( {'display':'none'});
 		$('.develope').css( {'display':'none'});
 	}
    if(window.isDroidscript==true) {
    	kwd_log("isDroidScript enabled.");
    }
    //kwd_log (document.URL);
    
    // STARTUP und SYSTEM INFO ---------------------------------------------------------------    

	if(kwd.isDevice) {
		$('#info-platform').html(device.platform);
		$('#info-os').html(device.version);	
		$('#info-model').text(device.model);	
	}

	if (navigator.connection && navigator.connection.type) {
		$('#online-status').html(''+navigator.connection.type);
	}
	if (navigator.connection) {
		kwd_log('Connection verfügbar');
	}
	else {
		kwd_log('keine connection');
	}

	if (navigator.geolocation) kwd_log('GPS verfügbar');
	else kwd_log('kein GPS.');
	
    // EVENT LISTENER ------------------------------------------------------------
    
	// geht nicht auf ios (muss ich es extra abfragen oder wird es dort automatisch ignoriert??
	if (kwd.isDevice) {
				
		document.addEventListener("menubutton", onMenuButtonTouch, false);
		document.addEventListener("backbutton", onBackButtonTouch, false);
	 	document.addEventListener("online", onOnline, false);	
	 	document.addEventListener("offline", onOffline, false);
		document.addEventListener("pause", onPause, false);	 		
		document.addEventListener("resume", onResume, false);	 		
	}
	
	
	// CLICK HANDLER -------------------------------------------------------------
	
	// TODO: ist touch function besser??
	
	$('#headbackbutton').click(function(){
		performBackAction();
	});	
	$('#doUpdate').click(function(){
		// show progress indicator
		kwd.projects.download();
		kwd.news.download();
		kwd.offers.download();
		//TODO: alle Image Updates hier!
		// hide progress indicator
	});
	$('#doQuit').click(function(){
		navigator.app.exitApp(); // does work on Android + windowsphone // iOS and other Systems don't have an user invoked exit!
	});	
	$('#doSave').click(function(){
		downloadImages(); // TODO: wann automatisch??
		// z.B. kwd_downloadFiles(kwd_storage_projects);
	});
	$('#doTest2').click(function(){
		showLinks();           				
	});
	$('#doTest3').click(function(){
		
		//var teststring = '$("#testbild").attr("src","http://www.kuehne-webdienste.de/files/me-shot.jpg");';
		//eval(teststring);
		//kwd_log("eval works as expected.");

		var strread = localStorage.getItem(kwd_storage_files);
		if(strread) {
			kwd_log("test files array:");
			kwd_log(JSON.parse(strread));
		}
		else ("no files array found");
		           				
		// $('#testbild').attr('src','http://localhost/tk/kwd-redaxo-46/files/me-shot.jpg');           				
	});
	$('#data-rel-forward').click(function(){
		window.history.go(1); // try to go forward history				           				
	});
	$('.aproject').click(function() {
		alert('project');
		kwd_log('project');
	});
	// update mode
	$('#flip-6').change(function() {
		//alert("update ="+$(this).val());
		if($(this).val()=='off') {
			kwd_update=false;
			kwd.updateMode('offline');
			$('#options-info').html("Bei Aktualisieren \"Nie\" ist diese App komplett offline. Es können nur bereits gespeicherte Inhalte angezeigt werden.");
			$('#box-options-info').css( {'display':'block'});
		}
		else {
			kwd_update=true;
			kwd.updateMode('auto');
			$('#options-info').html("Bei Aktualisieren \"Auto\" werden Inhalte im Hintergrund aktualisiert, falls eine Verbindung zum Internet besteht.");
			$('#box-options-info').css( {'display':'block'});
			//TODO: gleich Daten-Update aufrufen??
		}		
	});
	$('#flip-debug').change(function() {
		if($(this).val()=='on') {
			kwd_debug=true;
			// CSS Sichtbarkeit
			$('.debug').css( {'display':'block'});			
			//$('#debug-switch').css( {'display':'block'});			
		}
		else {
			kwd_debug=false;
			$('.debug').css( {'display':'none'});						
		}
	});	
	$('#switchtacho').click(function() {
		window.gpsinterval=true;	
	});
	$('#doClearCache').click(function() {

		// localstorage gespeicherte Keys auflisten?
		kwd_log("ClearCache Items: "+window.localStorage.length);
		window.localStorage.clear();
		// TODO: delete images
		// test debug adjust - Code to change state of switch:		
		// $("select#flip-debug").val ("off");
		// $("select#flip-debug").flipswitch("refresh"); // na endlich		
	});
	// calling external link (does not work without JS):
	$('.externallink').click(function() {
		if(kwd.isDevice) {
			//alert(href);
			// TODO: according to forum this does NOT work an ALL systems!
			navigator.app.loadUrl(this.href, { openExternal:true } );
			return false; // shall prevent default action of <a>			
		}
		else return true;
	});
	// TODO: wie besser die Klick-handler dort deklarieren, wo sie gebraucht werden (Seite)
	//    oder zusammenfassen als function?
	$('#project-share').click(function() {
		// - URL auf die Seite im Web
		// - diese wird aus der article-url gewonnen
		// - nur isDevice
		// TODO: function für die drei share-varianten, da auch andere Seiten (Listen) evtl. einen "Share"-Button erhalten
		var shareok = false;
		if(kwd.isDevice) {
			var p = kwd.projects.getItem();
			if (p!=null) {
				var u = kwd.projects.getUrlFromId(p['article_id']);
				var name = p['name'];
				if (!name) name= '';
				window.plugins.socialsharing.share("Schauen Sie sich diese interessante Seite an!", "KÜHNE-Webdienste.de "+name, null,u);
				shareok=true;
			}
		}
		if (!shareok) alert ("Teilen in diesem Kontext nicht möglich");
	}); 
	$('#news-share').click(function() {
		// - URL auf die Seite im Web
		// - diese wird aus der article-url gewonnen
		// - nur isDevice
		// TODO: function für die drei share-varianten
		var shareok = false;
		if(kwd.isDevice) {
			var n = kwd.news.getItem();
			if (n!=null) {
				var u = kwd.news.getUrlFromId(n['article_id']);
				var name = n['name'];
				if (!name) name= '';
				window.plugins.socialsharing.share("Schauen Sie sich diese interessante Seite an!", "KÜHNE-Webdienste.de "+name, null,u);
				shareok=true;
			}
		}
		if (!shareok) alert ("Teilen in diesem Kontext nicht möglich");
	});
	$('#offer-share').click(function() {
		// - URL auf die Seite im Web
		// - diese wird aus der article-url gewonnen
		// - nur isDevice
		// TODO: function für die drei share-varianten
		var shareok = false;
		if(kwd.isDevice) {
			var o = kwd.projects.getItem();
			if (o!=null) {
				var u = kwd.projects.getUrlFromId(o['article_id']);
				var name = o['name'];
				if (!name) name= '';
				window.plugins.socialsharing.share("Schauen Sie sich diese interessante Seite an!", "KÜHNE-Webdienste.de "+name, null,u);
				shareok=true;
			}
		}
		if (!shareok) alert ("Teilen in diesem Kontext nicht möglich");
	});

	// Intervall-Modus voreinstellen
	window.gpsinterval=true;
	onTachoInit(); // ist auch klick handler // TODO: könnte man erst beim ersten Aufruf des Tacho setzen 
	// schreibe Funktion, die dies für alle Links automatisiert!
	//navigator.app.loadUrl('http://www.google.com', { openExternal:true } );
	
	// UPDATE CONTENT-----------------------------------------------------------
	
	// set update (settings) switch
	if(kwd.updateMode()=='offline')  {
		$("#flip-6").val('off'); // so easy :-)
		kwd_log("set update mode == OFFLINE");
	}
	kwd_log(kwd.updateMode());

	kwd.init(); // for preloading text data		
	
	// SHOW
	
	if (kwd.isDevice) {
		// TODO: vielleicht sogar erst nach erstem 'pageonshow' event
		// TODO: oder mit timeout;
        navigator.splashscreen.hide();		
	}
	
	// TESTS
	
	v = new PrivateStatic();
	kwd_log(v.static());
	kwd_log(v.static(1));
	kwd_log(v.static());
	kwd_log(v.static(2));
	kwd_log(v.static());
	kwd_log(v.privatemember());
}


// NAVIGATION OVERRIDE WINDOW.HISTORY ----------------------------------------

/*
 * in diesem Projekt ist Struktur unveränderlich, deshalb statische Seitensteuerung...
 * 
 */
function performBackAction() {

	var current = $( ":mobile-pagecontainer" ).pagecontainer('getActivePage').attr('id');
	
	// TODO: is platform name consistent??? lieber teilstring suchen
	if (current=="page-start" && kwd.isDevice) {
		navigator.app.exitApp(); // does work on Android + windowsphone // iOS and other Systems don't have an user invoked exit!
	}
	else {
		switch (current) {
			// TODO: insert var instead of switch !!
			case 'page-aproject': $( ":mobile-pagecontainer" ).pagecontainer( "change", "#page-projects"); break;
			case 'page-anews': $( ":mobile-pagecontainer" ).pagecontainer( "change", "#page-news"); break;
			case 'page-anoffer': $( ":mobile-pagecontainer" ).pagecontainer( "change", "#page-offers"); break;
			default: $( ":mobile-pagecontainer" ).pagecontainer( "change", "#page-start" ); break;
		}	
	}       						
}


// EVENT CALLBACKS DEVICE -----------------------------------------------------

function onMenuButtonTouch() {
	// (deviceready auf jeden Fall gegeben)
	$.mobile.changePage ($("#page-start")); //( hard codiert unsere Startpage)
	//TODO: abfragen ob Startpage schon da?
}
/*
 * der back button soll nicht die window.history abarbeiten, 
 * da es auch einen back-button im html gibt, Funktion nutzen
 */
 function onBackButtonTouch() {
 	performBackAction();
	//TODO: abfragen ob Startpage schon da?
}
function onOnline() {
	$("#online-status").html(navigator.connection.type);	
	//kwd.setOnlineStatus(true); -- set updateMode instead
}
function onOffline() {
	$("#online-status").html('OFFLINE');
	//kwd.setOnlineStatus(false);
}
function onPause() {
	if(window.geoWatchId || window.geoInterval) {
		onTachoHide();
		window.tachopaused=true;
	}
}
function onResume() {
	if(window.tachopaused) {
		onTachoShow();
		window.tachopaused=false;
	}
}

$(function() {
    //$( "[data-role='navbar']" ).navbar();
    $( "[data-role='header']" ).toolbar();
});


// PAGE START/SHOW -------------------------------------------------------------

// nur Defs, die für mehr als eine Seite gelten
// TODO: wie vermeiden hart codierte Seitennamen? (evtl. nur Zähler)
$( document ).on( "pagebeforeshow", "[data-role='page']", function() {
	

	var current = $( this ).attr('id');	
	var previous = '';
	var title ='';
	// da statisch hier switch (einfacher anscheinend als jquery die Daten zu entlocken)
	// z.Z. previous ungenutzt, da kein Back-Button mit Text
	switch(current) {
		
		case 'page-aproject': previous = 'Referenzen'; break;
		case 'page-anews': previous = 'News'; break;		
		case 'page-anoffer': previous = 'Leistungen'; break;
		case 'page-tacho': onTachoShow(); // hier kein break!	
		default : previous = "Start";
	}
	if (current == "page-start") {
		$("#headbackbutton").css ({'display':'none'});
		$("#logo").css({"background-image":"url(res/kwd-4-title.png)"});
		$("#page-title").text("");	
	} 
	else {
		$("#headbackbutton").css( { 'display':'block'});
		//$("#headbackbutton").html(previous);
		$("#logo").css({"background-image":"none"});
		if (current=="page-info") $("#page-title").text("Infos & Kontakt");
		if (current=="page-einstellungen") $("#page-title").text("Einstellungen");	
	}
	if(current!="page-tacho") {
		onTachoHide();
	}
});
