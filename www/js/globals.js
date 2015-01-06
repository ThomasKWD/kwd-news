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

/*
Entwurf eines kwd Object, das globale Strukturen
kapselt, alles was bisher "herumschwirrte",

 sogar debug, obwohl dies eigenständiges Object sein
 sollte

*/
function KwdApp()	 {
	
	// public properties
	this.cache = new CachedWebContent({ 
		remote : 'http://www.kuehne-webseiten.de/index.php?article_id=',
		local : 'http://localhost/tk/kwd-redaxo-46/index.php?article_id='
	 });
	
	//construct code
	kwd_log('starting oop test');

	// public methods
	this.testIt = function(key) {
		
		// ugly code just for test
		kwd_readProjects();
		if (kwd_readProjects===null) {
			kwd_log('no test data');
			return null;
		}
		else return new KwdIterator(kwd_projects,key);			
	};
}

/*
da nicht ECMA 6 überall vorausgesetzt werden kann,
eigenes Iterator-Konzept.

Zunächst nur für mehrdimensionale Arrays konzipiert.
*/
function KwdIterator(source, key) {
	// public properties

	// private properties
	var length;
	// enthält Schlüsselwort um zu spezifizieren, was aus den Daten gewünscht ist
	//(sozusagen Erwaiterung des Iterator-Konzepts)
	var sourcekey; 
	var data;
	var i = 0;
	
	//kwd_log('iterator instance');
	sourcekey = key;
	data = source;
	length = source.length;

	// public methods
	this.next = function() {
		var entry;
		// Liefere nächstes Element
		// doppelte Sicherheit i<length?
		if(i<length) {
			if (key!='') entry = data[i][key];
			else entry = data[i];
			i++;
			return entry;
		}
		else return null;
	}
	this.hasNext = function() {
		//kwd_log('length:'+length);
		if (i<length) return true;
		else return false;
	};
	// aus Performance-Gründen kann man mit dem gleichen Objekt von vorn beginnen
	// obwohl es aus 
	this.rewind = function() {
		i = 0;
	};
	//helper(mostly for debug)
	this.getKey = function() {
		return sourcekey;
	};
}

/*
Iterator mit Features
key: definiert einen Filter (entspricht array key von JSON-Daten von web, 
mehrere keys oder Ausdrücke geplant
*/
/*
 *
 * function KwdSelector() {
}
*/

/*
im folgenden werden die Vererbungshierarchien festgelegt
*/