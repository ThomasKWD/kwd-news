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

	
		// sets the code to be done as string
		// ###id### and ###uri### are placeholders to be filled with the proper id (current element in list) and source of file
		// the code then will be eval'd
		// this function is for
		// - set the image source *when the download is finished*, so the rest of the layout doesn't have to wait for the files
		// - have no layout dependend code inside data structures
		// TODO: accomplish this with anonymous  callback function value		
		var code = '$("#projectlist###id###").attr("src","###uri###");';           				

		// first get the proper list of entries (Iterator Object!)
		var projects = kwd.projects.getList(code); // get null = no list available
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
			
			html += '<li class="aproject">';
			
			// click handler über jquery geht in diesem Fall irgendwie nicht
			html += "<a href=#page-aproject onClick=\"kwd.projects.setCurrent("+(i)+");\">";
			// you need a call-back or a add function
			// otherwise you must use the jquery code inside your data objects
			/*
			 
			 kwd.cachedFiles.addFile(p['thumb'],function(){
				$('#projectlist'+i).attr('src',link);           				
			});
			*/
			//kwd.cachedFiles.addFile(p['thumb'],projectsimagecallback);
			//p['thumb'] is usually == placeholder image until file is cached
			//unless file already in cache
			html += '<img  id="projectlist'+i+'" style="width:80px" src="'+p['thumb']+'" />';
			
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
		// sichtbar
		$('#box-projects-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-projects", function() {
	// display only when projects loaded
	// if load not possible, on timeout kwd_project2list_oop will eventually called in any case
	// kwd.projects.load() also invokes update, but you have to call it just once in the app,
	// you can also call kwd.projects.update() seperately and then the code given in load will be used if set
	// TODO: progress indicator inside
	kwd.projects.load(kwd_projects2list_oop);
	$('#page-title').text("Referenzen, Auswahl");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-aproject", function() {
	var code = '$("#projectimage###id###").attr("src","###uri###");';           				
	var p = kwd.projects.getItem(code); // item is preselected by setCurrent
	if (p!=null) {
		$('#page-title').text(p['name']);
		// change all <a> into <span> (TODO: remove all tags)
		var ntext = p['info'].replace(/<a/g,'<span');
		ntext = ntext.replace(/<\/a/g,'</span');
		$("#project-info").html(ntext);
		$("#project-url").attr("href", p['url']); // mehrere wegen Tests
		$("#project-url").text(p['url'].replace('http://',''));
	
		var i = 0;
		var html = '';
		for(i=0;i<p['images'].length;i++) {
			html += '<img id="projectimage'+i+'"src="'+p['images'][i]+'" /> ';
		}
		$("#project-images").html(html);
	}
});
