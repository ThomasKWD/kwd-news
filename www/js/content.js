/*
Funktionen fuer OOP version der Datenstruktur für 
alle Content-Daten

die ursprüngliche Datenstruktur in localStorage
wird 3teilig belassen, so dass kompatibel mit den
bestehenden Funktionen

- uses KwdIterator
*/


/*
    Object
    enthält und verwaltet Daten von 
    kwd_projects, kwd_news, kwd_offers
    
    - the caller doesn't need to know if data is from localStorage or file or Web URI 
    - must decide whether or how often cache must be updated
*/    
/*class*/function CachedWebContent(params) {

	// private properties
	var data = null;
	var files = null;
	var remoteBase = "";
	var localBase = "";
	var storageKey = "";
	
	// construct code at the end of declaration!

  	// public methods
	

  	// for compatibility "private method"
  	function logthis(element) {
  		kwd_log(element);
  	};

	this.getElementByIndex = function(index) {
		return "test element";
	};
	
	/*
	 * returns a new Iterator object
	 * - completes paths to file ressources if possible
	 */
	this.getList = function(key) {
		if (!key) logthis("getList without key");
		kwd_readProjects();		
		return new KwdIterator(kwd_projects);
	};

	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(typeof params.local != undefined) localBase = params.local;
	if(typeof params.key != undefined) storageKey = params.key;
}

/*
    Object
    Liste(n) für heruntergeladene oder noch zu ladende Dateien

	Plane es mit WebContent zusammen zu werfen, allerdings wäre es sinnvoll eine unabhängige Dateiliste
	mit Status-Infos zu haben.
	
	PLANNED:
	- this could be a "class" derived from CachedWebcontent
*/
function CachedFiles() {

	
}