/*
  nachladen der Projekte
  
  * mit JSONP aus jQuery, da andere Domain als Datei
  * oder geht mit speziellen Funktionen aus Phonegap?
  * alle Funktionen setzen voraus, dass sie innerhalb eines $(document).ready(...)-Aufrufs gestartet wurden.
  * 
  * um Bilder auch später speichern zu können ist es evtl. sinnvoll, sie per JSONP und base64 codiert zu laden
  * anstatt sie normal zu erzeugen (es wird nur src geladen)
  * 
  * TODO: warum geht Fehlermeldung nicht?
  * TODO: alle synch Funktionen zusammenfassen (kwd-save)
  * TODO: alle local storage zusammenfassen und die storage-Befehle kapseln! (kwd-restore, ...)
*/

/*
 * Funktionen
 */
function ajax_success(data, textStatus, jqXHR ) {
	kwd_log(textStatus);
}
function ajax_error(jqXHR,textStatus,errorThrown) {
	kwd_log(textStatus);
} 

// TODO: wenn Anzeige-code weg, diese function wieder inline :-)
function getResponse(response) {
	
	if(response) {		
		
		//kwd_log(response);
		var strdata = JSON.stringify(response); 
		localStorage.setItem(kwd_storage_projects, strdata);
		//kwd_log('habe versucht, response zu speichern.');
		//kwd_log(strdata);
			
		
		//$("#load-result").html('Daten aus dem Internet aktualisiert.');		
	}
	else {
		kwd_log('Projects Aktualisierung fehlgeschlagen.');				
	}
}

function getResponseNews(response) {
	
	if(response) {		
		
		kwd_log(response);
		var strdata = JSON.stringify(response); 
		localStorage.setItem(kwd_storage_news, strdata);
	}
	else {
		kwd_log('News Aktualisierung fehlgeschlagen.');				
	}
}

function getResponseOffers(response) {
	
	if(response) {		
		
		kwd_log("folgend die Angebote:");
		kwd_log(response);
		var strdata = JSON.stringify(response); 
		localStorage.setItem(kwd_storage_offers, strdata);
	}
	else {
		kwd_log('Angebote Aktualisierung fehlgeschlagen.');				
	}
}


/*
 *
 */
function kwd_DownloadProjects (argument) {
	
	//$('#load-result').html('AKTUALSIEREN');
	//kwd_log('starte aktualisieren');
	
	$(document).ajaxError(function(event, request, settings){
   		alert("<li>Error requesting page " + settings.url + "</li>");
 	});
 
 // Abfrage ob Netzwerk-Kommunikation möglich (phonegap)
	// TODO: Auswertung durch caller ermöglichen (Status weiterleiten, evtl. sogar exception handling)
	
	//networkState = navigator.connection.type;
	//if (networkState == Connection.NONE) return null;

	// http://www.interaktionsdesigner.de/2008/08/28/jsonp-und-das-cross-server-scripting/
	// http://remysharp.com/visual-jquery/
	// for phonegap:
	// http://samcroft.co.uk/2012/my-article-for-adobes-appliness-magazine-data-in-phonegap-apps/

    $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp_callback',
      //url: 'http://localhost/tk/kwd-news-data/jsonp.php',
      //url: 'http://localhost/tk/kwd3_r441/index.php?article_id=10',
      url: kwd_getUrlFromId(10),
      timeout: 10000
      
    }).error(function(){
		//$('#load-result').html("");
		//$('#load-result').append("update error");		
	}).complete(function(){
		//console.log('update fertig');
		//$('#load-result').html('fertig');
	}).success(getResponse);
	
}

/*
 *
 */
function kwd_DownloadNews (argument) {
	
	$(document).ajaxError(function(event, request, settings){
   		alert("<li>Error requesting page " + settings.url + "</li>");
 	});
 
	 // Abfrage ob Netzwerk-Kommunikation möglich (phonegap)
	
	//networkState = navigator.connection.type;
	//if (networkState == Connection.NONE) return null;

	// http://www.interaktionsdesigner.de/2008/08/28/jsonp-und-das-cross-server-scripting/
	// http://remysharp.com/visual-jquery/
	// for phonegap:
	// http://samcroft.co.uk/2012/my-article-for-adobes-appliness-magazine-data-in-phonegap-apps/
    $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp_callback',
      //url: 'http://localhost/tk/kwd-news-data/jsonp.php',
      //url: 'http://localhost/tk/kwd3_r441/index.php?article_id=10',
      url: 'http://www.kuehne-webseiten.de/index.php?article_id=25',
      timeout: 10000
      
    }).error(function(){
		//$('#load-result').html("");
		//$('#load-result').append("update error");		
	}).complete(function(){
		//console.log('update fertig');
		//$('#load-result').html('fertig');
	}).success(getResponseNews);
	
}

function kwd_DownloadOffers (argument) {
	
	$(document).ajaxError(function(event, request, settings){
   		alert("<li>Error requesting page " + settings.url + "</li>");
 	});
 
    $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp_callback',
      //url: 'http://www.kuehne-webseiten.de/index.php?article_id=25',
      //url: 'http://www.kuehne-webseiten.de/index.php?article_id=25',
      //url : 'http://localhost/tk/kwd-redaxo-46/index.php?article_id=45',
      url : 'http://www.kuehne-webseiten.de/index.php?article_id=45',
      timeout: 10000
      
    }).error(function(){
		//$('#load-result').html("");
		kwd_log("update OFFERS error");		
	}).complete(function(){
		//console.log('update fertig');
		//$('#load-result').html('fertig');
	}).success(getResponseOffers);
	
}

/*
 * prüft und setzt den Pfad für eine spezielle Ausgabe (bestimmt durch Parameter type)
 * - wenn Parameter leer, wird nur der "appRootPath" zurückgegeben (falls erhältlich).
 * - bei fehlenden Daten oder Fehler wird Leerstring zurückgegeben
 *
 * - falls Datei im Cache verfügbar, wird der lokale Pfad des Device zurückgegeben TODO: wie werden einzelne Dateien geprüft??? 
 * - es wird sonst ein gültiger URI im Web zurückgegeben (Datei wird also direkt vom Web geladen)
 */
function kwd_getFilePath(type) {
	
	var path = localStorage.getItem(kwd_storage_path);
	if (!path) {
		kwd_log('appRootPath not available.');
		path='';
	}
	else kwd_log("path: "+appRootPath);

	if (type) {
		if (type==kwd_storage_projects) {
			// TODO: auch für local voreinstellungen falls es thumb-versionen gibt
			if (!path) path = 'http://www.kuehne-webdienste.de/index.php?rex_img_type=projektvorschau&rex_img_file=';			
		}
	}
	
	return path;
}
