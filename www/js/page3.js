
function kwd_projects2list() {
	

	if (kwd_readProjects()) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		
		var html = "";
		html += "<ul id=list1 data-role=listview>";


		var i=0;
		for(var entry in kwd_projects) {
			
			html +=   "<li>";
			
			html += "<a href=#page-project>";
			
			html +=     '<img style="height:80px" src="http://www.kuehne-webdienste.de/index.php?rex_img_type=projektvorschau&rex_img_file='+kwd_projects[i]['imgsrc']+'" />';
 // http://www.kuehne-webdienste.de/tbd-shot.jpg
			
			html +=     "<h3>"+kwd_projects[i]['name']+"</h3>";
			
			html +=     "<p>"+kwd_projects[i]['url']+"</p>"; 

			html += "</a>";
			
			html +=   "</li>";
		
			i++;

		}

		
	
		html += "</ul>";
		
		$("#project-list").html(html);
		$("#list1").listview();
	}

}


$( document ).on( "pageshow", "#page-projects", function() {
	kwd_projects2list();
 // hier Abfrage einzelner pages möglich??
	
    // Each of the four pages in this demo has a data-title attribute
    // which value is equal to the text of the nav button
    // For example, on first page: <div data-role="page" data-title="Info">
    //var current = $( this ).jqmData( "title" );
    // Change the heading
    //$( "[data-role='header'] h1" ).text( current );
    
});

