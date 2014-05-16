/*
 * enthält Scripte für PROJEKTE-Seite und Unterseiten
 * 
 */
var kwd_current_project = -1;

/*TODO:
 * - wenn path ok aber keine Bilder vorhanden sieht man nichts
 * (wie prüfen, ob Bilder im Cache??) 
 * - wenn keine Projekte in local storage gefunden *nicht* noch einmal update starten, sondern nur Hinweis auf offline!! 
 */
function kwd_projects2list() {

	var path = kwd_getFilePath(kwd_storage_projects);  // gibt nicht nur Ordner sondern gesamte URL zurück, an die dann filename angehangen wird!!
	kwd_log('projects image path: '+path);
		
	if (kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		
		// vorher ggf. angezeigten Warnhinweis verstecken
		$('#box-projects-info').css({'display':'none'});		
		
		var html = "";
		html += "<ul id=list1 data-role=listview>";


		var i=0;
		for(var entry in kwd_projects) {
			
				html += "<li class=aproject>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-aproject onClick=\"kwd_current_project="+(i)+";\">";
			
			html += '<img style="height:80px" src="'+path+kwd_projects[i]['imgsrc']+'" />';
 // http://www.kuehne-webdienste.de/tbd-shot.jpg
			
			html += "<h3>"+kwd_projects[i]['name']+"</h3>";
			
			html += "<p>"+kwd_projects[i]['url']+"</p>"; 

			html += "</a>";
			
			html += "</li>";
		
			i++;

		}

		
	
		html += "</ul>";
		
		$("#project-list").html(html);
		$("#list1").listview();
	}
	else {
		// vorbereitetes Hinweisfenster sichtbar machen
		// Text
		$('#projects-info').html('Keine Daten für Anzeige vorhanden');
		if (!kwd_update) $('#projects-info').append('<br />Bitte setzen Sie in den Einstellungen Aktualisieren auf "Auto"');
		$('#projects-info').append('<br />'+navigator.connection.type);
		// sichtbar
		$('#box-projects-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-projects", function() {
	kwd_projects2list();
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-aproject", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_project!=-1 && kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		//kwd_log('cur='+kwd_current_project);
		$("#page-aproject h2").html(kwd_projects[kwd_current_project]['name']);
		$("#project-info").html(kwd_projects[kwd_current_project]['info']);
		//$("#project-info").append('<a href="'+kwd_projects[kwd_current_project]['url']+'" target="_blank">'+kwd_projects[kwd_current_project]['url']+'</a>');
		$("#project-url").attr("href", kwd_projects[kwd_current_project]['url']);
	}
});