var kwd_current_project = -1;

function kwd_projects2list() {
	
	if (kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		
		var html = "";
		html += "<ul id=list1 data-role=listview>";


		var i=0;
		for(var entry in kwd_projects) {
			
			html += "<li class=aproject>";
			
			// click handler über jquery geht irgendwie nicht
			html += "<a href=#page-aproject onClick=\"kwd_current_project="+(i)+";\">";
			
			html += '<img style="height:80px" src="http://www.kuehne-webdienste.de/index.php?rex_img_type=projektvorschau&rex_img_file='+kwd_projects[i]['imgsrc']+'" />';
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

}


$( document ).on( "pageshow", "#page-projects", function() {
	kwd_projects2list();
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pageshow", "#page-aproject", function() {
	// der Einfachheit halber Select des Contents über Variable
	if (kwd_current_project!=-1 && kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		kwd_log('cur='+kwd_current_project);
		$("#project-info").html(kwd_projects[kwd_current_project]['info']);
		//$("#project-info").append('<a href="'+kwd_projects[kwd_current_project]['url']+'" target="_blank">'+kwd_projects[kwd_current_project]['url']+'</a>');
		$("#project-url").attr("href", kwd_projects[kwd_current_project]['url']);
	}
});

