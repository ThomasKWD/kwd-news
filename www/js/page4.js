/*
 * enthält Scripte für ANGEBOTE-Seite und Unterseiten
 * 
 */
var kwd_current_offer = -1;

function kwd_offers2list() {

	var offers = kwd.offers.getList(); // get null == no list available
		//kwd_log("len: "+offers.length);

		//kwd_log("iterator dump: "+JSON.stringify(offers, null, 4));
	
	if(offers!==null && offers.hasNext()) {
	
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-offers-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list3 data-role=listview data-inset=true>";

		
		var i=0;
		while(offers.hasNext()){
		
			var o = offers.next();
			
			html += "<li class=anoffer>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-anoffer onClick=\"kwd_current_offer="+(i)+";\">"; //TODO: use id instead of i
			
			// currently no image displayed 
			// da imgsrc jetzt auch eine Liste enthalten kann(!)
			// nur erstes Bild herausfiltern (kommagetrennte Namen):
			//curimg = kwd_offers[i]['imgsrc'];			
			//if (curimg.indexOf(',')!=-1) {
			//	curimg = curimg.substr(0,curimg.indexOf(','));	
			//}
			//html += '<img style="width:80px" src="'+path+curimg+'" />';
			//html += '<img style="height:80px" src="'+path+kwd_offers[i]['imgsrc']+'" />';
 			// http://www.kuehne-webdienste.de/tbd-shot.jpg
			
			html += "<h3>"+o['name']+"</h3>";
			
			//html += "<p>"+o['url']+"</p>"; 

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
	$('#page-title').text("Leistungen");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anoffer", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_offer!=-1) {
		//get certain data entry
		// TODO: the list above should produce an id value ...
		//	 	for kwd_current_offer rather then index i
		var c=kwd.offers.getItem(kwd_current_offer);
		if (c) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		//$("#page-anoffer h2").html(kwd_offers[kwd_current_offer]['name']);
		$('#page-title').text(c['name']);
		$("#offer-info").html(c['info']);
		//$("#offer-info").append('<a href="'+kwd_offers[kwd_current_offer]['url']+'" target="_blank">'+kwd_offers[kwd_current_offer]['url']+'</a>');
		$("#offer-url").attr("href", kwd_offers[kwd_current_offer]['url']);
		}
	}
});