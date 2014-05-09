/**
 * @author KWD
 * 
 * Dieses Script kapselt alle Debug Ausgaben und weiteren Funktionen, damit sie umgeleitet oder deaktiviert werden können.
 * Es ist kein Objekt sondern nur eine Sammlung von Funktionen (Klasse geplant!)

"""###
Test test
 */

// Globaler Schalter
// wenn true Test Ausgaben in html
// abhängig von jquery
var kwd_debugscreen=false;

function kwd_log(object) {
	console.log(object);
	if (kwd_debugscreen) {
		$('#p-debug').append(object);
		$('#p-debug').append('<br/>');
	}
}