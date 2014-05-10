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
var appRootPath = ''; // ist Objekt
var downloadFileCounter = 0;

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
// (image name  + Code (redaxo))
function _downloadNextFile() {

    var fileTransfer = new FileTransfer();
    fileEntry.remove();
    
    fileTransfer.download(
        'http://www.kuehne-webdienste.de/files/ps-shot.jpg',
        path + 'theFile.jpg',
        function(file) {
			// testausgabe
			kwd_log('Pfad: '+p+'--');
			//testanzeige
            //showLink(u);
        },
        function(error) {
            kwd_log('download error source ' + error.source);
            kwd_log('download error target ' + error.target);
            kwd_log('upload error code: ' + error.code);
        }
    );
	
}

// sets values and counter for use by _downloadNextFile
function prepareDownload(path) {
	var downloadcounter=8;
	// if array data available
	if (kwd_projects) {
		// test auflistung:
		//var i=0;
		for(var entry in kwd_projects) {
			kwd_log(entry[]);
		}
	}	
}

// prüft ob Pfad erzeugt werden muss
// wenn Pfad in local storage, wird dieser als valid angesehen und kein requestfilesystem+dummy-file benötigt
// initalisiert rekursiven Download
// TODO: nicht nur Projektbilder!
function downloadImages() {

	if(appRootPath) {
		// direkter Downloadinit
		prepareDownload(appRootPath);
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
	appRootPath=path;
	localStorage.setItem(kwd_storage_path,path);

	prepareDownload(path);	    
}

function showLink(url) {
    //alert(url);
    /*
    var divEl = document.getElementById('deviceready');
    var aElem = document.createElement('a');
    aElem.setAttribute('target', '_blank');
    aElem.setAttribute('href', url);
    aElem.appendChild(document.createTextNode('Ready! Click To Open.'));
    divEl.appendChild(aElem);
    */
    $('#deviceready').html('<p><a href="'+url+'">try to show image</a>:</p><img src="'+url+'" />');
}

function fail(evt) {
    kwd_log(evt.target.error.code);
}
