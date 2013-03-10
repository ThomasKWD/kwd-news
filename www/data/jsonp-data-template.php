<?
/* TEMPLATE: project-data JSONP
 * PROJECT:  kuehne-webdienste.de
 * CMS:      Redaxo.org
 * Author:   Thomas K�hne
 * ------------------------------
 * 
 * erzeuge Liste aller Subkategorien der, zunächst nur die Namen. (findet also Projekte nur in Subkategorien der akt. Kategorie)
 * 
 * TODO: mit Funktion tk_kwd_projectlist zusammenführen!
 * 
 * (Diese Datei muss nach Commit in Redaxo Template einkopiert werden)
 */
 
 function getImageContens($name='')
 {
 	$path = 'files/'.$name;
	$test = file_get_contents($path); // includes header data
	// use image functions!
 }
 
 $list = array ();
 
 $startcat = OOCategory::getCategoryById($this->getValue('category_id'));
 $children = $startcat->getChildren();
 $i=0;
 foreach($children as $child) {
 	$list[$i]['name'] = $child->getValue('name');
	// suche nach erstem slice mit richtigem Modultyp
	$slice = OOArticleSlice::getFirstSliceForArticle($child->getValue('id')); //Startartikel der jew. Kat.
	// vorab setzen:
	$list[$i]['info'] = $list[$i]['url'] = $list[$i]['imgsrc'] = '';
	// slices suchen;
	while($slice) {
		if ($slice->getValue(10)=='REX_MODULE_REFERENZ') {
			if(OOAddon::isAvailable("textile"))
			{
				$textile = htmlspecialchars_decode($slice->getValue(1));
      			$textile = str_replace("<br />","",$textile);
      			$list[$i]['info'] = rex_a79_textile($textile);
			}
			else $list[$i]['info'] = $slice->getValue(1);
			$list[$i]['url'] = $slice->getValue(2);
			// extract src of first image
			$ml = $slice->getMediaList(1);
			$cut = strpos($ml,',');
			if ($cut!==false)$ml=substr($ml,0,$cut);
			$list[$i]['imgsrc'] = $ml;
			//getImageContens($ml);
			break; // only take first proper slice
		}
		$slice = $slice->getNextSlice();		
	}
	$i++;
 }
 
 $data = json_encode($list);
 echo $_GET['jsonp_callback'] ."(". $data .");";
 
?>