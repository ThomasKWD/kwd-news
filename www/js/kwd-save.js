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
var appRootPath = '';

//  ---------------- check filesystem

function onGotDir(d) {
	appRootPath = d;

	//var reader = DATADIR.createReader();
	//reader.readEntries(gotFiles,onError);
}

function onDirError(e) {
	kwd_log('Fehler bei getDirectory.');
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
	
	// !! Assumes filePath is a valid path on the device
	var fileTransfer = new FileTransfer();
	var uri = encodeURI('http://www.kuehne-webdienste.de/files/apn-shot.jpg');
	
	// TODO: in new phongegap you must use function to create url 
	var filePath = '/mnt/sdcard'; // valid for most android
	
	fileTransfer.download(
	    uri,
	    filePath,
	    function(entry) {
	        console.log("download complete: " + entry.fullPath);
	    },
	    function(error) {
	        console.log("download error source " + error.source);
	        console.log("download error target " + error.target);
	        console.log("download error code" + error.code);
	    }
	);
	
}


// --------------old canvas code (won't work cross sites)

// versuche canvas zu füllen mit Bild von Projekt 1

function saveProjects_Canvas() {
	var canvas = $('#mycanvas').get(0); // get gets *always* array of matched!!
	//var canvas = document.createElement('canvas');
	console.log(canvas);
	var ctx = canvas.getContext('2d');
	var img = $('#projekt1 .image img').get(0);
	console.log(img.src);
	
	ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    
    console.log(dataURL);

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
