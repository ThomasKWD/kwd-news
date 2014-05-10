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