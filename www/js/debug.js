/**
 * @author KWD
 * 
 * Dieses Script kapselt alle Debug Ausgaben und weiteren Funktionen, damit sie umgeleitet oder deaktiviert werden können.
 * Es ist kein Objekt sondern nur eine Sammlung von Funktionen (Klasse geplant!)
 * 
 * Außerdem wird die Unterscheidung zwischen Browser-Ansicht und App-Ansicht verwaltet. (siehe auch onDeviceReady )
 * TODO: html mit css debug/develope durch js aus/einblenden

*/

// Globale Schalter
var kwd_debug=true;
// wenn true Test Ausgaben in html
// abhängig von jquery
var kwd_debugscreen=false;
// zählt zum Einschalten von kwd_debug um debug modus Einschalter zu verstecken 
var kwd_debug_counter = 0;

function kwd_log(object) {
	if (kwd_debug) {
	
		console.log(object); // must not be used in DroidScript
		if (kwd_debugscreen) {
			$('#p-debug').append(object);
			$('#p-debug').append('<br/>');
		}
	}
}

