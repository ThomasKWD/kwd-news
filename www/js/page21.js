/*
 * enthält Scripte für NEWS-Seite und Unterseiten
 * 
 */
var kwd_current_news = -1;

/*TODO:
 * - wenn path ok aber keine Bilder vorhanden sieht man nichts
 * (wie prüfen, ob Bilder im Cache??) 
 * - wenn keine Projekte in local storage gefunden *nicht* noch einmal update starten, sondern nur Hinweis auf offline!! 
 */
function kwd_news2list() {

	var path = kwd_getFilePath(kwd_storage_news);  // gibt nicht nur Ordner sondern gesamte URL zurück, an die dann filename angehangen wird!!
	kwd_log('news image path: '+path);
		
	if (kwd_readNews()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-news-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list2 data-role=listview>";

		var curimg;
		var i=0;
		for(var entry in kwd_news) {
			
			curimg='';
			html += "<li class=anews>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-anews onClick=\"kwd_current_news="+(i)+";\">"; // warum onClick??
			
			// da imgsrc jetzt auch eine Liste enthalten kann(!)
			// nur erstes Bild herausfiltern (kommagetrennte Namen):
			curimg = kwd_news[i]['imgsrc'];			
			if (curimg.indexOf(',')!=-1) {
				curimg = curimg.substr(0,curimg.indexOf(','));	
			}
			//html += '<img style="width:80px" src="'+path+curimg+'" />';
			//html += '<img style="height:80px" src="'+path+kwd_news[i]['imgsrc']+'" />';
 // http://www.kuehne-webdienste.de/tbd-shot.jpg
			
			html += "<h3>"+kwd_news[i]['name']+"</h3>";
			
			html += "<p>"+kwd_news[i]['url']+"</p>"; 

			html += "</a>";
			
			html += "</li>";
		
			i++;

		}

		
	
		html += "</ul>";
		
		$("#news-list").html(html);
		$("#list2").listview();
	}
	else {
		// vorbereitetes Hinweisfenster sichtbar machen
		// Text
		$('#news-warning').html('Keine Daten für Anzeige vorhanden');
		if (!kwd_update) $('#news-info').append('<br />Bitte setzen Sie in den Einstellungen Aktualisieren auf "Auto"');
		$('#news-warning').append('<br />'+navigator.connection.type);
		// sichtbar
		$('#box-news-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-news", function() {
	kwd_news2list();
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anews", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_news!=-1 && kwd_readNews()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		$("#page-anews h2").html(kwd_news[kwd_current_news]['name']);
		$("#news-info").html(kwd_news[kwd_current_news]['info']);
		kwd_log(kwd_news[kwd_current_news]['info']);
		//$("#news-info").append('<a href="'+kwd_news[kwd_current_news]['url']+'" target="_blank">'+kwd_news[kwd_current_news]['url']+'</a>');
		$("#news-url").attr("href", kwd_news[kwd_current_news]['url']);
	}
});