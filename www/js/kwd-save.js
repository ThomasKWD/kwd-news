/*
 * speichern der Projektdaten (inklusive Bilder!) als Datei oder in DB
 * 
 * direkt als FileTransfer.download siehe cordova Doc. - Nachteil: schlecht in anderen Browsern zu testen.
 * als "duales System" könnte man die bereits bestehenden Projekte im phonegap Projekt
 * als Ressource hinterlegen, so dass nur neue und Änderungen nachgeladen werden.
 * 
 * 
 */

// global ----------------
var appRootPath = ''; // ist Objekt (???)
var downloadFileCounter = -1; // 0 symbolisiert "fertig", während -1 "noch nicht angefangen" bedeutet

//  ---------------- check filesystem

function onGotDir(d) {
	appRootPath = d;
	kwd_log(d);
	kwd_log(JSON.stringify(d));
	kwd_log('endlich Pfad:'+d.toUrl+'--');

	//var reader = DATADIR.createReader(); // holt anscheinend Dateiliste
	//reader.readEntries(gotFiles,onError);
}

function onDirError(e) {
	kwd_log('onDirError');
	kwd_log(JSON.stringify(e));
}

//function window.requestFileSystem called in index.js

function onFileSystemSuccess(fileSystem) {
	kwd_log('onFileSystemSuccess');
	kwd_log(fileSystem.name);
	kwd_log(fileSystem.root);
	kwd_log(fileSystem.root.name);// ist evtl. leer
	fileSystem.root.getDirectory("files",{create:true},onGotDir,onDirError);
	//fileSystem.root.getDirectory("Android/data/de.kuehne-webdienste.files",{create:true},onGotDir,onDirError); // teste auf Android
}

function onFileSystemError(evt) {
	kwd_log('onFileSystemError');
    kwd_log(evt.target.error.code); // warum so?
    
  var msg = '';

  switch (evt.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  kwd_log('Error: ' + msg);
   
}


// ------------------ read test file
function saveProjects() {
	
	// das erstmal nach save
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.PERSISTENT,0, onFileSystemSuccess, onFileSystemError);
	kwd_log('after window.requestFileSystem');

	// !! Assumes filePath is a valid path on the device
	var fileTransfer = new FileTransfer();
	var uri = encodeURI('http://www.kuehne-webdienste.de/files/apn-shot.jpg');
	
	// TODO: in new phongegap you must use function to create url 
	var filePath = '/mnt/sdcard'; // valid for most android
	
	fileTransfer.download(
	    uri,
	    filePath,
	    function(entry) {
	        kwd_log("download complete: " + entry.fullPath);
	    },
	    function(error) {
	        kwd_log("download error source " + error.source);
	        kwd_log("download error target " + error.target);
	        kwd_log("download error code" + error.code);
	    }
	);
	
}

// rekursiv
// verwendet z.Z. hard codiert bestimmte verkleinerte Form der Bilder
// (image name  + Code (redaxo) )
// Achtung!: wegen Nutzung als Callback keine function Parameter möglich (nur für initialen Aufrud nutzbar!)
// TODO: für mehrere Datensätze durch übergeben der JSON-Struktur (z. B. kwd_projects)
// TODO: mehrere Bildformate durch setzen einer var (global) und jeweils separaten Durchlauf des Daten-Array
// return: true: download gestartet, false: konnte Download nicht starten
function _downloadNextFile() {

	// ist counter!=, eine Zahl und path und Daten vorhanden?
	if (isNaN(downloadFileCounter) || !appRootPath || !kwd_projects) return false;
	
	// -1 bedeutet Init
	if (downloadFileCounter==-1) {
		// TODO: prüfe auf richtige Ermittlung
		var n = kwd_projects.length;
		if (!n) return false;
		 
		kwd_log("size of kwd_projects:"+n);
		downloadFileCounter = n;
	}
	
	// downcount hier! // dadurch auto. counter auf n-1
	downloadFileCounter--;
	if (downloadFileCounter<0) return false;
	// filename ok bzw. vorhanden? //
	filename = kwd_projects[downloadFileCounter]['imgsrc'];
	// theoretisch kann imgsrc fehlen, aber im nächsten Entry vorhanden sein!!!, deshalb Aufruf, wenn nicht da
	if (!filename) {
		_downloadNextFile();		
	}
	else {
		
	    var fileTransfer = new FileTransfer();
	    
	    // hart codierte URL- und File-Benennung!
	    // es wird nur Original-Image gespeichert :-)
	    fileTransfer.download(
	        'http://www.kuehne-webdienste.de/files/'+filename,
	        appRootPath + filename,
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
    
    return true;	
}


// prüft ob Pfad erzeugt werden muss
// wenn Pfad in local storage, wird dieser als valid angesehen und kein requestfilesystem+dummy-file benötigt
// TODO: nicht nur Projektbilder! -->
function downloadImages() {

	if(appRootPath) {
		// direkter Downloadinit
		downloadFileCounter = -1;
		_downloadNextFile(); // TODO: für mehrere Datensätze durch *kopieren* der JSON-Struktur (z. B. kwd_projects)
		}
	else {		
		// downloadinit in callback
	    window.requestFileSystem(
	        LocalFileSystem.PERSISTENT,
	        0,
	        onRequestFileSystemSuccess,
	        fail
    	);	
	}
}
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
    
	appRootPath=path;
	localStorage.setItem(kwd_storage_path,path);

	downloadFileCounter = -1;
	_downloadNextFile();	    // TODO: für mehrere Datensätze durch *kopieren* der JSON-Struktur (z. B. kwd_projects)
}

function showLinks() {
	
	var url='';
	
	// lösche Zielbereich:
    $('#deviceready').html("\n");	
    // alle Bilder aus local file system
    if (appRootPath && kwd_projects) {
    	var n = kwd_projects.length; 
		for (var i=0;i<n;i++) {
			url = appRootPath + kwd_projects[i]['imgsrc']; // evtl. Fehler!
		    $('#deviceready').append('<p><img src="'+url+'" /></p>');	
		}    	
    }
    else {
    	kwd_log("no data for image test output!");
    }
}

function fail(evt) {
    kwd_log(evt.target.error.code);
}
