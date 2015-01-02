/*
 * laden der Projekte aus lokaler DB oder filesystem.
 * 
 *  Recherche:
 * 
 *  $('#main').load('welcome.html');
 * 
 *  diese Zeile lädt die besagte Datei innerhalb eines div id=main (angeblich)
 *  wäre Lösung, wenn man load lokal anwenden kann.
 *  man kann auch einfach .get('...') nehmen
 *  beachte Path-Bildungsfunktionen bei filetransfer
 */

/*
 * alle Variablen global
 */
function kwd_readProjects() {
	
	strread = localStorage.getItem(kwd_storage_projects);
	if (strread==null) {
		kwd_log('konnte Projekte nicht laden');
		kwd_projects = null;
	}
	else {
		kwd_projects = JSON.parse(strread);
		//kwd_log('Projekte geladen');
		kwd_log(kwd_projects);
		kwd_log("Anzahl Projects: "+kwd_projects.length);
	}
	
	if (kwd_projects==null) return false;
	else return true;
}

function kwd_readNews() {
	
	strread = localStorage.getItem(kwd_storage_news);
	if (strread==null) {
		kwd_log('konnte News nicht laden');
		kwd_news = null;
	}
	else {
		kwd_news = JSON.parse(strread);
		//kwd_log('News geladen');
		kwd_log(kwd_news);
		kwd_log("Anzahl news: "+kwd_news.length);
	}
	
	if (kwd_news==null) return false;
	else return true;
}

function kwd_readOffers() {
	
	strread = localStorage.getItem(kwd_storage_offers);
	if (strread==null) {
		kwd_log('konnte offers nicht laden');
		kwd_offers = null;
	}
	else {
		kwd_offers = JSON.parse(strread);
		//kwd_log('Offers geladen');
		kwd_log(kwd_offers);
		kwd_log("Anzahl Offers: "+kwd_offers.length);
	}
	
	if (kwd_offers==null) return false;
	else return true;
}