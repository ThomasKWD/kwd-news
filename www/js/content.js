/*
Funktionen fuer OOP version der Datenstruktur für 
alle Content-Daten

die ursprüngliche Datenstruktur in localStorage
wird 3teilig belassen, so dass kompatibel mit den
bestehenden Funktionen

- uses KwdIterator
- specialized class for "CachedFileContent" planned
- display with callback, so waiting for update is no problem

* TODO: warum wird placeholder nicht von anfang an angezeigt bei Images in einzel-Projektseite??? (zum Test mal anderes Bild!)
* TODO: Problem: callback/eval code nicht eindeutig: Wenn download großes Bild länger dauert und der Benutzer weiter blättert,
*		wird u.U. altes Projektbild in anderem Projekt gezeigt, da nur Indizes und keine eindeutigen ids bei getItem vergeben wurden. 
* TODO: Liste wird nicht gleich gezeigt, wenn download nötig war? (Callback-Problem, gilt auch für Files) 
* 
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
	var onloadcode = '';
	var globalplaceholderfile = 'spacer.gif';
	var onloadcontentfunction;
	
	var that = this;
	
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
	 * WARNING!: this is the user set update mode --> don't use it to determin whether connection is available
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
	
	this.placeHolderFile = function(newfile) {
		if(newfile) globalplaceholderfile = newfile;
		return globalplaceholderfile;
	};
	
	/* calls callback function to display content
	 * 
	 */
	this.display = function() {
		// call display function!;
		if(onloadcontentfunction) {
			if(typeof onloadcontentfunction !== 'function') logthis("javascript says is no function");
			onloadcontentfunction.call();
		}
		else logthis("no callback set in display()");
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

	/* store data of AJAX download
	 * - invokes display as well
	 * - should work if localStorage does not work
	 */
	this.response = function(response) {
	
		if(response) {
		
			var strdata = JSON.stringify(response); 
			localStorage.setItem(storageKey, strdata);
			
			// use that in callback
			that.display(); // update also invokes the display callback code
		}

	};
	
	/* gets data from http source via Ajax
	- returns true on download
	- need response callback function
	- and error callback function
	- start download even if updateMode = offline (due to user invoked download)
	*/
	this.download = function() {
		
		if(this.checkConnection()) { // this prevents waiting when offline
		
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
		    	//logthis("download -"+storageKey+"- timeout (Kein Internet oder falsche id)");
				//$('#load-result').html("");
				//$('#load-result').append("update error");
			}).complete(function(){
				//console.log('update fertig');
				//$('#load-result').html('fertig');
		    	//logthis("download "+storageKey+" complete.");
		    	
			}).success(this.response);
		} // this.checkConnection
		else kwd_log("no download due to OFFLINE");
	};
	
	/* gets data from local storage
	 * - can invoked manually
	 * - sets data to null on error
	 * returns true on success, false on error
	 * TODO: in aktueller Fassung doch ein *wait* bei Download erforderlich!!!
	 */
	this.readStorage = function() {

		strread = localStorage.getItem(storageKey);
		if (!strread) {
			logthis('keine Projekte in Cache');
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

	/* sets the code to be executed when loading file is finished
	 * e.g.: kwd.projects.setOnLoadCode('$("#projectlist###id###").attr("src",###uri###);');
	 */
	this.onLoadCode = function(mycode) {
		if(mycode) onloadcode = mycode;
		return onloadcode;
	};

	
	/* produces urls for the files depending on 
		source location ( possible local cached files)
		- function assumes that only 0 or 1 thumbsrc can exist
		- if thumbsrc does not exist or is empty, the global placeholder file url will be used
		  (because the caller may use ['thumb'] and did not check if he has a thumb ) 
	*/
	this.setThumbSources = function () {
		if (data!=null) {
			var i;
			for (i=0;i<data.length;i++) {
				// preset with default:
				data[i]['thumb']= this.placeHolderFile();

				if(data[i]['thumbsrc']) {
					// parse the code for callback and give it to the files object
					var c = this.onLoadCode();
					if(c) { // not empty?
						c = c.replace('###id###',i);
						// the other placeholder is not parsed here!
					}
					else logthis("no code for thumb in id:"+i);
					// getCached may return an empty string because the file-download is started and still in progress!
					// ...although the file will eventually be cached
					var s = files.getCached(data[i]['thumbsrc'],c); // returns '' when caching
					if(s) data[i]['thumb'] = s; // double secure
				}
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
			var c = this.onLoadCode();
			if(c) { // not empty?
				c = c.replace('###id###',i);
				// the other placeholder is not parsed here!
			}
			// only if string
			if(images[i]) {
				images[i] = files.getCached('files/'+images[i],c); // adds 'files/', TODO: should be provided by web data
			}
			// else set default
			else {
				images[i] = this.placeHolderFile();
			}
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
		
		TODO: make callback system like for list
	*/
	this.getItem = function(code,id,key) {
		
		this.onLoadCode(code);
		
		var i = current;
		
		if (id != undefined) {
			i = id;
		}
		else {
			logthis("current in getItem:"+current);
			// wenn current aber -1, null zurück!!
			if(current == -1) return null;
		}				
		
		if(!this.readStorage()) logthis("no localStorage in getItem"); // WARNING!: only works because getList has started at least once before
		
		
		// even if nothing in localstorage, data can be set and usable
		if(data && data.length && data[i]) {
			
			this.setImageSources(i);
	
			if(key) return data[i][key];
			else return data[i];
		}
		
		return null;
	};

	// update on construct just is easier
	// Problem: App waits on statup in case no internet connection
	// TODO: check connection status and call method from kwd object
	// TODO: in tatsächlicher App bisher (fast) niemals ausgeführt, da event 'deviceready'
	// 	viel später triggert und bis dahin connection==OFFLINE gefunden wird.
	this.init = function() {
		//this.download();
		//logthis("no init in 'projects'");
	};
	
	/* updates the content from localStorage or remote if needed and executes callback set by this.load()
	 * 
	 */
	this.update = function() {
		if(this.readStorage()) {
			this.display();
		}
		else {
			if (this.updateMode()!='offline') this.download();
		}
	};
	
	/* saves callback to be run when projects available or timeout
	 * WARNING!: does NOT correspond to onlinecode
	 */
	this.load = function(funcvalue) {
		onloadcontentfunction = funcvalue;
		this.update();
	};
	
	/*
	 * returns a new Iterator object
	 * - completes paths to file ressources if possible
	 * - this normally does not load or download any data
	 * - if 'data' is (still) == null here, it means loading has failed
	 * - key here is a selector e.g. all images bei "imagesrc" or all titles by "name" -- doesn't correspond to storageKey!!
	 * TODO: no code, perform function!
	 * 	 */
	this.getList = function(code,key) {
		
		this.onLoadCode(code);  // TODO: better store this code in the structure of 'data'
		
		if (data!=null) {
			this.setThumbSources(); // caching mechanism will be started by this
			var test = new KwdIterator(data,key);
			//logthis("iterator: "+test);
			return test;
		}
		else {
			logthis("no data for "+storageKey);
			return null;
		}
	};


	// construct code
	// (download or update is not done by construct)
	
	if(params.remote) remoteBase = params.remote;
	if(params.key) storageKey = params.key;
	if(params.mode) this.updateMode(params.mode); // TODO: where this var is used??
	if(params.id) sourceId = params.id;
	if(params.device) device = params.device;
	if(params.files) files = params.files;
	if(params.placeholder) this.placeHolderFile(params.placeholder);	
}

