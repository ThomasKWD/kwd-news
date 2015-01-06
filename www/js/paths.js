/*
 * Funktionen für den Zugriff auf die richtigen Ressourcen
 * - Pfade für Dateien abhängig von Cache (FileTransfer)
 * - URLs aus articl_id ()
 * - *** weitere Helfer-Funktionen
 */

/*
 * prüft abhängig vom Umfeld, ob von localhost oder www
 * return: URL, im Fehlerfall Leerstring  
 * 
 * TODO: *alle* URI im Projekt sollten über Funktionen wie diese erzeugt werden
 */
function kwd_getUrlFromId (id) {
	
	var url = '';
	
	if(window.isDevice) {
		
		url = 'http://www.kuehne-webseiten.de/index.php?article_id='+id;
		
	}
	else {

		url = 'http://localhost/tk/kwd-redaxo-46/index.php?article_id='+id;
	} 

	kwd_log('made url: '+url);	
	return url;
}

/* erstellt eine Teilliste für kwd_getNewFileList o.ä. Funktionen 
 * 
 * sourcelist: ein Array von Objekten oder 2-dim-Array
 * entryname: Bezeichnung des Assoz.-Schlüssels der 2. Dimensions
 */
function getRawListItems(sourcelist,entryname) {

	var list = [];
	
	// TODO: for mit i verwenden da for in nicht die 
	// richtige Reihenfolge garantiert
	for(var i in sourcelist) {
		curimg=sourcelist[i][entryname]; // Teste das!!!!
		kwd_log("curimg:"+curimg);
		if (curimg.length>0 && curimg.indexOf(',')==-1) {
			list = list.concat(curimg);
		}
		else {
			var imgs = curimg.split(","); // imgs soll jetzt feld sein
			list = list.concat(imgs);
		}		
	}
	
	return list;
}

/* erzeugt Dateiliste aus JSON-Daten
 * der Content-Einträge
 */
function kwd_getNewFileList() {
	
	var list = [];
	
	// TODO: schöner wäre ein Objekt, das selbst entscheidet wann es aktualisiert werden muss.
	kwd_readProjects();
	kwd_readNews();
	kwd_readOffers();
	
	kwd_log("folgend entry Test:");
	
	// TODO: for mit i verwenden da for in nicht die
 	// richtige Reihenfolge garantiert
	for(var i in kwd_projects) {
		// warum entry-Deref Problem???
		curimg=kwd_projects[i].imgsrc;
		if (curimg.length>0 && curimg.indexOf(',')==-1) {
			list = list.concat(curimg);
		}
		else {
			var imgs = curimg.split(","); // imgs soll jetzt feld sein
			list = list.concat(imgs);
		}		
	}
	
	kwd_files = list;
	return list;
}

