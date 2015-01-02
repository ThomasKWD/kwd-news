/*
 * enthält Scripte für ANGEBOTE-Seite und Unterseiten
 * 
 */
var kwd_current_offer = -1;

function kwd_offers2list() {

	var path = kwd_getFilePath(kwd_storage_offers);  // gibt nicht nur Ordner sondern gesamte URL zurück, an die dann filename angehangen wird!!
	kwd_log('offers path: '+path); 
		
	if (kwd_readOffers()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-offers-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list3 data-role=listview data-inset=true>";

		var curimg;
		var i=0;
		for(var entry in kwd_offers) {
			
			curimg='';
			html += "<li class=anoffer>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-anoffer onClick=\"kwd_current_offer="+(i)+";\">"; 
			
			// da imgsrc jetzt auch eine Liste enthalten kann(!)
			// nur erstes Bild herausfiltern (kommagetrennte Namen):
			curimg = kwd_offers[i]['imgsrc'];			
			if (curimg.indexOf(',')!=-1) {
				curimg = curimg.substr(0,curimg.indexOf(','));	
			}
			//html += '<img style="width:80px" src="'+path+curimg+'" />';
			//html += '<img style="height:80px" src="'+path+kwd_offers[i]['imgsrc']+'" />';
 			// http://www.kuehne-webdienste.de/tbd-shot.jpg
			
			html += "<h3>"+kwd_offers[i]['name']+"</h3>";
			
			html += "<p>"+kwd_offers[i]['url']+"</p>"; 

			html += "</a>";
			
			html += "</li>";
		
			i++;

		}

		
	
		html += "</ul>";
		
		$("#offers-list").html(html);
		$("#list3").listview();
	}
	else {
		// vorbereitetes Hinweisfenster aktualisieren
		$('#offers-info').html('Keine Daten für Anzeige vorhanden');
		if (!kwd_update) $('#offers-info').append('<br />Bitte setzen Sie in den Einstellungen Aktualisieren auf "Auto"');
		$('#offers-info').append('<br />'+navigator.connection.type);		
		$('#box-offers-info').css({'display':'block'}); // sichtbar
	}

}


$( document ).on( "pagebeforeshow", "#page-offers", function() {
	kwd_offers2list();
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anoffer", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_offer!=-1 && kwd_readOffers()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		$("#page-anoffer h2").html(kwd_offers[kwd_current_offer]['name']);
		$("#offer-info").html(kwd_offers[kwd_current_offer]['info']);
		kwd_log(kwd_offers[kwd_current_offer]['info']);
		//$("#offer-info").append('<a href="'+kwd_offers[kwd_current_offer]['url']+'" target="_blank">'+kwd_offers[kwd_current_offer]['url']+'</a>');
		$("#offer-url").attr("href", kwd_offers[kwd_current_offer]['url']);
	}
});