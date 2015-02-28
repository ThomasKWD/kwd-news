/*
 * enthält Scripte für NEWS-Seite und Unterseiten
 * 
 */

// getList or getItem could also be delivered  by function parameter (see CachedContent object)
function kwd_news2list() {

	// WARNING!: getList(): code parameter first, then key!
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
			html += "<a href=#page-anews onClick=\"kwd.news.setCurrent("+(i)+");\">"; // warum onClick??
			
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
		// sichtbar
		$('#box-news-info').css({'display':'block'});
	}

}


$( document ).on( "pagebeforeshow", "#page-news", function() {
	kwd.news.load(kwd_news2list);
	$('#page-title').text("News");
});

// TODO: on pageshow ist etwas spät. gibt es auch before show oder on create??
$( document ).on( "pagebeforeshow", "#page-anews", function() {
	// der Einfachheit halber Select des Contents über Variable
	// TODO: durch getItem wird bestimmt ob current -1!!!
	n=kwd.news.getItem(); // n==null means current=-1(no current available!)
	if (n!==null) {	// immer laden, da seit dem letzten Laden eine Aktualisierung gewesen sein könnte.
		//$("#page-anews h2").html(kwd_news[kwd_current_news]['name']);
		$('#page-title').text(n['name']);
		// change all <a> into <span> (TODO: remove all tags)
		var ntext = n['info'].replace(/<a/g,'<span');
		ntext = ntext.replace(/<\/a/g,'</span');
		$("#news-info").html(ntext);
		//no url up to now (share link is handled elsewhere!)
		//$("#news-info").append('<a href="'+kwd_news[kwd_current_news]['url']+'" target="_blank">'+kwd_news[kwd_current_news]['url']+'</a>');
		// TODO: share link code HIER setzen, statt in index.js
	}
	else { kwd_log("current news item not available");}
});