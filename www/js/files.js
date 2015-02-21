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
	// Achtung!: wegen Nutzung als Callback keine function Parameter möglich (nur für initialen Aufrud nutzbar!)
	// features:
	// - handles isDoridscript as well
	// return: true: download gestartet, false: konnte Download nicht starten
	function _downloadNextFile() {
		
		// first correct the status of the last downloaded!
		if(lastDownloaded!=-1) {
			list[lastDownloaded]['status']['cache'];
			lastDownloaded=-1;
			
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
		if (downloadFileCounter<0) return false;
		
		// invoke download only if required by keyword 'download'
		if(list[n]['status']=='download') {
						
		    // change status
		    list[n]['status']='progress';
		    //TODO: you must save the index (id) of the last downloaded item!
		    
		    var fileTransfer = new FileTransfer();
		   	lastDownloaded = n;
		    fileTransfer.download(
		    	
		        list[n]['remote'],
		        list[n]['local'],  // does not work with thumbs -- TODO: funktion von app, die Name bereinigt!!!
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
	 */
	function startDownloadImages() {
		downloadCounter = -1;
		//downloadIterator = app.getSourceList('imgsrc'); // determines the file list used
		_downloadNextFile();	
	}
  	
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
				}
				else {
					if(device=='phonegap') {

					    window.requestFileSystem(
					        LocalFileSystem.PERSISTENT,
					        0,
					        onRequestFileSystemSuccess,
					        fail
						);
						
						// special content to prevent multiple times to start requestFileSystem
						localBase='processing';	
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
		
		var f = filename.replace('index.php',''); // to make name shorter
		f = f.replace(/rex_img_/g,'');  // to make name shorter
		f = f.replace(/[\/\?=&%$!\*#]/g,'_');
		//logthis("ersetzt: "+f);
		var checkpath = this.getLocalBase();
		if(checkpath == remoteBase) return remoteBase + filename;
		else {
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
	 * - 'code': contains javascript code as a string, this will be eval'd by the download-complete-callback
	 * - TODO: check what happens when complicated string occurs!
	 */
	this.getCached = function(name,code) {
		
		// try to load (assumes that filelist already loaded when not empty)
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
		
		// determine whether not in list or just empty
		if(i==j) { // means no entry found in list
			var a = new Object();
			a['name'] = name;
			a['remote'] = remoteBase + name;
			// TODO: local name must be converted before use
			a['local'] = this.getLocalPath(name);
			a['status'] = 'download';
			
			list.push(a); // hopefully always as next entry at the end!
			this.saveFileList();
		}
		else {
		}
		// do always
		
		
		// here list[i] is always valid
		try {
			var c = code;
			if(c) { // not empty?
				c = c.replace('###uri###',list[i]['local']);
			}
			list[i]['code'] = c;
			entry = list[i]['local'];
		}
		catch(e) {
			logthis('getCached: '+e.message);
		}
		
		return entry;
	};
	
	
	
	// construct code
	if(typeof params.remote != undefined) remoteBase = params.remote;
	if(remoteBase.lastIndexOf('/') != remoteBase.length-1) remoteBase += '/';
	if(typeof params.key != undefined) storageFiles = params.key;
	if(typeof params.key != undefined) storagePath = params.path;
	if(typeof params.mode != undefined) this.updateMode(params.mode); 
	if(typeof params.isDevice != undefined) device = params.device;
}
