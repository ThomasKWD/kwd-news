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

//  ---------------- check filesystem

//function declared in index.js
//function onDeviceReady() {
//    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
//}

function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
    console.log(fileSystem.root.name);
    alert(filesystem.root.name)
}

function fail(evt) {
    console.log(evt.target.error.code);
}


// ------------------ read test file
function saveProjects() {
	
	// !! Assumes filePath is a valid path on the device
	var fileTransfer = new FileTransfer();
	var uri = encodeURI("http://www.kuehne-webdienste.de/files/apn-shot.jpg");
	
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
	        console.log("upload error code" + error.code);
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