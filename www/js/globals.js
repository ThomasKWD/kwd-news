/*
 * 
 globales Objekt
 app = null;
 Globale Datenstrukturen für App-Steuerung und Verwaltung
 
 - content data are objects *contained* by this global object
 - init function is for splitting constuction-time and init-time (due to content data sturctures vs. slow "ondeviceready") 
*/


// TODO alle löschen wenn objects laufen:
var kwd_projects = null;
var kwd_news = null;
var kwd_offers = null;
var kwd_files = '';
var kwd_thumbs = '';

/*
 * Konstanten für local-storage
 * der Einfachheit halber global
 */
const kwd_storage_projects = 'projects';   // JSON-String der Projektdaten
const kwd_storage_news = 'news';           // JSON-String der Newsdaten
const kwd_storage_offers = 'offers';       // JSON-String der Angebotsdaten
const kwd_storage_path = 'path';           // Pfad auf Device für Dateien -- wird noch gebraucht?????????
const kwd_storage_files = 'files';         // Liste der Dateien // TODO: auch als JSON?(dann mit Status-Infos)
/*	siehe unter kwd_storage_files parallel für thumbs
	thumbs werden im filesystem des Device mit prefix "thumb-" gespeichert.
*/
const kwd_storage_thumbs = 'thumbs';       // Liste alternativer Dateien (Vorschaubilder) -- TODO: als veraltet betrachten
const kwd_storage_update = 'update';

/*
 * globale Schalter
 * 
 */
kwd_update=true;

/*
"kwd Object", das globale Strukturen
kapselt

 sogar debug, obwohl dies eigenständiges Object sein
 sollte

geplant:
- alle path-relevanten Dinge (localBase) nur noch innerhalb KwdCachedFiles
- Basis-Objekt mit abgeleiteten Spezialversionen für Phonegap | Droidscript
- layout independent so that it can be used eg.in DroidScript without webview
- auto update bei construct der Daten-Komponenten

*/
function KwdApp()	 {

	// private members:
	
	var remoteBase = "";
	var myplaceholder = 'res/kwd-4-placeholder-gradient.png'; // TODO: weißes Bild mit kleinem "k" in der Mitte
	
	// wird gespeichert (auch in localStorage) und an enthaltene Objekte weitergegeben:
	var updatemode = 'auto'; 

	// public properties
	this.isDevice = false;
	this.isDroidscript = false;
	
  	// for compatibility
  	// "private method"
  	function logthis(element) {
  		kwd_log(element);
  	};

	// public methods
	
	/* sets and/or gets the current update mode
	 * - saves mode, if new is given ('mode')
	 * - loads mode for return value
	 * - (typical "setter-getter-combi-method" :-)
	 * - 'mode': auto|online|offline
	 * WARNING!: this is the user set update mode --> don't use it to determin whether connection is available
	 */
	this.updateMode = function(mode) {
		if(mode) {
			//throw("KwdApp::updateMode: mode defined");
			if (mode=='auto' || mode=='online' || mode=='offline') {
				try {
					updatemode = mode;
					localStorage.setItem(kwd_storage_update, updatemode);
					// inform member objects:
					this.projects.updateMode(updatemode);
					this.news.updateMode(updatemode);
					this.offers.updateMode(updatemode);
					this.cachedFiles.updateMode(updatemode);
				}
				catch(e) {
					logthis("error setting value in KwdApp::updateMode: "+e.message);
				}
			}
			else logthis("invalid value for updateMode:"+mode);
		}
		else {
			
			var strread = localStorage.getItem(kwd_storage_update);
			if (strread!==null) updatemode = strread;
		}
		
		return updatemode;
	};
	
	/*
	 * datasource: "projects"|"news"|"offers", if empty, you should return data of all the lists
	 */
	this.getSourceList = function(key,datasource) {
		
		// ugly code just for test
		kwd_readProjects();
		if (kwd_readProjects===null) {
			logthis('no test data');
			return null;
		}
		else return new KwdIterator(kwd_projects,key,"split");			
	};
	
	/*
	 * returns base path for data from web 
	 * TODO: must receive the 'imgsrc' names including the "files/" --> change in kwd-redaxo project 
	 */
	this.getSourceBase = function() {
		return remoteBase;
	};
	
	/*
	 * returns the save path for local files of the app
	 * -checks for environment (phonegap|droidscript) 
	 */
	this.getLocalBase = function() {
		
		return localBase;
	};
	
	/*
	 * inits data of members
	 */
	this.init = function() {
		this.projects.init();
		this.news.init();
		this.offers.init();
	};
	
	/*
	 * returns URL from id
	 * - result depends on the base path set
	 */
	this.getUrlFromId = function(id) {	
		return remoteBase + 'index.php?article_id='+id;
	};
	
	


	//construct code
		
    // are we running in native app or in a browser?
    // das device-Objekt hier nicht nehmen, da evtl. noch nicht aktiv!
    // kwd.isDevice = false; preset inside object!
    // DroidScript version 1.18 beta recognized  
    if(document.URL.indexOf("droidscript") != -1 || document.URL.indexOf("Droid") != -1) {
    	this.isDroidscript = true;
    }
    else if(document.URL.indexOf("http://") == -1 
        && document.URL.indexOf("https://") == -1
        && document.URL.indexOf("sgit") == -1
        && document.URL.indexOf("/kwd-news/") == -1 //for local test    
	) {
		this.isDevice = true;
    }

	// set paths if possible
	remoteBase = "http://www.kuehne-webdienste.de/";
	
	if(this.isDevice) {
	}
	else if (this.isDroidscript) {
		// code in download Test
	}
	// only if localhost is there 
	else if (document.URL.indexOf("localhost") != -1) {
		remoteBase = "http://localhost/tk/kwd-redaxo-46/";
		logthis("found http locahost: "+remoteBase);
	}
	
	
	// more public members:
	var dev = 'browser';
	if (this.isDevice) dev = 'phonegap';
	if (this.isDroidscript) dev = 'droidscript';

	// get update mode (if previously saved)
	// gets the updatemode (possibly from localStorage or other external memory),
	// WARNING!: You must not call the function this.updateMode with a parameter value which would lead to access undefined objects!
	// TODO: throw an error on the issue above
	updatemode = this.updateMode();
	
	
	// ein einzelnes File-Objekt:
	// TODO: teste ob alle CachedWebContent dann mit der gleichen Instanz arbeiten!!
	// wenn nicht, muss in CachedWebContent kwd.chachedFiles verwendet werden :-(
	this.cachedFiles = new CachedFiles({
		remote : remoteBase,
		key : kwd_storage_files,
		path : kwd_storage_path,
		mode : updatemode,
		device : dev
	});


	// TODO: da alle diese Parameter auch nochmal für Files gebraucht werden,
	//		Einrichtung eines "KwdInfo"-Objekts?
	this.projects = new CachedWebContent({ // TODO: use set-functions of base paths
		remote : remoteBase,
		key : kwd_storage_projects,
		mode : updatemode,
		id : 10,
		device : dev,
		files : this.cachedFiles,
		placeholder : myplaceholder
	});
	this.news = new CachedWebContent({
		remote : remoteBase,
		key : kwd_storage_news,
		mode : updatemode,
		id : 25,
		device : dev,
		files : this.cachedFiles,
		placeholder : myplaceholder
	});
	this.offers = new CachedWebContent({
		remote : remoteBase,
		key : kwd_storage_offers,
		mode : updatemode,
		id : 45,
		device : dev,
		files : this.cachedFiles,
		placeholder : myplaceholder
	});
}

