/*
Funktionen fuer OOP version der Datenstruktur für 
alle Content-Daten

die ursprüngliche Datenstruktur in localStorage
wird 3teilig belassen, so dass kompatibel mit den
bestehenden Funktionen

- uses KwdIterator
- specialized class for "CachedFileContent" planned
- update-Versuch bei Construct (einfacher als auf Anzeige der Komponenten zu warten)


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
	var storageKey = "";
	var sourceId = 0; // redaxo article_id for data
	var updatemode = "auto";  //auto|online|offline
	var current = -1;   // current selected item value (index|id)
	var device = 'browser';       // get info from my container, browser|phonegap|droidscript
	var files;  // object -- what if object ist not initialized properly??
	
	// construct code at the end of declaration!

	

  	// for compatibility "private method"
  	function logthis(element) {
  		kwd_log(element);
  	};

  	// public methods
  	
  	/* sets and/or returns value of update mode
  	 * values: auto|offline|online
  	 * - this function works different to the equivalent in 'CachedFiles'
  	 * - the value of parameter 'mode' is not checked since this is done by the caller (I hope so) 
  	 */
  	this.updateMode = function(mode) {
  		
  		// TODO: what happens when mode==undefined??
  		if(mode) {
  			updatemode = mode;
  		}
  		
  		return updatemode;
  	};
  	
	this.getElementByIndex = function(index) {
		return "test element";
	};
	
	/*
	 * returns URL from id
	 * - result depends on the base path set
	 * - TODO: special code for mages
	 */
	this.getUrlFromId = function(id) {	
		return remoteBase + 'index.php?article_id='+id;
	};
	
	/* returns whether internet connection is probably existing
	 * - only inside phonegap there can be returned 'false' since connection plugin is used
	 * - TODO: add special code for DroidScript
	 */
	this.checkConnection  = function() {
		if(device != 'phonegap') return true; // status quo
		else {
			if(navigator.connection && navigator.connection.type) {
				if (navigator.connection.type == Connection.NONE) return false;
				else return true;	// TODO: check what Connection.UNKNOWN means!! 
			}			
		}
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
		
		if(this.updateMode()!='offline' && this.checkConnection()) { // this prevents waiting when offline
		
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
		    	kwd_log("download -"+storageKey+"- ready");
			}).success(this.r8esponse);
		} // this.checkConnection
		else kwd_log("no download due to OFFLINE");
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
	this.setThumbSources = function () {
		// TODO: add control for selecting source + check if online offline
		// TODO: how to check whether an index name exists.
		if (data!=null) {
			try {
				var i;
				for (i=0;i<data.length;i++) {
					if(data[i]['thumbsrc']) {
						data[i]['thumb']= files.getCached(data[i]['thumbsrc']);
					}
				}
			}
			catch(e) {
				kwd_log('error in this.setFileSources');
			}
		}
	};
	
	/* sets the current item for output
		- can be index or id
		- value -1 means no selection
		- useful for access with getItem
	*/
	this.setCurrent = function(id) {
		current = id;
	};
	
	/* generates image data depending on current caching status for one element of data
	 * - adds field 'images' to data (or replaces field)
	 * 
	 */
	this.setImageSources = function(id) {
		
		// explode and list images:
		var images = new Array();
		
		if (data[id]['imgsrc'].indexOf(',')!=-1) {
			images = data[id]['imgsrc'].split(',');
		}
		else images[0] = data[id]['imgsrc'];
		
		var i;
		for(i=0;i<images.length;i++) {
			// TODO: change code dependend on caching
			images[i] = files.getCached('files/'+images[i]); // adds 'files/', TODO: should be provided by web data
		}
		
		data[id]['images'] = images; // copy array
		
		kwd_log("created images");
		kwd_log(data);
	};
	 
	/* returns a certain entry from data
		- id is just the index up to now
		- if id not given, use var 'current'
		- key selects a certain part of the item
		- prepares image urls for output (generate sub array 'images') depending on caching status
	*/
	this.getItem = function(id,key) {
		
		var i = current;
		
		if (id != undefined) {
			i = id;
		}
		else {
			logthis("current in getItem:"+current);
			// wenn current aber -1, null zurück!!
			if(current == -1) return null;
		}				
		
		if(data && data.length && data[i]) {
			
			this.setImageSources(i);

			if(key) return data[i][key];
			else return data[i];
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
		
		this.setThumbSources(); // caching mechanism will be started by this
		
		if (data!=null) {
			var test = new KwdIterator(data,key);
			//logthis("iterator: "+test);
			return test;
		}
		else return null;
	};

	// construct code
	
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(typeof params.key != undefined) storageKey = params.key;
	if(typeof params.mode != undefined) this.updateMode(params.mode); // TODO: where this var is used??
	if(typeof params.id != undefined) sourceId = params.id;
	if(typeof params.isDevice != undefined) device = params.device;
	if(typeof params.files != undefined) files = params.files;
	
	// update on construct just is easier
	// Problem: App waits on statup in case no internet connection
	// TODO: check connection status and call method from kwd object
	this.download();
}

