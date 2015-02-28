/*
    Object
    Liste(n) für heruntergeladene oder noch zu ladende Dateien

	- unabhängig von KwdCachedContent, da einfach Liste für alle files
	- erzeugt, prüft und/oder speichert auch den aktuellen lokalen Pfad (localBase) --> NEU: erzeugen nicht mehr so kompliziert!!
	- files in 'list' werden mit ganzem Pfad gespeichert, der separat gespeicherte Pfad ist für neu hinzugefügte, der 'name' wird aber ohne Pfad gespeichert
	- list['local'] enthält leeren String, wenn noch nicht heruntergeladen oder Pfad aus 'remoteBase', falls Caching nicht möglich
	- geplant: Ausführung von Downloads *unabhängig* vno Anzeige-Funktion der Daten (WebContent):
		alle möglicherweise benötigten Downloads werden im Hintergrund gestartet, unabhängig von bereits aufgerufenen
		Seiten mit Content,
		da insgesamt nicht sooo viel Content, und es nicht schadet, *alle* files im Projekt vorzuhalten.
		(Außerdem könnte das "Vorhalten" später durch dosiertes laden der WebContent-Daten sein (z.B. nur projects))
	
	Struktur: Array mit folgenden Unterelementen in jedem Element:
	['name']  : url online aber ohne remoteBase
	['remote'] : url online vollständig - evtl. unnötig
	['local'] : url lokal vollständig
	['status'] : 'na' : (not available) wenn Caching nicht möglich oder Download gescheitert (wird aber bei nächstem Anzeigeversuch sofort wieder auf 'download' gesetzt!)
	             'download' : soll so bald wie möglich heruntergeladen werden
	             'cache' : wurde erfolgreich heruntergeladen
	             
	TODO:
	- warum wird download *immer* gestartet wenn Verbindung? (kann ja, soll aber vorher schon gecachte Datei anzeigen)
	- was passiert im OFFLINE mode der App?
	- bei Programmstart oder bei ONLINE/AUTO müsste überprüft werden ob Downloads ausstehen!!!
	- TODO: falls Caching möglich aber ausgeschaltet, --> welcher Pfad wird gespeichert, --> was passiert beim Einschalten
	- TODO: bei Zwangs-Löschen des Cache sollten Bilder gelöscht und auch der Pfad neu *erzeugt* werden
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
	var downloadCounter = -1;
	var moreDownloads = 0; // counts in addition to downloadCounter since the "startDownload" my be called to frequently

	var that = this;
	
	function logthis(element) {
		kwd_log(element);
	}
 	
	// rekursiv
	// features:
	// - handles 'moreDownloads', when end of list is reached
	// - sets ready downloads to 'status'=='cache'
	// - code MUST NOT be called twice at the same time
	// return: true: download gestartet, false: konnte Download nicht starten
	// TODO: better download queue
	this.downloadNextFile = function() {
		
		var n; //==downloadCounter, just for easier writing and reading 
				
	
		// ist counter!=, eine Zahl und path und Daten vorhanden?
		// make sure that localBase is set since get.localBase is not valid here -- or use that = this 
		if (localBase == remoteBase) return false;
		if(localBase.length<4) {
			kwd_log("localBase problem");
			kwd_log("localBase: "+localBase);
			kwd_log("remoteBase: "+remoteBase);
			kwd_log("downloadCounter:"+downloadCounter);
			return false;
		}
		 // -1 bedeutet Init
		if (downloadCounter==-1) {
			n = list.length;
			if (!n) return false;
			 
			downloadCounter = n;
		}
		
		// downcount hier! // dadurch auto. counter auf n-1
		downloadCounter--;
		n = downloadCounter;
		
				
		if (downloadCounter<0) {
			downloadCounter = -1; // double security
			// check for more downloads and restart cycle
			if (moreDownloads>0) {
				moreDownloads--;
				that.downloadNextFile();
			}
			return false;
		}
		
		//kwd_log("download access to array: "+list[n]['status']);
		// invoke download only if required by keyword 'download'
		if(list[n]['status']=='download') {
						
		    // change status
		    list[n]['status']='progress';
		    //kwd_log('starting file download to: '+list[n]['local']);
		    //kwd_log('(name): '+list[n]['name']);
		    
		    var fileTransfer = new FileTransfer();

		    fileTransfer.download(
		    	
		        list[n]['remote'],
		        list[n]['local'], 
		        function(file) { // success
		        	try {
		        		//kwd_log('pure name of success file: '+file.name);
		        		//$('#testbild').attr('src',file.toURL());
		        		
		        		// cannot save index easily (or where??)
		        		/*var i = 0;
		        		var j = list.length;
		        		for(i;i<j;i++) {
		        			if (list[i]['name'] == file.name
		        		}
		        		*/
		        		kwd_log("index of file: "+downloadCounter);
		        		if(downloadCounter>=0 && downloadCounter<list.length) { // double security in debug state
							// first correct the status of the last downloaded!
							list[downloadCounter]['status'] = ['cache']; 
							eval(list[downloadCounter]['code']); // TODO: nice new callback
						}
						that.saveFileList();
			        	that.downloadNextFile();		       
		        	}
		        	catch(test) {
		        		kwd_log('catch in download callback: '+test.message);
		        	} 
		        	
		        },
		        function(error) {
		            kwd_log('filetransfer error source ' + error.source);
		            kwd_log('filetransfer error target ' + error.target);
		            kwd_log('filetransfer error code: ' + error.code);
		            that.downloadNextFile();
		        }
		    );	
		}
		// more elements in list possible
		else {
			that.downloadNextFile();		
		}

	    
	    return true;	
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
	
	/* prepares downloading all of list 
	 * - TODO: check if access to list!!!9
	 */
	this.startDownload = function(id) {
		moreDownloads++;
		
		if(this.updateMode()!='offline' && this.checkConnection()) {
			if(moreDownloads<=1) {
				downloadCounter = -1;
				//downloadIterator = app.getSourceList('imgsrc'); // determines the file list used
				this.downloadNextFile();
			}
		}else logthis("no download files due to offline");
	};
  	
  	//////////////     public methods
  	
  	
  	/* sets and/or returns value of update mode
  	 * values: auto|offline|online
  	 * - WARNING!: updatemode is always reset to 'online' in curtain environments
  	 * - the value of parameter 'mode' is not checked since this is done by the caller (I hope so) 
	 * WARNING!: this is the user set update mode --> don't use it to determin whether connection is available
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
	 * TODO: due to new phonegap file you don't need dummy.html anymore 
	 */
	this.getLocalBase = function() {
		
		if (this.updateMode()!='online') { // 'online' means force to eget data from remote source
			if(localBase=='') {
				var p = localStorage.getItem(storagePath);
				if(p) {					
					logthis("got path: "+p);		
					localBase = p;
					return localBase;
				}
				else {
					if(device=='phonegap') {

						localBase = cordova.file.cacheDirectory;
						if(localBase) {
							if(localBase.lastIndexOf('/')!=localBase.length-1) localBase += '/';
							localStorage.setItem(storagePath,localBase);
							logthis("found path: "+localBase);
							return localBase;							
						}
					}
				}
				
			}
			else {
				return localBase;
			}			
		}
		return remoteBase;
	};
	
	/* returns ready to use local filepath or a remote path if caching is not possible
	 * 
	 * - the given 'filename' may be converted to make a valid filename
	 * - this does nothing to download a file, just creating the name
	 * - /?=&%$!*#
	 * - as long as you are not sure the file is already in cache you must always return remotepath
	 * 
	 */
	this.getLocalPath = function(filename) {
		
		var checkpath = this.getLocalBase();
		if(checkpath == remoteBase) return remoteBase + filename;
		else {
			var f = filename.replace('index.php',''); // to make name shorter
			f = f.replace(/rex_img_/g,'');  // to make name shorter
			f = f.replace(/[\/\?=&%$!\*#]/g,'_');
			return checkpath + f;
		}
	};
	
	/* loads file list *if not yet loaded* and if available
	 * returns true if loading was successful  or list already there
	 */
	this.requireFileList = function() {
		if (list.length<1) {
			var strread = null;
			strread = localStorage.getItem(kwd_storage_files);
			if(strread) {
				logthis("got files");
				//logthis(strread);
				list = JSON.parse(strread);
				//logthis(list);
			}
		}
		
		if(list.length) return true;
		else return false;
	};

	/* stores the files list (e.g. in localStorage)
	 * 
	 */
	this.saveFileList = function() {
		
		if(list.length>0) {
			var strwrite = JSON.stringify(list);
			if (strwrite) localStorage.setItem(kwd_storage_files,strwrite);
			//logthis("files:"+strwrite);
		}
	};
	
	/* removes file from the list
	 * - list will be saved after removing
	 * 
	 */
	this.remove = function(filename) {
		logthis("remove() does nothing");
	};
	
	/* deletes all files from the filesystem, then removes the list itself
	 * - only works when files data available
	 * - tries to load again data if needed
	 */
	this.removeAll = function() {
		
		logthis("check removeAll");
		if(this.requireFileList()) {
			var it = new KwdIterator(list);
			while(it.hasNext()) {
				var e = it.next();
				if(e['status']=='cache') {
					//logthis("im cache: "+e['name']);
					// check could be outside loop - but is inside for testing purposes
					if(device=='phonegap') {
						var file = window.resolveLocalFileSystemURL(
							e['local'],
							function(fileEntry) { // success callback
								kwd_log('success get file for remove');
							    fileEntry.remove(function() {
							      console.log('File removed.');
							    },
								function(error) {
									kwd_log('error in remove file, code:'+error.code);
									kwd_log('error in remove file, message:'+error.message);
								});														
							},
							function(error) {
								kwd_log('error in resolve file url, code:'+error.code);
								kwd_log('error in resolve file url, message:'+error.message);		        
							});
					}
				}
			}
		}
	};
	
	/* get a file uri for display
	 * - returns empty string if file not yet in cache
	 * - returns valid remote url when a) no caching (browser) or b) download failed
	 * 
	 * - manages the list internally
	 * - the user needs this method only (most cases)
	 * - 'name': file without path, can also be a script or another complicated string
	 * - 'code': contains javascript code as a string, this will be eval'd by the download-complete-callback
	 * - returns local path only if file is already in cache,
	 * - returns default image if file is not (yet) in cache
	 * - in 'browser' mode, ['local'] is set to 'remote' and ['status'] is set to 'na'
	 */
	this.getCached = function(name,code) {
		
		if (!name) return '';
		
		// try to load (assumes that filelist already loaded when not empty)
		// thus is called only once when app runs
		this.requireFileList(); // loads list only if not yet loaded can still be empty after this (if load failed)
		
		// find name in list
		var i;
		var j=list.length;
		var entry = '';

		for (i=0;i<j;i++) {
			if (list[i]['name']==name) {
				break;
			}
		}
		
		// not  yet in list
		if(i==j) { // means no entry found in list
			var a = new Object();
			a['name'] = name;
			a['remote'] = remoteBase + name;
			a['local'] = this.getLocalPath(name);
			logthis('new set local path: '+a['local']);

			list.push(a); // hopefully always as next entry at the end!
			this.saveFileList();

			if(a['remote']==a['local']) {
				list[i]['status'] = 'na'; 
			}			
			else {
				list[i]['status'] = 'download';
				//TODO: don't start download when offline
				this.startDownload(); 			
			}
		}
		
		// here list[i] is always valid
		
		// when use eval?
		var c = code;
		if(c) { // not empty?
			c = c.replace('###uri###',list[i]['local']);
		}
		list[i]['code'] = c;
		
		if(list[i]['status'] == 'cache' || list[i]['status'] == 'na') {
			logthis("get file "+list[i]['name']+" from cache");
			try {
				eval(list[i]['code']);
			}
			catch(e) {
				logthis("error eval file ("+list[i]['code']+") : "+e.message);
			}
			return list[i]['local'];
		}
		
		else return '';
	};
	
	
	
	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(remoteBase.lastIndexOf('/') != remoteBase.length-1) remoteBase += '/';
	if(typeof params.key != undefined) storageFiles = params.key;
	if(typeof params.path != undefined) storagePath = params.path;
	if(typeof params.mode != undefined) this.updateMode(params.mode); 
	if(typeof params.device != undefined) device = params.device;
}
