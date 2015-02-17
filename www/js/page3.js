/*
 * enthält Scripte für PROJEKTE-Seite und Unterseiten
 * 
 */

/*
 * writes the markup for the list of projects into the DOM 
 * - uses the CachedWebContent object
 * - no check of the source of the data
 * - all images are given with full path (which is dependent of cache or not) - handled by the object data retrieved 
 */
function kwd_projects2list_oop() {

	
		// first get the proper list of entries (Iterator Object!)
		var projects = kwd.projects.getList(); // get null = no list available
		//kwd_log("len: "+projects.length);

		//kwd_log("iterator dump: "+JSON.stringify(projects, null, 4));
	
	if(projects!==null && projects.hasNext()) {
		
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-projects-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list1 data-role=listview data-inset=true>";

		var i=0;

		while(projects.hasNext()) {
			
			
			var p = projects.next();
			//kwd_log(p);
			
			html += "<li class=aproject>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-aproject onClick=\"kwd.projects.setCurrent("+(i)+");\">";
			
			// da imgsrc jetzt auch eine Liste enthalten kann(!)
			// nur erstes Bild herausfiltern (kommagetrennte Namen):
			html += '<img style="width:80px" src="'+p['thumb']+'" />';
			//kwd_log(p['thumb']);
			//kwd_log("wrote:"+p['thumbsrc']);
						
			html += "<h3>"+p['name']+"</h3>";
			
			// für Listenausgabe Protokoll-Präfix abschneiden
			html += "<p>"+p['url'].replace('http://','')+"</p>"; 

			html += "</a>";
			
			html += "</li>";
		
			i++;

		}
	
	
		html += "</ul>";
		
		$("#project-list").html(html);
		$("#list1").listview();
	}
	else { // if no elements
		// vorbereitetes Hinweisfenster sichtbar machen
		// Text
		$('#projects-info').html('Keine Daten für Anzeige vorhanden');
		if (!kwd_update) $('#projects-info').append('<br />Bitte setzen Sie in den Einstellungen Aktualisieren auf "Auto"');
		if (kwd.isDevice) $('#projects-info').append('<br />'+navigator.connection.type);
		// sichtbar
		$('#box-projects-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-projects", function() {
	kwd_projects2list_oop(); // new code 
	$('#page-title').text("Referenzen, Auswahl");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-aproject", function() {
	var p = kwd.projects.getItem(); // item is preselected by setCurrent
	if (p!=null) {
		// TODO: code for images
		$('#page-title').text(p['name']);
		$("#project-info").html(p['info']);
		$("#project-url").attr("href", p['url']);
	
		var i = 0;
		var html = '';
		for(i=0;i<p['images'].length;i++) {
			html += '<img src="'+p['images'][i]+'" /> ';
		}
		$("#project-images").html(html);
	}
});
