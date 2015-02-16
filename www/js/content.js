/*
Funktionen fuer OOP version der Datenstruktur für 
alle Content-Daten

die ursprüngliche Datenstruktur in localStorage
wird 3teilig belassen, so dass kompatibel mit den
bestehenden Funktionen

- uses KwdIterator
- specialized class for "CachedFileContent" planned

  * TODO: synch immer nur intern automatisch verwenden (bei Abruf der Daten wird entschieden, ob Internet-Verbindung nötig - Ausnahme: manueller Synch)
  * TODO: wenn localStorage UND Internetverbindung nicht vorhanden, Handling, dass Seite leer angezeigt wird (z.B. einfach leere Liste), außerdem warten auf download

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
	var sourceId = 0; // redaxo article_id for data
	var mode = "auto";  //auto|online|offline
	
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
	 * returns URL from id
	 * - result depends on the base path set
	 */
	this.getUrlFromId = function(id) {	
		return remoteBase + 'index.php?article_id='+id;
	};

	this.response = function(response) {
	
		if(response) {
		
			//kwd_log(response);
			var strdata = JSON.stringify(response); 
			localStorage.setItem(storageKey, strdata);
			kwd_log('stored response locally - '+storageKey);	
		}

	};
	
	/* gets data from http source via Ajax
	- need response callback function
	- and error callback function
	*/
	this.download = function() {
	
		//$('#load-result').html('AKTUALSIEREN');
		//kwd_log('starte aktualisieren');
		
		$(document).ajaxError(function(event, request, settings){
	   		kwd_log("Error requesting page " + settings.url);
	 	});
	 	kwd_log('start download '+storageKey);
	 // Abfrage ob Netzwerk-Kommunikation möglich (phonegap)
		// TODO: Auswertung durch caller ermöglichen (Status weiterleiten, evtl. sogar exception handling)
		
		//networkState = navigator.connection.type;
		//if (networkState == Connection.NONE) return null;
	
		// http://www.interaktionsdesigner.de/2008/08/28/jsonp-und-das-cross-server-scripting/
		// http://remysharp.com/visual-jquery/
		// for phonegap:
		// http://samcroft.co.uk/2012/my-article-for-adobes-appliness-magazine-data-in-phonegap-apps/
	
	    $.ajax({
	      dataType: 'jsonp',
	      jsonp: 'jsonp_callback',
	      url: this.getUrlFromId(sourceId),
	      timeout: 10000
	      
	    }).error(function(){
	    	kwd_log("download -"+souceKey+"- timeout (Kein Internet oder falsche id)");
			//$('#load-result').html("");
			//$('#load-result').append("update error");		
		}).complete(function(){
			//console.log('update fertig');
			//$('#load-result').html('fertig');
	    	kwd_log("download -"+souceKey+"- ready");
		}).success(this.response);
		
	};
	
	/* gets data from local storage
	 * - can invoked manually
	 * - sets data to null on error
	 * returns true on success, false on error
	 */
	this.readStorage = function() {

		strread = localStorage.getItem(storageKey);
		if (!strread) {
			logthis('keine Projekte in Cache');
			this.download();
			return false;
		}
		else {
			//logthis("read "+storageKey+": "+strread);
			data = JSON.parse(strread);
			//kwd_log('Projekte geladen');
			//kwd_log(kwd_projects);
			//kwd_log("Anzahl Projects: "+kwd_projects.length);
			return true;
		}
	};
	
	/* produces urls for the files depending on 
		source location ( possible local cached files) 
		
	*/
	this.setFileSources = function () {
		// TODO: add control for selecting source
		// TODO: how to check whether an index name exists.
		if (data!=null) {
			try {
				var i;
				for (i=0;i<data.length;i++) {
					if(data[i]['thumbsrc']) {
						data[i]['thumb']= remoteBase + data[i]['thumbsrc'];
					}
				}
			}
			catch(e) {
				kwd_log('error in this.setFileSources');
			}
		}
	};
	
	/* returns a certain entry from data
		- id is just the index up to now
		- key selects a certain part of the item
	*/
	this.getItem = function(id,key) {
		if(data && data.length && data[id]) {
			if(key) return data[id][key];
			else return data[id];
		}
		else return null;
	};
	
	/*
	 * returns a new Iterator object
	 * - completes paths to file ressources if possible
	 * - before it retrieves the data, since this must be done by AJAX calls, the function must provide a wait algorithm or return empty list if no data
	 * - key here is a selector e.g. all images bei "imagesrc" or all titles by "name" -- doesn't correspond to storageKey!!
	 * 	 */
	this.getList = function(key) {
		//logthis("my storagekey:"+storageKey);
		//kwd_readProjects();	
		//logthis(kwd_projects);
		//console.log(kwd_projects);
		if (!this.readStorage()) logthis("cannot read local data -"+storageKey) ;
		else {
			// logthis("readstorage ok: "+data);
		}
		
		this.setFileSources();
		
		if (data!=null) {
			var test = new KwdIterator(data,key);
			//logthis("iterator: "+test);
			return test;
		}
		else return null;
	};

	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(typeof params.local != undefined) localBase = params.local;
	if(typeof params.key != undefined) storageKey = params.key;
	if(typeof params.mode != undefined) mode = params.key;
	if(typeof params.id != undefined) sourceId = params.id;
	
	//kwd_log("storageKey: "+storageKey);
	
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
