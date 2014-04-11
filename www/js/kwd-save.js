/*
 * speichern der Projektdaten (inklusive Bilder!) als Datei oder in DB
 * 
 * direkt als FileTransfer.download siehe cordova Doc. - Nachteil: schlecht in anderen Browsern zu testen.
 * als "duales System" könnte man die bereits bestehenden Projekte im phonegap Projekt
 * als Ressource hinterlegen, so dass nur neue und Änderungen nachgeladen werden.
 * 
 * TODO: das encode geht nur von "eigener Domain"/"vertrauenswürdiger Quelle". Bilder können also nicht 
 * gespeichert werden ohne weiteres. die cordova-Variante wäre am sinnvollsten, da das speichern
 * in einem Browser, der ohnehin online ist, nicht so wichtig ist.
 * 
 */

// global ----------------
var appRootPath = ''; // ist Objekt

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

function downloadFile() {
    kwd_log('downloadFile');
    window.requestFileSystem(
        LocalFileSystem.PERSISTENT,
        0,
        onRequestFileSystemSuccess,
        fail
    );
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
    var fileTransfer = new FileTransfer();
    fileEntry.remove();
    
    fileTransfer.download(
        'http://www.kuehne-webdienste.de/files/ps-shot.jpg',
        path + 'theFile.jpg',
        function(file) {
            kwd_log('download complete: ' + file.toURI());
            showLink(file.toURI());
        },
        function(error) {
            kwd_log('download error source ' + error.source);
            kwd_log('download error target ' + error.target);
            kwd_log('upload error code: ' + error.code);
        }
    );
}

function showLink(url) {
    alert(url);
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

