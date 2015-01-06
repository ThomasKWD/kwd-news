/*
Funktionen fuer OOP version der Datenstruktur für 
alle Content-Daten

die ursprüngliche Datenstruktur in localStorage
wird 3teilig belassen, so dass kompatibel mit den
bestehenden Funktionen

Bekannte Probleme:
Nicht (in allen Browsern) vorhandene aktuelle
Implementierung der Iteratoren.
Deshalb eigener Iterator Prototype


*/


/*
    Object
    enthält und verwaltet Daten von 
    kwd_projects, kwd_news, kwd_offers
*/    
/*class*/function CachedWebContent() {

	// private properties
	var data = null;
	var files = null;
	
  	// public methods
  	
}

/*
    Object
    Liste(n) für heruntergeladene oder noch zu ladende Dateien

	Plane es mit WebContent zusammen zu werfen, allerdings wäre es sinnvoll eine unabhängige Dateiliste
	mit Status-Infos zu haben.
*/
function CachedFiles() {

	
}