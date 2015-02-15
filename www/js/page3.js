/*
 * enthält Scripte für PROJEKTE-Seite und Unterseiten
 * 
 */
var kwd_current_project = -1;

/*
 * writes the markup for the list of projects into the DOM 
 * - uses the CachedWebContent object
 * - no check of the source of the data
 * - all images are given with full path (which is dependent of cache or not) - handled by the object data retrieved 
 */
function kwd_projects2list_oop() {

	try {
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
			html += "<a href=#page-aproject onClick=\"kwd_current_project="+(i)+";\">";
			
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
	
	
		} //try
	catch(e) {
		kwd_log("fehler loop: "+e.message);
		alert(e.message);
	}


}


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
		html += "<ul id=list1 data-role=listview data-inset=true>";

		var curimg = '';
		var i=0;
		// TODO: for mit i verwenden da for in nicht die 
		// richtige Reihenfolge garantiert
		for(var entry in kwd_projects) {
			
			curimg= '';
			
			html += "<li class=aproject>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-aproject onClick=\"kwd_current_project="+(i)+";\">";
			
			// da imgsrc jetzt auch eine Liste enthalten kann(!)
			// nur erstes Bild herausfiltern (kommagetrennte Namen):
			curimg = kwd_projects[i]['imgsrc'];			
			if (curimg.indexOf(',')!=-1) {
				curimg = curimg.substr(0,curimg.indexOf(','));	
			}
			html += '<img style="width:80px" src="'+path+curimg+'" />';
						
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
	//kwd_projects2list();
	kwd_projects2list_oop(); // test the new code 
	$('#page-title').text("Referenzen, Auswahl");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-aproject", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_project!=-1 && kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		//kwd_log('cur='+kwd_current_project);
		//$("#page-aproject h2").html(kwd_projects[kwd_current_project]['name']);
		$('#page-title').text(kwd_projects[kwd_current_project]['name']);
		$("#project-info").html(kwd_projects[kwd_current_project]['info']);
		//$("#project-info").append('<a href="'+kwd_projects[kwd_current_project]['url']+'" target="_blank">'+kwd_projects[kwd_current_project]['url']+'</a>');
		$("#project-url").attr("href", kwd_projects[kwd_current_project]['url']);
	}
});