/*
    Object
    Liste(n) für heruntergeladene oder noch zu ladende Dateien

	- unabhängig von KwdCachedContent, da einfach Liste für alle files
	- erzeugt, prüft und/oder speichert auch den aktuellen lokalen Pfad (localBase)
	- files in 'list' werden mit ganzem Pfad gespeichert, der separat gespeicherte Pfad ist für neu hinzugefügte, der 'name' wird aber ohne Pfad gespeichert
	- list['local'] enthält Namen mit Pfad aus 'remoteBase', falls Caching nicht möglich
	- TODO: falls Caching möglich aber ausgeschaltet, --> welcher Pfad wird gespeichert, --> was passiert beim Einschalten
	- 'mode': offline(=only files already saved)|online(=files only directly from web)|auto(=first save file id needed, then display from local)
	- TODO: bei Zwangs-Löschen des Cache sollte auch der Pfad neu *erzeugt* werden
	- TODO: auch im 'browser'-Modus alle Cache-Funktionen aktiv, nur das speichern selbst wird nicht ausgeführt
*/
function CachedFiles(params) {
	
	// private members
	var localBase = '';
	var remoteBase = '';
	var storagePath = '';
	var storageFiles = '';
	var updatemode = "auto";  //auto|online|offline
	var device = 'browser';       // get info from my container, browser|phonegap|droidscript
	var list = new Array();   // sub-elements: 'name' + 'local'

	function logthis(element) {
		kwd_log(element);
	}

  	/* sets and/or returns value of update mode
  	 * values: auto|offline|online
  	 * - WARNING!: updatemode is always reset to 'online' in curtain environments
  	 * - the value of parameter 'mode' is not checked since this is done by the caller (I hope so) 
  	 */
  	this.updateMode = function(mode) {
  		
		// decide according to device
		//if (device=='browser') updatemode = 'online'; // this code can be changed for testing!
		{
	  		// TODO: what happens when mode==undefined??
	  		if(mode) updatemode = mode;
  		}
  		
  		return updatemode;
  	};
  	

	
	/* returns current save path
	 * - should also be used by methods of this object
	 * - tries to create path if not saved
	 */
	this.getLocalBase = function() {
		
		if (this.updateMode()!='online') {
			if(localBase=='') {
				var p = localStorage.getItem(storagePath);
				if(p) {					
					if(p.lastIndexOf('/') != path.length-1) p += '/';
					localBase = p; 
					return localBase;		
				}
				else {
					// generate Path!!
					return localBase;
				}
				
			}			
		}
		return remoteBase;
	};
	
	/* returns ready to use local filepath
	 * - the given 'filename' may be converted to make a valid filename
	 */
	this.getLocalPath = function(filename) {
		
		return remoteBase + filename;	
	};
	
	/* stores the files list (e.g. in localStorage)
	 * 
	 */
	this.saveFileList = function() {
		
		var strwrite = JSON.stringify(list);
		if (strwrite) localStorage.setItem(kwd_storage_files,strwrite);
		logthis("files:"+strwrite);
	};
	
	/* adds a new file to the list
	 * - list will be saved after adding
	 * - filename can also contain a script uri
	 * - local name will be generated
	 */
	this.add = function (filename) {
		
	};
	
	/* removes file from the list
	 * - list will be saved after removing
	 * 
	 */
	this.remove = function(filename) {
		
	};
	
	/* deletes all files from the filesystem, then removes the list itself
	*/
	this.removeAll = function() {
		
	};
	
	/* get a file uri for display
	 * - manages the list internally
	 * - the user needs this method only (most cases)
	 * - 'name': file without path, can also be a script or another complicated string
	 * - TODO: check what happens when complicated string occurs!
	 */
	this.getCached = function(name) {
		
		// try to load (assumes that filelist already loaded when not empty)
		if (list.length<1) {
			var strread = localStorage.getItem(kwd_storage_files);
			if(strread) {
				logthis("got files");
				logthis(strread);
				list = JSON.parse(strread);
				logthis(list);
			}
		}
		
		// find name in list
		var i,j;
		var entry = '';
		for (i=0,j=list.length;i<j;i++) {
			if (list[i]['name']==name) {
				entry = list[i]['local'];
				break;
			}
		}
		
		// nicht in Liste, dann hinzufügen
		if(entry=='') {
			logthis("schon wieder neues Element");
			var a = new Object();
			a['name'] = name;
			// TODO: local name must be converted before use
			a['local'] = this.getLocalPath(name);
			//logthis(a); // is array??? // geht angeblich nicht  
			list.push(a);
			this.saveFileList();
			entry = a['local']; 
		}
		
		if(this.updateMode()=='online') {
			return remoteBase + name;
		}
		else return entry;
	};
	
	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(remoteBase.lastIndexOf('/') != remoteBase.length-1) remoteBase += '/';
	if(typeof params.key != undefined) storageFiles = params.key;
	if(typeof params.key != undefined) storagePath = params.path;
	if(typeof params.mode != undefined) this.updateMode(params.mode); 
	if(typeof params.isDevice != undefined) device = params.device;
}