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

	var news = kwd.news.getList(); // get null = no list available
	if (news!= null && news.hasNext()) {	
		
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-news-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list2 data-role=listview data-inset=true>";

		var i=0;
		// TODO: for mit i verwenden da for in nicht die 
		// richtige Reihenfolge garantiert
		while(news.hasNext()) {
			
			curimg='';
			html += "<li class=anews>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-anews onClick=\"kwd_current_news="+(i)+";\">"; // warum onClick??
			
			var n = news.next();
			
			// TODO: if images desired, provide "thumbs" by web

			html += "<h3>"+n['name']+"</h3>";
			
			//html += "<p>"+n['url']+"</p>"; 

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
		if (!kwd_update) $('#news-warning').append('<br />Bitte setzen Sie in den Einstellungen Aktualisieren auf "Auto"');
		if(kwd.isDevice) $('#news-warning').append('<br />'+navigator.connection.type);
		// sichtbar
		$('#box-news-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-news", function() {
	kwd_news2list();
	$('#page-title').text("News");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anews", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_news!=-1 && kwd_readNews()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		//$("#page-anews h2").html(kwd_news[kwd_current_news]['name']);
		$('#page-title').text(kwd_news[kwd_current_news]['name']);
		$("#news-info").html(kwd_news[kwd_current_news]['info']);
		kwd_log(kwd_news[kwd_current_news]['info']);
		//$("#news-info").append('<a href="'+kwd_news[kwd_current_news]['url']+'" target="_blank">'+kwd_news[kwd_current_news]['url']+'</a>');
		$("#news-url").attr("href", kwd_news[kwd_current_news]['url']);
	}
});