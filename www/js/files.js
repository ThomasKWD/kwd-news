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
		Finden und erkennen der files könnte ähnlich wie bei "colorbox" oder anderen Galerien, das eigene Auswerten des 
		Codes in Hg. sein. --> der Code setzt einfach nur bestimmte Standard-Syntax 
		Nachteil: Data-functions nicht komplett unabhängig von HTMl-spezifischen Aufgaben
		(könnte man mit abgeleiteter Klasse oder Call-Back-Funktionen lösen)
	
	Struktur: Array mit folgenden Unterelementen in jedem Element:
	['name']  : url online aber ohne remoteBase
	['remote'] : url online vollständig - evtl. unnötig
	['local'] : url lokal vollständig
	['status'] : 'na' : (not available) wenn Caching nicht möglich oder Download gescheitert (wird aber bei nächstem Anzeigeversuch sofort wieder auf 'download' gesetzt!)
	             'download' : soll so bald wie möglich heruntergeladen werden
	             'cache' : wurde erfolgreich heruntergeladen
	             
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
	var downloadCounter = -1;
	var moreDownloads = 0; // counts in addition to downloadCounter since the "startDownload" my be called to frequently
	var lastDownloaded = -1;
	//var downloadIterator = null;

	function logthis(element) {
		kwd_log(element);
	}

  	/* sets and/or returns value of update mode
  	 * values: auto|offline|online
  	 * - WARNING!: updatemode is always reset to 'online' in curtain environments
  	 * - the value of parameter 'mode' is not checked since this is done by the caller (I hope so) 
  	 */
  	
  	//////////////     filesystem functions 
  	
	/* access filesystem and make dummy file to retrieve a proper path
	 * 
	 */
	function onRequestFileSystemSuccess(fileSystem) {
	    kwd_log('onRequestFileSystemSuccess');
	    fileSystem.root.getFile(
	        'dummy.html',
	        {create: true, exclusive: false},
	        onGetFileSuccess,
	        fail
	    );
	}
	function onGetFileSuccess(fileEntry) {
	    kwd_log('onGetFileSuccess!');
	    var path = fileEntry.toURL().replace('dummy.html', '');
	    fileEntry.remove();
	    
	    if(path.lastIndexOf('/')!=path.length-1) path += '/';
		localBase=path;
		localStorage.setItem(kwd_storage_path,path);
		startDownloadImages();
	}
  	function fail(evt) {
	    kwd_log(evt.target.error.code);
	}
	
	// rekursiv
	// features:
	// - handles 'moreDownloads', when end of list is reached
	// - sets ready downloads to 'status'=='cache'
	// return: true: download gestartet, false: konnte Download nicht starten
	// TODO: better download queue
	function _downloadNextFile() {
		
		// first correct the status of the last downloaded!
		if(lastDownloaded!=-1) {
			list[lastDownloaded]['status']['cache'];
			lastDownloaded=-1;
			
			try {
				eval(list[lastDownloaded]['code']);
			}
			catch(e) {
				logthis("error eval file ("+list[lastDownloaded]['code']+") : "+e.message);
			}
			
		}
	
		// ist counter!=, eine Zahl und path und Daten vorhanden?
		// check if this.getLocalBase is possible
		if (this.getLocalBase() == remoteBase) return false;
		
		 // -1 bedeutet Init
		 if (downloadCounter==-1) {
			// TODO: prüfe auf richtige Ermittlung
			var n = kwd_projects.length;
			if (!n) return false;
			 
			kwd_log("size of kwd_projects:"+n);
			downloadFileCounter = n;
		}
		
		// downcount hier! // dadurch auto. counter auf n-1
		downloadFileCounter--;
		if (downloadFileCounter<0) {
			// check for more downloads and restart cycle
			if (moreDownloads>0) {
				moreDownloads--;
				_downloadNextFile();
			}
			return false;
		}
		
		// invoke download only if required by keyword 'download'
		if(list[n]['status']=='download') {
						
		    // change status
		    list[n]['status']='progress';
		    
		    var fileTransfer = new FileTransfer();
		   	lastDownloaded = n;
		    fileTransfer.download(
		    	
		        list[n]['remote'],
		        list[n]['local'], 
		        function(file) { // success
		        	_downloadNextFile(); 
		        },
		        function(error) {
		            kwd_log('download error source ' + error.source);
		            kwd_log('download error target ' + error.target);
		            kwd_log('upload error code: ' + error.code);
		        }
		    );	
		}
		else {
			_downloadNextFile();		
		}

	    
	    return true;	
	}
	
	/* prepares downloading all of list 
	 * - TODO: check if access to list!!!
	 * - TODO: how to prevent many downloads at a time with several different updated lists??? 
	 */
	this.startDownload = function(id) {
		moreDownloads++;
		
		if(moreDownloads<=1) {
			downloadCounter = -1;
			//downloadIterator = app.getSourceList('imgsrc'); // determines the file list used
			_downloadNextFile();			
		}
	};
  	
  	//////////////     public methods
  	
  	
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
		
		if (this.updateMode()!='online') {
			if(localBase=='') {
				var p = localStorage.getItem(storagePath);
				if(p) {					
					return localBase;
					logthis("got path: "+p);		
				}
				else {
					if(device=='phonegap') {

						localBase = cordova.file.cacheDirectory;
						if(localBase) {
							if(localBase.lastIndexOf('/')!=localBase.length-1) localBase += '/';
							localStorage.setItem(kwd_storage_path,localBase);
							logthis("found path: "+localBase);
							return localBase;							
						}
					}
					else if(device=='droidscript') {
						// this code is easy
					}
				}
				
			}
			else {
				if (localBase!='processing') return localBase;
			}			
		}
		return remoteBase;
	};
	
	/* returns ready to use local filepath
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
			//logthis("ersetzt: "+f);
			// do try download here? (localBase available but local file not yet)
			return checkpath + f;
		}	
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
		
	};
	
	/* deletes all files from the filesystem, then removes the list itself
	*/
	this.removeAll = function() {
		
	};
	
	/* get a file uri for display
	 * - returns empty string if file not yet in cache 
	 * - manages the list internally
	 * - the user needs this method only (most cases)
	 * - 'name': file without path, can also be a script or another complicated string
	 * - 'code': contains javascript code as a string, this will be eval'd by the download-complete-callback
	 * - returns local path only if file is already in cache,
	 * - returns default image if file is not (yet) in cache
	 * - in 'browser' mode, ['local'] is set to 'remote' and ['status'] is set to 'cache'
	 * - TODO: bei isDevice bekommt caller zunächst local-name ohne Pfad :-(, müsste aber remote-Pfad oder Ersatzbild, solange keine Download fertig
	 */
	this.getCached = function(name,code) {
		
		if (!name) return '';
		
		// try to load (assumes that filelist already loaded when not empty)
		// thus is called only once when app runs
		if (list.length<1) {
			var strread = null;
			//TODO: enable:  // strread = localStorage.getItem(kwd_storage_files);
			if(strread) {
				logthis("got files");
				//logthis(strread);
				list = JSON.parse(strread);
				//logthis(list);
			}
		}
		
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

			list.push(a); // hopefully always as next entry at the end!
			this.saveFileList();

			if(a['remote']==a['local']) {
				list[i]['status'] = 'na'; 
			}			
			else {
				list[i]['status'] = 'download';
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
	if(typeof params.key != undefined) storagePath = params.path;
	if(typeof params.mode != undefined) this.updateMode(params.mode); 
	if(typeof params.isDevice != undefined) device = params.device;
}
