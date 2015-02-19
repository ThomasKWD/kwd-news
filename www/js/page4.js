/*
 * enthält Scripte für ANGEBOTE-Seite und Unterseiten
 * 
 */
function kwd_offers2list() {

	// TODO: as long as we use kust one element ('name'), we could use kwd.offers.getList('name')
	// WARNING!: getList(): code parameter first, then key!
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
			html += "<a href=#page-anoffer onClick=\"kwd.offers.setCurrent("+(i)+");\">"; //TODO: use id instead of i
			
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
		if(kwd.isDevice) $('#offers-info').append('<br />'+navigator.connection.type);		
		$('#box-offers-info').css({'display':'block'}); // sichtbar
	}

}


$( document ).on( "pagebeforeshow", "#page-offers", function() {
	kwd_offers2list();
	$('#page-title').text("Leistungen");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anoffer", function() {
	
	var o = kwd.offers.getItem();
	if (o != null) {
		$('#page-title').text(o['name']);
		$("#offer-info").html(o['info']);
	}
});
