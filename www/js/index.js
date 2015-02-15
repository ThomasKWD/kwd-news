/*
alle Deviceready Funktionen
und Event Handler

für Code-Fragmente aus dem Phonegap-Example gilt:

 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.

		***
 */

/* ich nehme an, dass das Verwenden der Klasse app dazu dient,
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
		
	kwd = new KwdApp(); // wird hier schon gebraucht

    if( kwd.isDevice ) {
    	kwd_log('Wird als Device erkannt.');
        document.addEventListener("deviceready", onDeviceReady, false); 
        kwd_log('app:added listener');
    } else {
    	kwd_log('Achtung!: im BROWSER-Modus zur Zeit alle Daten-Requests an *localhost*');
    	// TODO: localhost sollte nicht verwendet werden, wenn isDroidscript 
        onDeviceReady();
    }
});


function onDeviceReady() {

 	kwd_debugscreen=true;// mache doch einen Schalter :-)
 	if (!kwd_debug) {
 		$('.debug').css( {'display':'none'});
 		$('.develope').css( {'display':'none'});
 	}
    kwd_log('onDeviceReady');
    if(window.isDroidscript==true) {
    	kwd_log("isDroidScript enabled.");
    }
    //kwd_log (document.URL);
    
    // STARTUP und SYSTEM INFO ---------------------------------------------------------------    

	if(kwd.isDevice) {
		$('#info-platform').html(device.platform);
		$('#info-os').html(device.version);		
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
		//TODO: alle Updates hier!
		kwd_DownloadProjects();
		kwd_DownloadNews();
		kwd_DownloadOffers();        		
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
	$('#data-rel-forward').click(function(){
		window.history.go(1); // try to go forward history				           				
	});
	$('.aproject').click(function() {
		alert('project');
		kwd_log('project');
	});
	$('#flip-6').change(function() {
		//alert("update ="+$(this).val());
		if($(this).val()=='off') {
			kwd_update=false;
			$('#options-info').html("Bei Aktualisieren \"Nie\" ist diese App komplett offline. Es können nur bereits gespeicherte Inhalte angezeigt werden.");
			$('#box-options-info').css( {'display':'block'});
		}
		else {
			kwd_update=true;
			$('#options-info').html("Bei Aktualisieren \"Auto\" werden Inhalte im Hintergrund aktualisiert.");
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
		// test debug adjust - Code to change state of switch:		
		// $("select#flip-debug").val ("off");
		// $("select#flip-debug").flipswitch("refresh"); // na endlich		
	});
	// TODO: wie besser die Klick-handler dort deklarieren, wo sie gebraucht werden (Seite)
	//    oder zusammenfassen als function?
	$('#project-share').click(function() {
		// kwd_current_project muss gesetzt sein
		//alert ('project:'+kwd_current_project);
		// welche Parameter angenommen werden, hängt von der Ziel-App zum Teilen ab
		// zum Test nur URL auf die Seite im Web
		//    diese wird aus der article-url gewonnen
		if (kwd_projects) {
			if (kwd_current_project > -1) {
				//var u = kwd_projects[kwd_current_project]['article_id'];
				// wenn kwd_projects oder article_id fehlerhaft ist Hauptteil der Adresse immer noch gültig :-)
				var u = 'http://www.kuehne-webdienste.de/index.php?article_id='+kwd_projects[kwd_current_project]['article_id'];
				//alert (u);
				var name = kwd_projects[kwd_current_project]['name'];
				if (!name) name= '';
				window.plugins.socialsharing.share("Schauen Sie sich diese interessante Seite an!", "KÜHNE-Webdienste.de "+name, null,u);
			}
		}
	}); 
	$('#news-share').click(function() {
		if (kwd_news) {
			if (kwd_current_news > -1) {
				//TODO: prüfen ob url gesetzt, nur wenn nicht dann id nehmen (dies am besten in function, da min. 4 mal gebraucht)
				var u = 'http://www.kuehne-webdienste.de/index.php?article_id='+kwd_news[kwd_current_news]['article_id'];
				var name = kwd_news[kwd_current_news]['name'];
				if (!name) name= '';
				window.plugins.socialsharing.share("Schauen Sie sich diese interessante Seite an!", "KÜHNE-Webdienste.de "+name, null,u);
			}
		}		
	});

	// Intervall-Modus voreinstellen
	window.gpsinterval=true;
	onTachoInit(); // ist auch klick handler // TODO: könnte man erst beim ersten Aufruf des Tacho setzen 
	// schreibe Funktion, die dies für alle Links automatisiert!
	//navigator.app.loadUrl('http://www.google.com', { openExternal:true } );
	
	// UPDATE CONTENT-----------------------------------------------------------

	appRootPath = kwd_getFilePath(); // Pfad in local storage?, nein= leerstring // eigentlich benötigt man Variable nicht oder nur lokal, wenn sowieso immer auf localStorage gearbeitet wird! 
	kwd_DownloadProjects();//TODO: allgemeine Funktion mit Parameter
	kwd_DownloadNews();
	kwd_DownloadOffers();
		
	// TEST OOP 
	//it = app.getSourceList('thumbsrc');
	//kwd_log('check key:'+it.getKey());
	//while(it.hasNext()) {
		//kwd_log('next entry: '+it.next());
	//}
	
	// SHOW
	
	if (app.isDevice) {
		// TODO: vielleicht sogar erst nach erstem 'pageonshow' event
		// TODO: oder mit timeout;
        navigator.splashscreen.hide();		
	} 
}


// NAVIGATION OVERRIDE WINDOW.HISTORY ----------------------------------------

/*
 * in diesem Projekt ist Struktur unveränderlich, deshalb statische Seitensteuerung...
 * 
 */
function performBackAction() {

	var current = $( ":mobile-pagecontainer" ).pagecontainer('getActivePage').attr('id');
	
	// TODO: is platform name consistent??? lieber teilstring suchen
	if (current=="page-start" && app.isDevice) {
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
}
function onOffline() {
	$("#online-status").html('OFFLINE');
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
