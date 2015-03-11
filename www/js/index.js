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
 
 interessanter Code für Tap-Events:
 //define tab or click event type on rool level (can be combined with modernizr)
iaEvent = "click";
if (typeof navigator !== "undefined" && navigator.app) {
   iaEvent = "tap";
}
$('.ext-link').each.bind(iaEvent, function() {
    if (typeof navigator !== "undefined" && navigator.app) {
        // Mobile device.
        var linktarget = this.attr("href");
        navigator.app.loadUrl(linktarget, {openExternal: true});
    } else {
        // Possible web browser
        window.open(linktarget, "_blank");
    }
});
 */

/* sets info depending on updateMode and situation (connection)
 * - must not be called before document ready and deviceready 
 */
function setDataInfo() {

	if(kwd.updateMode()=='offline') $('.data-warning').html('Bitte setzen Sie in den <a href="#page-einstellungen">Einstellungen</a> Aktualisieren auf "Auto" oder wählen "Jetzt Aktualisieren"');
	else $('.data-warning').text('Bitte warten Sie einen Moment, oder überprüfen Sie Ihre Internetverbindung! (Daten müssen einmal heruntergeladen werden, um offline lesbar zu sein.)');
	
	if (kwd.isDevice) $('.data-warning').append('<br />'+navigator.connection.type);
}

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
		// TODO: show progress indicator
		// TODO: make central update: kwd.update()
		kwd.updateAll();
		//TODO: was passiert bei click VOR erstem Anzeigeversuch? (Da dann Callback-function noch nicht gesetzt)
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
			var filedata = JSON.parse(strread);
			var l = filedata.length;
			kwd_log("files from storage, size: "+l);
			var i;
			var h = '';
			for (i=0;i<l;i++) {
				h += '<tr>';
				h += '<td>'+i+'</td>';
//				h += '<td>'+(filedata[i]['name'].substr((filedata[i]['name'].length-32)))+'</td>';
				h += '<td>'+(filedata[i]['name'])+'</td>';
				h += '<td>'+(filedata[i]['status'])+'</td>';
				h += '<td>'+(filedata[i]['code'])+'</td>';
				h += '<td>'+(filedata[i]['remote'])+'--</td>';
				h += '<td>'+(filedata[i]['local'])+'--</td>';
//				h += '<td>'+(filedata[i]['remote'].substr(0,32))+'...</td>';
//				h += '<td>'+(filedata[i]['local'].substr(0,32))+'...</td>';
				h+= '</tr>';
			}
			$('#files-table').html(h);
			
			// nicer output of table
		}
		else kwd_log("no files array found");
		           				
		// $('#testbild').attr('src','http://localhost/tk/kwd-redaxo-46/files/me-shot.jpg');           				
	});
	// update mode
	$('#flip-6').change(function() {
		//alert("update ="+$(this).val());
		if($(this).val()=='off') {
			kwd_update=false;
			kwd.updateMode('offline');
			setDataInfo();
			$('#options-info').html("Bei Aktualisieren \"Nie\" ist diese App komplett offline. Es können nur bereits gespeicherte Inhalte angezeigt werden.");
			$('#box-options-info').css( {'display':'block'});
		}
		else {
			kwd_update=true;
			kwd.updateMode('auto');
			setDataInfo();
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
			$('#debug-switch').css( {'display':'block'});			
		}
		else {
			kwd_debug=false;
			kwd_debug_counter=0;
			$('.debug').css( {'display':'none'});						
			$('#debug-switch').css( {'display':'none'});			
		}
	});
	$('#sysinfo').click(function() {
		if(kwd_debug==false) kwd_debug_counter++;
		if(kwd_debug_counter > 7) $('#info-os').text(kwd_debug_counter);
		if(kwd_debug_counter > 10) {
			kwd_debug_counter = 0;
			kwd_debug = true;
			$('.debug').css( {'display':'block'});						
			$('#debug-switch').css( {'display':'block'});
			$('#info-os').text("Debug Modus EIN");		
			$("#flip-debug").val('on'); // geht nicht
		}
	});
	$('#switchtacho').click(function() {
		window.gpsinterval=true;	
	});
	$('#doClearCache').on('tap',function() {

		// localstorage gespeicherte Keys auflisten?
		kwd_log("ClearCache Items: "+window.localStorage.length);
		// delete images *before* text data!
		kwd.cachedFiles.removeAll();
		// save and restore mode, because it will be cleared as well bei localStorage.clear() 
		var tempmode = kwd.updateMode();
		window.localStorage.clear();
		kwd.updateMode(tempmode);
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
		if (!shareok) alert ("'Teilen' in diesem Kontext nicht möglich");
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
	// initial set
	setDataInfo();
	
	if(kwd_debug==false) {
			$('#debug-switch').css( {'display':'none'});			
	}
	kwd.init(); // for preloading text data		
	
	// SHOW
	
	if (kwd.isDevice) {
		// TODO: vielleicht sogar erst nach erstem 'pageonshow' event
		// TODO: oder mit timeout;
        navigator.splashscreen.hide();		
	}
	
	// TESTS
	
	/*v = new PrivateStatic();
	kwd_log(v.static());
	kwd_log(v.static(1));
	kwd_log(v.static());
	kwd_log(v.static(2));
	kwd_log(v.static());
	kwd_log(v.privatemember());
	*/
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
	setDataInfo();
}
function onOffline() {
	$("#online-status").html('OFFLINE');
	//kwd.setOnlineStatus(false);
	setDataInfo();
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
		if (current=="page-tacho") $("#page-title").text("Tachometer");	
	}
	if(current!="page-tacho") {
		onTachoHide();
	}
});
