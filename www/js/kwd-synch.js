/*
  nachladen der Projekte
  
  * mit JSONP aus jQuery, da andere Domain als Datei
  * oder geht mit speziellen Funktionen aus Phonegap?
  * alle Funktionen setzen voraus, dass sie innerhalb eines $(document).ready(...)-Aufrufs gestartet wurden.  
*/

function ajax_success(data, textStatus, jqXHR ) {
	alert(textStatus);
}
function ajax_error(jqXHR,textStatus,errorThrown) {
	alert(textStatus);
} 

function getResponse(response) {
	
	
	if(response) {
		
		$("#load-result").append('Daten aus dem Internet aktualisiert.');
		
		
		var i=0;
		for(var entry in response) {
			
			if(response[i]['info']=='') $('#projekt' + (i + 1) +' .name').append(response[i]['name']);
			else $('#projekt' + (i + 1) +' .name .namestring').append(response[i]['name']);
			$('#projekt' + (i + 1) +' .info').append(response[i]['info']);
			// make image from kwd-site
			var image_markup = '<img src="http://www.kuehne-webdienste.de/files/'+(response[i]['imgsrc'])+'" />';
			$('#projekt' + (i + 1) +' .image').append(image_markup);
			$('#projekt' + (i + 1) +' .url').append(response[i]['url']);

			$('#projekt' + (i + 1)).slideToggle();
			
			i++;

		}
	}
}


function read_kwd_projects (argument) {
	
	// Abfrage ob Netzwerk-Kommunikation möglich (phonegap)
	// TODO: Auswertung durch caller ermöglichen (Status weiterleiten, evtl. sogar exception handling)
	
	//networkState = navigator.connection.type;
	//if (networkState == Connection.NONE) return null;

	// http://www.interaktionsdesigner.de/2008/08/28/jsonp-und-das-cross-server-scripting/
	// http://remysharp.com/visual-jquery/
	// for phonegap:
	// http://samcroft.co.uk/2012/my-article-for-adobes-appliness-magazine-data-in-phonegap-apps/
    $.ajax({
      dataType: 'jsonp',
      jsonp: 'jsonp_callback',
      //url: 'http://localhost/tk/kwd-news-data/jsonp.php',
      url: 'http://localhost/tk/kwd3_r441/index.php?article_id=10',
      //url: 'http://www.kuehne-webseiten.de/jp.php',
      
    }).success(getResponse).error(function(jqXHR,textStatus,errorThrown){
		alert (textStatus);
	}).complete(function(){
		//alert("fertig");
	});
	
}
	
$(document).ready(function() {
	
	// TODO: do this as loop?
	$('#name1').click(function() {
		$('#projekt1 .info').slideToggle();
		return false;
	});		
	$('#name2').click(function() {
		$('#projekt2 .info').slideToggle();
		return false;
	});		
	$('#name3').click(function() {
		$('#projekt3 .info').slideToggle();
		return false;
	});		
	$('#name4').click(function() {
		$('#projekt4 .info').slideToggle();
		return false;
	});		
	$('#name5').click(function() {
		$('#projekt5 .info').slideToggle();
		return false;
	});		
	$('#name6').click(function() {
		$('#projekt6 .info').slideToggle();
		return false;
	});		
	$('#name7').click(function() {
		$('#projekt7 .info').slideToggle();
		return false;
	});		
	$('#name8').click(function() {
		$('#projekt8 .info').slideToggle();
		return false;
	});		
	$('#name9').click(function() {
		$('#projekt9 .info').slideToggle();
		return false;
	});		
	$('#name10').click(function() {
		$('#projekt10 .info').slideToggle();
		return false;
	});		
	$('#name11').click(function() {
		$('#projekt11 .info').slideToggle();
		return false;
	});		
	
	
	
});


function murks() {
	
		// ajax setup (could be in an own section if several different requests are done)
	$.ajaxSetup({
		url : 'http://localhost/tk/kwd-news-data/jsonp.txt',
		dataType : 'jsonp',
		cache : false,
		//success : ajax_success,
		//error : ajax_error,
		crossDomain : true
	}); 

	// JSONP Funktion
	$.ajax().error(function(jqXHR,textStatus,errorThrown){
		alert (textStatus);
	}).success(function(){
		alert ("Hurra");
	}).complete(function(){
		alert ("Fertig");	
	});

}
