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
    - the new instance should try to obtain data on construction.
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
	
	/* gets data from local storage
	 * - can invoked manually
	 * - sets data to null on error
	 * returns true on success, false on error
	 */
	this.readStorage = function() {

		strread = localStorage.getItem(storageKey);
		if (strread==null) {
			kwd_log('keine Projekte in Cache');
			return false;
		}
		else {
			data = JSON.parse(strread);
			//kwd_log('Projekte geladen');
			//kwd_log(kwd_projects);
			//kwd_log("Anzahl Projects: "+kwd_projects.length);
			return true;
		}
	};
	
	/*
	 * returns a new Iterator object
	 * - completes paths to file ressources if possible
	 * - before it retrieves the data, since this must be done by AJAX calls, the function must provide a wait algorithm or return empty list if no data
	 * - key here is a selector e.g. all images bei "imagesrc" or all titles by "name" -- doesn't correspond to storageKey!!
	 * 	 */
	this.getList = function(key) {
		logthis("my storagekey:"+storageKey);
		//kwd_readProjects();	
		//logthis(kwd_projects);
		//console.log(kwd_projects);
		var test = new KwdIterator(data,key);
		//kwd_log(test);
		return test;
	};

	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(typeof params.local != undefined) localBase = params.local;
	if(typeof params.key != undefined) storageKey = params.key;
	kwd_log("storageKey: "+storageKey);
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