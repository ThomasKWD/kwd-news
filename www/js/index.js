/*
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
 */

/* ich nehme an, dass das Verwenden der Klasse app dazu dient,
 * diesen Code zu ignorieren, falls er im Browser gestartet wird.
 * 
 * interessante Struktur aber unnötig für diesen einfachen Fall
 * zumal lieber der Listener in document ready einfgefügt wird. 
 */
/*
 var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
        kwd_log('app:added listener');
    },
    deviceready: function() {
        // This is an event handler function, which means the scope is the event.
        // So, we must explicitly called `app.report()` instead of `this.report()`.
        app.report('deviceready');
        kwd_log('Verdammt. Ich bin drin!');
        navigator.splashscreen.hide();
 		onDeviceReady();        
    },
    report: function(id) {
        // Report the event in the console
        kwd_log("Report: " + id);

        // Toggle the state from "pending" to "complete" for the reported ID.
        // Accomplished by adding .hide to the pending element and removing
        // .hide from the complete element.
        //document.querySelector('#' + id + ' .pending').className += ' hide';
        //var completeElem = document.querySelector('#' + id + ' .complete');
        //completeElem.className = completeElem.className.split('hide').join('');
    }
};
*/
// Globale Datenstrukturen für Inhalte ---------------------------------------
var kwd_projects = null;
var kwd_news = null;



/*
 * TODO: isDevice als Parameter?
 */
$(document).ready(function() {
	
	kwd_debugscreen=true;// mache doch einen Schalter :-)
	
	kwd_log ('KWD: document ready.');
    // are we running in native app or in a browser?
    // das device-Objekt hier nicht nehmen, da evtl. noch nicht aktiv!
    window.isDevice = false; 
    
    if(document.URL.indexOf("http://") == -1 
        && document.URL.indexOf("https://") == -1
        && document.URL.indexOf("/kwd-news/") == -1)
 {
        window.isDevice = true;
    }

    if( window.isDevice ) {
    	kwd_log('Wird als Device erkannt.');
        document.addEventListener("deviceready", onDeviceReady, false); 
        kwd_log('app:added listener');
    } else {
    	kwd_log('Wird als Browser erkannt');
        onDeviceReady();
    }
});


function onDeviceReady() {

 	kwd_debugscreen=true;// mache doch einen Schalter :-)

    kwd_log('onDeviceReady');
    //kwd_log (document.URL);
    
    // STARTUP und SYSTEM INFO ---------------------------------------------------------------    

	if(window.isDevice) {
		$('#info-platform').html(device.platform);
		$('#info-os').html(device.version);		
	}

	if (navigator.connection && navigator.connection.type) {
		$('#online-status').html(navigator.connection.type);
	}

	
	
    // EVENT LISTENER ------------------------------------------------------------
    
	// geht nicht auf ios (muss ich es extra abfragen oder wird es dort automatisch ignoriert??
	if (window.isDevice) {
				
		document.addEventListener("menubutton", onMenuButtonTouch, false);
		document.addEventListener("backbutton", onBackButtonTouch, false);
	 	// TODO: läuft noch nicht!!
	 	document.addEventListener("online", onOnline, false);	
	 	document.addEventListener("offline", onOffline, false);	
	}
	
	
	// CLICK HANDLER -------------------------------------------------------------
	
	// TODO: ist touch function besser??
	
	$('#headbackbutton').click(function(){
		performBackAction();
	});	
	$('#doUpdate').click(function(){
		read_kwd_projects();        		
	});
	$('#doSave').click(function(){
		//saveProjects();
		downloadFile();
	});
	$('#doTest2').click(function(){
		location.href='http://www.kuehne-webdienste.de/?viewmode=app';           				
	});
	$('#doTest3').click(function(){
		kwd_log('clicked test3');
		$('#device-info').load('page1.html');
				           				
	});
	$('#data-rel-forward').click(function(){
		window.history.go(1); // try to go forward history				           				
	});
	$('#doShowProjects').click(function() {
		kwd_projects2list();		           						
	});
	$('.aproject').click(function() {
		alert('project');
		kwd_log('project');
	});

	// schreibe Funktion, die dies für alle Links automatisiert!
	//navigator.app.loadUrl('http://www.google.com', { openExternal:true } );
	
	// UPDATE CONTENT-----------------------------------------------------------


	read_kwd_projects();//TODO: allgemeine Funktion mit Parameter
		
	// show
	
	if (window.isDevice) {
		// TODO: vielleicht sogar erst nach erstem 'pageonshow' event
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
	if (current=="page-start" && window.isDevice) {
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
 */function onBackButtonTouch() {
 	performBackAction();
	//TODO: abfragen ob Startpage schon da?
}
function onOnline() {
	$("#online-status").html('online');	
}
function onOffline() {
	$("#online-status").html('offline');
}


$(function() {
    $( "[data-role='navbar']" ).navbar();
    $( "[data-role='header'], [data-role='footer']" ).toolbar();
});


// PAGE START/SHOW -------------------------------------------------------------

// nur Defs, die für mehr als eine Seite gelten
// TODO: wie vermeiden hart codierte Seitennamen? (evtl. nur Zähler)
$( document ).on( "pagebeforeshow", "[data-role='page']", function() {
	
	var current = $( this ).attr('id');
	
	var previous;
	// da statisch hier switch (einfacher anscheinend als jquery die Daten zu entlocken)
	switch(current) {
		case 'page-aproject': previous = 'Referenzen'; break;
		case 'page-anews': previous = 'News'; break;		
		case 'page-anoffer': previous = 'Leistungen'; break;		
		default : previous = "Start";
	}
	if (current=="page-start") {
		$("#headbackbutton").css ( { 'display':'none'});
	} 
	else {
		$("#headbackbutton").css ( { 'display':'block'});
		$("#headbackbutton").html (previous);
	}
});
