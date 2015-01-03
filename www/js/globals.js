// Globale Datenstrukturen für Inhalte ---------------------------------------
var kwd_projects = null;
var kwd_news = null;
var kwd_offers = null;
var kwd_files = '';
var kwd_thumbs = '';
/*
 * Konstanten für local-storage
 * der Einfachheit halber global
 */
const kwd_storage_projects = 'projects';   // JSON-String der Projektdaten
const kwd_storage_news = 'news';           // JSON-String der Newsdaten
const kwd_storage_offers = 'offers';       // JSON-String der Angebotsdaten
const kwd_storage_path = 'path';           // Pfad auf Device für Dateien

/*	files ist in der aktuellen Planung ein Array, das nach dem Programmstart
	oder einem erneuten Synch mit dem Web aus den dynamischen Content-Daten (kwd_projects etc.)
	gewonnen wird.
	Dateiname wird aus der Liste gelöscht, wenn Herunterladen *nicht* erfolgreich
	Anhand der Liste mit Lücken kann beim nächsten Anfragen entschieden werden ob versucht wird, Datei aus
	Web anzufordern oder aber aus Cache.
	im local-storage soll Liste erfolgreich heruntergeladener Dateien abgelegt werden (wegen Performance)
	beim nächsten Download werden nur Dateien in Liste berücksichtigt.
	Bei Anzeigefehler muss Datei aus Liste gelöscht werden !!
	
	Im ersten Test nur für Download-Liste verwendet.
	files werden im filesystem des Device unter ihrem ursprünglichen Namen gespeichert.
*/
const kwd_storage_files = 'files';         // Liste der Dateien // TODO: auch als JSON?(dann mit Status-Infos)

/*	siehe unter kwd_storage_files parallel für thumbs
	thumbs werden im filesystem des Device mit prefix "thumb-" gespeichert.
*/
const kwd_storage_thumbs = 'thumbs';       // Liste alternativer Dateien (Vorschaubilder)

/*
 * globale Schalter
 * 
 */
kwd_update=true;