/*
da nicht ECMA 6 überall vorausgesetzt werden kann,
eigenes Iterator-Konzept.

Zunächst nur für mehrdimensionale Arrays konzipiert.
*/
function KwdIterator(source, key, options) {
	// public properties
	this.length = 0;

	// private properties
	// enthält Schlüsselwort um zu spezifizieren, was aus den Daten gewünscht ist
	//(sozusagen Erwaiterung des Iterator-Konzepts)
	var sourcekey = ""; 
	var data;
	var splitentries = false;
	var i = 0;
	var j = 0; // for split values in data entry
	
	//kwd_log('iterator instance');
	sourcekey = key;
	data = source;
	this.length = source.length;
	
	// split entries?
	if(options && options=="split") {
		splitentries = true;
	}
	
	// public methods
	this.next = function() {
		var entry = new Array();
		var parts;
		var ret;
	 
		// Liefere nächstes Element
		// doppelte Sicherheit i<length?
		if(i<this.length) {
		
			try {
			if (sourcekey!="") entry = data[i][sourcekey];
			else entry = data[i]; // access not possible - code does not work
			//kwd_log("entry:"+entry);
			//kwd_log ("data:"+data[i]);
			if(splitentries && entry.indexOf(',')!=-1) {
				parts=entry.split(',');
				if(j>=parts.length) {
					// you must get a next entry here
					i++;
					if (sourcekey!="") entry = data[i][sourcekey];
					else entry = data[i];					
				}
				else return parts[j++];
			}
			j=0;
			i++;
			//kwd_log(i);
			//kwd_log("data len"+data.length);
			}
			catch(e) {
				kwd_log("fehler .next() "+e.message);
			}
			//return entry;			
			return data[i-1];
		}
		else return null;
	};
	this.hasNext = function() {
		//kwd_log('length:'+length);
		if (i<this.length) return true;
		else return false;
	};
	// aus Performance-Gründen kann man mit dem gleichen Objekt von vorn beginnen
	// obwohl es aus 
	this.rewind = function() {
		i = 0;
	};
	//helper(mostly for debug)
	this.getKey = function() {
		return sourcekey;
	};
}


// test object
function PrivateStatic() {

	// private member
	var amember = 0;
	
	this.static = function(newvalue) {
		if (newvalue) arguments.callee.test = newvalue;
		return (arguments.callee.test);
	};
	
	this.privatemember = function(newvalue) {
		if(newvalue) myvalue = newvalue;
		if(newvalue) amember = newvalue;
		return (arguments.callee.test);		
	};
}


/*
im folgenden werden die Vererbungshierarchien festgelegt
*/
