
	/* start javascript */


function kwd_showByClass(setclass) {
	// TODO: problem if was inline
	var els = document.getElementsByClassName(setclass);
	for(var i=els.length-1;i>=0;i--) {
		els[i].style.display = 'block';
	}
}

function kwd_hideById(setid) {
	
	// TODO: Teste, ob dies konsistent!!: 
	//document.getElementById(setid).kwdLastDisplay = 'andreas';
	document.getElementById(setid).style.display = 'none';	 

}
function kwd_showById(setid,reset_to) {
	if(!reset_to) reset_to = 'block';
	document.getElementById(setid).style.display = reset_to;
}


// still faster than ...Html -> nodeValue
function kwd_setElementText(element,str) {
		
	if (element.charAt(0)=='.') {
		element = element.substr(1);
		//app.Debug('found class: '+element);
		var els = document.getElementsByClassName(element);
		//app.Debug(els.length);
		//var content;
		for(var i=els.length-1;i>=0;i--) {
			//content = els[i].innerHTML;
			//app.Debug(content);
			// if 'span' don't use childNodes
			if( els[i].childNodes.length) 			
				els[i].childNodes[0].nodeValue = str;
			else els[i].innerHTML = str;
		}
	}
	else {
		// TODO: check if there are more possibilities than # at start!!
		element = element.substr(1);
		//app.Debug(element);
		var el = document.getElementById(element);
		if (el) el.childNodes[0].nodeValue = str;		
	}
}

// TODO: still faster when already known whether class or id
function kwd_setElementHtml(element,str) {
		
	if (element.charAt(0)=='.') {
		element = element.substr(1);
		//app.Debug('found class: '+element);
		var els = document.getElementsByClassName(element);
		//app.Debug(els.length);
		//var content;
		for(var i=els.length-1;i>=0;i--) {
			//content = els[i].innerHTML;
			//app.Debug(content);
			els[i].innerHTML = str;
		}
	}
	else {
		// TODO: check if there are more possibilities than # at start!!
		element = element.substr(1);
		//app.Debug(element);
		var el = document.getElementById(element);
		if (el) el.innerHTML = str;		
	}
}

// class for global vars
// kta = ...
function KwdTachoApp() {
	
	// public constants
	this.STAGE_BASIC = 'basic';
	this.STAGE_PLUS = 'plus';
	this.STAGE_PREMIUM = 'premium';
	
	// public members
	this.language = 'en';
	this.tachounit = 'kmh';
	this.clockseconds = true;
	this.browsermode = false; // true: run in browser with 'emulator'(droidscript.js)
	this.androidmode = false;
	this.stage = '';     // 'basic'|'plus'|'premium'
	this.kstage = null; // will be set with object
	this.nojquery = false;
	this.version = 1.51; // may be overwritten by value from kwdTachoVersion 
	this.defaultMargin = 10;
	this.debug = true;
	this.mydebug = null; // for DS debug object
	this.tablet = false;
	this.menuscrollinfo = 0; // to hide hint for "swipe up"  after 2-3 uses (>1 : turn off)

	//this.maxaverage_standalone = false; // TODO: geplant für  Anzeige, wenn analog-Display aus
	this.maxaverage_infopos = [0.7, 0.6, 0.32];
	
	this.storage = {
		language : 'tacholanguage',
		average_no_groups : 'tachoaveragenogroups',
		maxspeed_time : 'tachomaxtime'
	};

	this.menubutton = null; 
	
	// private members
	var fastoptions = true;

	// TODO: function for hud!!
	
	/* - gives the current fast-option state when first param undefined
	 * - also depending on state of hud-mode (hud: true |false)
	 * - sets fastoption with first param fast_on
	 * - 2nd param showhints is useful for calling this function on app init
	 */
	this.fastOptions = function(fast_on, showhints)
	{
		if (fast_on !== undefined)
		{
			var elfas = (document.getElementById('switchfastoptions')).getElementsByClassName('fa');
			if (elfas.length !=1) throw '>1 .fa inside #switchfastoptions';
		
			if(fast_on) {
				elfas[0].classList.add('icon-lock-open');
				elfas[0].classList.remove('icon-lock');
				if (showhints!==false) showHint('Touch meters to change','Auf Anzeigen tippen für Umschaltungen');
				fastoptions = true;
				return true;
			}
			else {
				elfas[0].classList.remove('icon-lock-open');			
				elfas[0].classList.add('icon-lock');
				if (showhints!==false) showHint('Go to settings to change meters','Änderungen nur in den Einstellungen');
				fastoptions = false;
				return false;
			}
		}

		// *always* return current (new) state:
		if (gpstool && gpstool.isHud()) return false;
		if (!fastoptions) return false;
		return true;
	};
	
	/* setzt die gewünschte Skin
	 * - skin wenn keine id:  je nach aktuellen Einstellungen 
	 
	 */
	this.setSkin = function (id) {
		
		if(!id) {
			if (settings.get('setskin-glass')==true) id = 'setskin-glass';			
			else if (settings.get('setskin-subtle')==true) id = 'setskin-subtle';
			else id = 'setskin-default'; 			
		}
		
		var skinclass='';
		
		switch (id) {// verarbeitet auch undefined??
			case 'setskin-glass': skinclass = 'skin-plastic'; 
				break;
			case 'setskin-subtle': skinclass = 'skin-subtle';
				break;
		}	
		
		// ! 'skin-default' wird durch löschen der anderen skin-klassen erreicht

		var skinelements = document.getElementsByClassName('skin');
		for (var i=skinelements.length-1;i>=0;i--) {
			//app.Debug(skinelements[i])
			var s = skinelements[i];
			s.classList.remove('skin-plastic'); // geht nur, wenn überflüssiger remove NICHT zu error führt
			s.classList.remove('skin-subtle');
			if(skinclass) s.classList.add(skinclass);
		}		
		
		// TODO: check ob beide nötig:, auch scaleDisplays
		scaleDisplays();
		positionDisplays();

	}; 
	
	/* zentriert dialog
	 * - geht nur, wenn sichtbar!!
	 */
	this.centerVisibleDialog = function(id) {
		
		if(!id) {
			throw 'kwd: no id in centerVisibleDialogs';
			var els = document.getElementsByClassName('dialog');
		}
		else {
			var el = document.getElementById(id);
			if(el) {
			    //if (!getDisplayWidth()) app.ShowPopup("dialog w=0 : "+id);
				el.style.left = ((getDisplayWidth() - el.offsetWidth) / 2) + 'px';								
    			
                if(id=='settingsdialog') {        
                    // Exit-button in fixed umwandeln, dazu Größe speichern (von auto auf px)
                    // - muss sichtbar sein
                    if(el.offsetHeight > getDisplayHeight()) {
                        
                        var eb = document.getElementById('exit-button-bg');
                        var ebwrap = document.getElementById('exitbutton-wrapper');
                        if (eb && eb.offsetWidth) {
                            eb.style.width = el.clientWidth + 'px';
                            //eb.style.height = eb.offsetHeight + 10 + 'px';
                            eb.style.position = 'fixed';
                            eb.style.bottom = '0px';
                           // eb.style.paddingBottom = '10px';
                            eb.style.backgroundColor = '#000000';
                            ebwrap.style.width = el.clientWidth + 'px';
                            ebwrap.style.height = eb.offsetHeight + 10 + 'px';
                            
                        }
                        //else throw 'cannot resize exit button';
                        // TODO: Hinweis später wieder weg.
                        if (kta.menuscrollinfo <2) showHint('Swipe up to see all','Menü nach oben schieben');
                        kta.menuscrollinfo ++;
                    }
                    else {
                        var eb = document.getElementById('exit-button-bg');
                        var ebwrap = document.getElementById('exitbutton-wrapper');
                        if (eb && eb.offsetWidth) {
                            eb.style.position = 'static';
                            eb.style.width = 'auto';
                            eb.style.height = 'auto';
                            eb.style.bottom = 'auto';
                            eb.style.backgroundColor = 'transparent';
                            ebwrap.style.width = 'auto';
                            ebwrap.style.height = 'auto';
                        }
                        //else throw 'cannot resize exit button';
                        
                    }
                }
        	}
    
		}    		
	};

	this.initMenuButton = function(id, enabled)
	{
		this.menubutton = new MenuButton(id,enabled);		
	};
	
	// construct
	if(kwdTachoVersion) this.version = kwdTachoVersion;
	if(kwdProjectStage) this.stage = kwdProjectStage;
	else this.stage = this.STAGE_BASIC;
	if(kwdDebugMode!==undefined) this.debug = kwdDebugMode; // can also be == false
	
	switch(this.stage) {
		case this.STAGE_BASIC : this.kstage = new KwdStageBasic(this); break;
		case this.STAGE_PLUS :  this.kstage = new KwdStagePlus(this); break;
		case this.STAGE_PREMIUM : this.kstage = new KwdStagePremimum(this); break;
		default: throw  "no project stage defined";
	}
	
	if(app.android_sdk) {
		app.Debug("Android SDK mode found");
		this.androidmode = true;
	}	
}


kta = new KwdTachoApp();

// Konstanten
const storage_settings = 'kwd_tacho_settings';
const storage_tachorange = 'tachorange'; 
const storage_tachocurrentmax = 'tachocurrentmax'; // meint Höchstgeschwindigkeit
//const storage_tachoaverage = 'tachoaveragegroups'; // vorbehalten, um vo aktueller average-speicherung zu unterscheiden 
var tacho_defaultrange = 200;
var layout_gauges = 0; // counts number of displayed components (for layout and messages)
var clock_visible = false; // to check if Geoloaction can be paused
var clock_interval = null; // will be cleared if clock hidden (for performance)
var gpswarning_blinkinterval = null; 
var gpswarning_timeout = null;
var gpswarning_active = false; // saves state of warning (performance)
var cssgauge_visible = true; // will be set/unset by setTachoLayout  (performance)

// recognize browser
 
 

/* set language by adding/removing classes
 * lang: auto|en|de
 * 
 */
function setLanguage(lang) {

	//app.Debug('lang loaded: '+lang);
	if(!lang || lang=='auto') {
		lang = (app.GetLanguageCode()).toLowerCase(); // ! overwrite parameter value
	    if (lang=='de' || lang=='at' || lang=='li') lang = 'de'; // ! default language: en
	    else lang = 'en';
	}
	
	var elbody = (document.getElementsByTagName('body')[0]); // body is inside an array!
	if(elbody) {
		// TODO: use classList.toggle
		//$('body').removeClass('en'); // works because multiple addClass do not add more classes :-)
		elbody.classList.remove('en');	 	// check if throws error when already gone !
		//$('body').removeClass('de'); // works because multiple addClass do not add more classes :-)
		elbody.classList.remove('de');
		//$('body').addClass(lang);
		elbody.classList.add(lang); // can also be a cas of WAIT needed!
	}
	
    // make some dialogs height depending on main menu
	// outerheight -> corresponds to box-sizing!
	// must be done here because on initApp are both languages displayed + height could change with language

	//$('.sub-dialog').css('min-height',$('#settingsdialog').outerHeight()+'px');
	// TODO: cannot work when all dialogs are hidden!
	// - entweder in menustackpush als var speichern
	// - oder hier alle dialoge sichtbar machen, dann setzen, dann wieder verstecken außer den aktuellen
	// - eventuell nicht so wichtig, wenn Hintergrund abgedunkelt/aufgehellt bei Menüs (wie Diaschau auf website)
	var setheight = document.getElementById('settingsdialog').offsetHeight + 'px';
	var els = document.getElementsByClassName('sub-dialog');
	for(var i=els.length-1;i>=0;i--) {
		els[i].style.minHeight = setheight + 'px';
	}

	kta.language = lang;
}


/* shows message depending on language
 * - first msg: in default language
 * - second msg (optionl): in second language (now just german)
 * - TODO: make sure not called before app object 'kta' is set
 * - TODO: for more than 2 languages use array or html-texts with ids which are read by jQuery
 */
function showHint (msg,msg_de) {
	if(displayHints) {
		if (msg_de && kta.language=='de') app.ShowPopup(msg_de,"Bottom");
		else app.ShowPopup(msg,"Bottom");
	}
}

/* when infocard is demanded
 * (currently there is just one entry point, but...)
 */
function showAppInfo() {
	kta.kstage.changeAdBanner(0,0,false);
    menustack.push('infocard');
}

/* starts gps sensor 
 * - checks if clock is the only display, then don't start + even stop when already running
 * - doesn't check if max/average enabled since it will be handled in stopGps()  
 
 * TODO: useful to wait until warning at app start is gone??
 */
var gps_running = false; // prevent loc.Start() if running OR loc.Stop() if already stopped
function startGps() {
	if (typeof loc != 'undefined') {
		var clockonly = (layout_gauges==1 && clock_visible) ? true : false; // TODO could use value from displays list
		// negate clockonly when max/average is active
		
		
		if (!clockonly && !gps_running) {
			loc.Start();
			gps_running = true;
		} 
		else if (clockonly) {
			stopGps();
		} 
	}
}
/* stops gps sensor
 * - prevents multiple send stop command
 * - does NOT stop when max/average are enabled
 */
function stopGps() {
	if (gps_running && (typeof loc != 'undefined') 
		&& (typeof settings != 'undefined')
		&& (settings.get('switchmaxaverage')==false)) {
			
		loc.Stop();
		gps_running = false;
	}
}

var gps_blinking = false;
function gpsBlink() {
	var color = (gps_blinking) ? '#dd0000' : 'black';
	//$('.gps-warning').css('color',color);
	var els = document.getElementsByClassName('gps-warning');
	for(var i=els.length-1;i>=0;i--) {
		els[i].style.color = color;
	}
	// experimental: also accuracy
	if (displayAccuracy && displayAccuracy.isVisible()) document.getElementById('accuracytext').style.color = color;

	gps_blinking = !gps_blinking;
}
/* sets colors and warning text
 * - called by timeout or directly
 */
function setGpsWarning() {
	if(!gpswarning_active) {
		
	    var els = document.getElementsByClassName('gps-warning');
	    for(var i=0; i < els.length; i++) {
	 	  	els[i].style.display = 'block'; // TODO: check if is not inline!
	    }
		// hide warning label again if accuracy visible
	   	//if(displayAccuracy && displayAccuracy.isVisible())
		// {			
	    	// kwd_hideById('gpswarning'); // TODO: don't show when Accuracy is currently displayed
		// }
	    	

	    
	    //$('.gps-no-warning').hide();
	    var els = document.getElementsByClassName('gps-no-warning');
	    for(var i=0; i < els.length; i++) {
	    	els[i].style.display = 'none'; 
	    }
	   
		//$('.gps').addClass('no-gps');
	    var els = document.getElementsByClassName('gps');
	    for(var i=0; i < els.length; i++) {
	    	els[i].classList.add('no-gps'); 	    
	    }
		
		// set accuracy Text without val
   		kwd_setElementText('#accuracytext','GPS ?');   		 	       
 
		gpswarning_blinkinterval = setInterval(gpsBlink,500);
		gpswarning_active = true;
	}	
}
/* removes colors and warning text
 * - usually called only directly
 * - resets the timeout 
 */
function clearGpsWarning() {
	if(gpswarning_active) {
	    //document.getElementById('gpswarning').style.display = 'none'; // TODO: check if is not inline!
	    var els = document.getElementsByClassName('gps-warning');
	    for(var i=0; i < els.length; i++) {
	    	els[i].style.display = 'none'; 
	    }
		
	    //$('.gps-no-warning').show();
	    var els = document.getElementsByClassName('gps-no-warning');
	    for(var i=0; i < els.length; i++) {
	    	els[i].style.display = 'block'; // TODO: check if is not inline! 
	    }
	    
		//$('.gps').removeClass('no-gps'); // check if without . (dot)	
	    var els = document.getElementsByClassName('gps');
	    for(var i=0; i < els.length; i++) {
	    	els[i].classList.remove('no-gps'); 	    
	    }		
		
		if(gpswarning_blinkinterval!==null) clearTimeout(gpswarning_blinkinterval);
		gpswarning_active = false;
	}
	if(gpswarning_timeout!==null) clearTimeout(gpswarning_timeout);
	gpswarning_timeout = setTimeout(setGpsWarning,6000); // 6s is a matter of fealing :-)
}

//var previous_time = 0; // save time for check (for performance)
var previous_minutes = -1;

/* refresh display of clock
 * - called only as interval callback
 * - disabled when clock hidden (so you don't have to check this here)
 * TODO: check whether minutes/hours have changed before calling jQuery  
 */
function changeTime() {
	
    var date = new Date();
    
    if(kta.clockseconds) {
    	var s = date.getSeconds();
	    s = ":"+((s < 10) ? "0" + s : s);
	    //$('#seconds-text').text(s);
	    document.getElementById('seconds-text').childNodes[0].nodeValue = s;	
	}
    // minutes and hours are only formatted + displayed when changed:
    var m = date.getMinutes();
    if(m!=previous_minutes) {
	    previous_minutes = m;	    
	    m = ":"+((m < 10) ? "0" + m : m);
   	    var h = date.getHours();
	    h = ((h < 10) ? "0" + h : h);
	    //$('#time-text').text(h+m);
	    document.getElementById('time-text').childNodes[0].nodeValue = h+m;	
    }
    
    // this prevents warning when clock is used alone
    if (layout_gauges==1) clearGpsWarning();
} 
function startClock() {
	previous_minutes = -1; // to ensure update on restart
	clock_interval = setInterval(changeTime,1000);
	clock_visible = true;
}
function stopClock() {
	if (clock_interval !== null) clearInterval(clock_interval);
	clock_visible = false;
}

function OnConfig() {
    //ATTENTION!: don't check screen rotation result here, 
    // since width and height are still old values in WebView!
    // see $(window.resize(...)
}

//Called when application is paused.
function OnPause() 
{ 
    if (typeof settings !== 'undefined') settings.save();    
    app.PreventScreenLock(false);
	if(kta.androidmode) app.SetScreenMode('Normal');
    // --> TODO: ein flag setzen, so dass gpstool.change darauf reagieren und z.B. nur die wichtigsten Sachen machen
    // kann, z.B. nur die Werte weiter verarbeiten, die die für die Statistik erforderlich sind.
    if (typeof gpstool !== 'undefined') gpstool.saveAverage();
    
    stopGps(); // ! stop is not performed when max/average on  
}
 
// TODO: check what it does when inside menu?
// --> the double check should prevent fade
function OnResume() 
{ 
	app.Debug('OnResume');
    app.PreventScreenLock(true);
    
    startGps();
    if (typeof gpstool !== 'undefined') {
    	if (gpstool.isHud()) if(kta.androidmode) app.SetScreenMode('Full'); // TODO: evtl. in mächster DroidScript Version geändert
    	gpstool.loadAverage();
    }
    resetHud();
}

// back button hides open dialogs or screen modes like hud
function OnBack()
{
    if (kta.browsermode) app.Debug('OnBack'); // why cannot see this msg??
    
	// check if there is any open menu
	// otherwise show main menu
	if(!menustack.current()) 
	{
		kta.menubutton.show();
		menustack.push('settingsdialog');
		// TODO: control if ad banner hides menu entries
		kta.kstage.changeAdBanner(0,0,true);
	}
	else {
		menustack.pop(); // you can read the popped element and react!
	    
	}
	
	if(menustack.current()!==false) {
		resetMenuFade();
		//kta.menubutton.hide();
	}
	else 
	{
		// case: all menus have been closed right now
		//kta.kstage.changeAdBanner(0,0,true);
		kta.kstage.startBannerCounter();
	}
	
	resetHud(); 
	// TODO: irgendwie scheint das resetHud erst bei Klick *im* Hauptmenü zu reagieren
}

// my own app.Exit wrapper, app.Exit() must not exist more than once!
// (so i control things much better!!)
function Quit() {
    OnPause();  // nach neuesten Tests nicht automatisch // TODO: Achtung! by android-sdk automatisch!!
    stopGps();
    app.Exit();
}

/* hardware menu button
*/
function OnMenu( name )
{                
    if(menustack.current()!='settingsdialog') menustack.clear();
    OnBack(); // if not cleared -> this closes main menu
}



//Called when we get a change in location.  
// TODO: find out why direct setting og gpstool as callback didn't work (maybe write as string?)
function loc_OnChange( data ) 
{ 
    gpstool.change(data);
} 

/* TODO: better receive gauge as var instead of using the global var
*/
// class
function KwdGpsTools () {
    //private:
    var that = this;
    
    var speed = 0;        // aktueller/letzter Wert
    var speedfactor = 3.6; // wird geändert abhängig von gewählter Maßeinheit
    var speedunittext = 'km/h';

    var lat = 0;
    var lon = 0;
    var locformat = true; // if true format in ° ' ", otherwise float val

    var alt = 0;
    var altfactor = 1;  // wird geändert abhängig von gewählter Maßeinheit // TODO: could be a "unit enabled object" like a speed 
    
    var accuracy; // valid until new value !=0 found
    
    var hud = false;
    var maxspeed = 0; 
    var maxspeedtime = 0;
    var tachorange = 10;
    var dochangetachorange = false;

	var maxaverage_show = true;
	
    var average_list = [];
    var average_speed = 0; // aktueller Wertin m/s, damit ohne Berechnung refresh möglich
    var average_newentry = false; // signals that e new entry must be added (program start)
    //var average_old_sum = 0; // all old values together
    //var average_old_n = 0; // all old values together
 
 	this.speedFactor = function(newfactor,factortext) {
 		if (newfactor) {
 			speedfactor = newfactor;
 			speedunittext = factortext;
 		}	
 		return speedfactor;
 	};
 	
 	this.altitudeFactor = function(newfactor) {
 		if (newfactor) {
 			altfactor = newfactor;
 		}	
 		return altfactor;
 	};
 	
    function ConvertDDToDMS(D, lng){
        return {
            dir : D<0?lng?'W':'S':lng?'E':'N',
            deg : 0|(D<0?D=-D:D),
            min : 0|D%1*60,
            sec :(0|D*60%1*6000)/100
        };
    }
    

    function refreshLocDisplay() {
    	
    	var positext = document.getElementById('positiontext');
    	
        if(locformat) {                    
            var lf = ConvertDDToDMS(lat,false);
            //        lattest = parseInt(lf['deg']) + parseInt(lf['min']) /60 + parseInt(lf['sec']) / 3600;
            var tempstr = lf['deg']+'°'+lf['min']+"'"+(Math.round(lf['sec']*10)/10).toFixed(1)+'"'+lf['dir']+'<br />';
            var lf = ConvertDDToDMS(lon,true);
            tempstr += lf['deg']+'°'+lf['min']+"'"+(Math.round(lf['sec']*10)/10).toFixed(1)+'"'+lf['dir'];
            //$('#positiontext').html(tempstr);
            positext.innerHTML = tempstr;
        }
        else positext.innerHTML = lat.toFixed(7)+',<br />'+lon.toFixed(7); 
        //$('#positiontext').html(lat+',<br />'+lon);
    }


	/* makes the correct speed value *only for output*
	*/
	function displaySpeedWithFactor(dspeed,dest_element,specialtick_element) {
		
		dspeed *= speedfactor;
		
//		if(kta.nojquery!==undefined)
	//		app.Debug('nojquery: '+kta.nojquery);
			
        if(dspeed < 20 && speedfactor < 3.6) {	        	
        	var sss = ""+dspeed.toFixed(1);
        	sss = (sss.replace('.','<span class="valuefract">.'))+'</span>';
       		kwd_setElementHtml(dest_element,sss); // ! setElementHtml is already existent !	        	
		}
		else {
       		kwd_setElementHtml(dest_element,Math.round(dspeed)); // fast enough and must kill span if still there 	        	
		}
		
		if(specialtick_element) {
			gauge.setSpecialTickValue(specialtick_element,dspeed);
		}
		
		return dspeed;
	}

    //public
    
    /* changes format of position data (longitude, latidue)
     * return: 'deg'|'decimal'
     */
    this.switchLocFormat = function() {
        locformat = !locformat;
        refreshLocDisplay();
        if (locformat) return 'deg';
        else return 'decimal';
    };
    
	this.showMaxAverage = function(newstate) {
		maxaverage_show = (newstate) ? 'true' : 'false';
	};

    /*
        collects values for average speed
          s: speed value to add - must be in m/s
           s==-1 : generate old value and display
           s==0 : display value only
           s>0 : generate new value and add old value and display
        
        - does NOT auto save averagespeed persisently (must be done separately, eg. on resetAutoFade/resetHud, or OnPause)
        
         - einfach 3 Werte speichern: Summe, Anzahl, Zeitstempel
         - dies ist eine Gruppe, z.Z. wird nur eine einzige Gruppe verwaltet und gespeichert
         
         TODO: - alten berechneten Wert anzeigen ohne neuen Wert hinzuzufügen: einfach bei s == 0, kann dann auch von extern aufgerufen werden
         TODO: - keine Gruppen mehr sondern genau ein Datensatz, der gespeichertes verrrechnet und neues hinzufügt. 
         TODO: (Gruppen nur sinnvoll, wenn es Funktion für Höchstalter des Mittelwertes gibt)
         
    */
    this.averageSpeed = function(s) {
 			
 		if(s != 0) {
     		    
    		var ctime =  new Date().getTime();
    		
    		// add entry
    		if(average_list.length < 1) {
    			average_newentry = false;
    			
    			// this defines the object type!
    			var newentry = {
    				n : 0,
    				sum : 0,
    				time : ctime
    			};
    			average_list.push(newentry);
    		}										
    			
    		// use current entry
    		var cas = average_list[0]; // there is always just 1 entry
    		  
    		if(s>0) {
    			cas.n += 1;
    			cas.sum += s;
    			cas.time = ctime;
    		}
    		    	
    		// calculate current average value
    		// ! hier *mit* #
    		if(cas.n>0) average_speed = cas.sum  / cas.n;
		} 
		
		// refresh only		
		displaySpeedWithFactor(average_speed, '.averagespeedtext',analogGaugeAverageTick); // sets more than 1 elements, just like .speed 
    };
    // disabled for later:
    /*

	this.averageSpeed_groups = function(s) {
 			
 		if(s >= 0) {
     		    
    		// TODO: völlig neue Berechnung!
    		var ctime =  new Date().getTime();
    		
    		// add entry
    		if((average_newentry) || (average_list.length < 1)) {
    			average_newentry = false;
    			
    			// this defines the object type!
    			var newentry = {
    				n : 0,
    				sum : 0,
    				time : ctime
    			};
    			average_list.push(newentry);
    		}										
    			
    		// use current entry
    		var cas = average_list[average_list.length - 1];
    		  
    		cas.n += 1;
    		cas.sum += s;
    		cas.time = ctime;
    		
    		// set old sum and n only once after program start or init
    		if(average_list.length > 1) {
    			if(!average_old_n || !average_old_sum) { // TODO: check if this is really just done when needed!
    				average_old_n = average_old_sum = 0;
    				for(var i = average_list.length - 1; i>=0; i--) {
    					average_old_n += average_list[i].n;
    					average_old_sum += average_list[i].sum;
    				}
    			}
    		} else average_old_n = average_old_sum = 0; // eigentlich nur bei clear nötig, ist aber sicherer, es immer abzufragen
    		
    	
    		// calculate current average value
    		// ! hier *mit* #
    		average_speed = (average_old_sum + cas.sum)  / (average_old_n + cas.n); 
		} // refresh only
		
		displaySpeedWithFactor(average_speed, '.averagespeedtext'); // sets more than 1 elements, just like .speed 
    };
    */
    
 	/* gibt Datum-Stempel der letzten Gruppe zurück für Anzeige in UI Dialog
 	 * return: Datumsobjekt | undefined
 	 * 
 	 */
 	this.getLastAverageTime = function () {
 		if(average_list.length>0) {
 			var nd = new Date(average_list[average_list.length - 1].time);
 			return nd;
 		}

 	};
 	
 	
 	/* save function  for average speed
 	 * 
 	 * - seperate from generating for performance reasons (should be used only on pause / quit )
 	 * - makes string of array
 	 * - if array empty save empty string!
 	 * 
 	 * return: true: success; false:error
 	 */
 	this.saveAverage = function () {
	 		
	 	if (average_list.length) {
		 	var str = '';
	 		try {
	 			str = JSON.stringify(average_list);
	 		}
	 		catch(e) {
	 			app.Debug(e);
	 			return false;
	 		}
			app.Debug('average speed save: '+str); 			
	 		app.SaveText(kta.storage.average_no_groups,str);
	 	}
	 	return true;
 	};
 	
 	/* löscht alle Mittelwert-Daten
 	 * - löscht vorsichtshalber auch gespeicherte Liste, falls Programm unterbrochen wird bevor erneut regulär gespeichert wurde.
 	 */
 	this.clearAverage = function() {
 		average_list.length = 0;
 		average_newentry = true;
		average_old_n = average_old_sum = 0; // damit richtig weiter berechnet
 		average_speed = 0;
 		app.SaveText(kta.storage.average_no_groups,'');
 		this.averageSpeed(0);
 	};
 	
 	/* load function for average speed
 	 * - makes array of object out of string with JSON.parse
 	 * - error while loading or empty string leaves array unchanged
 	 * - this inits the measurement-cycle by 'average_newentry=true' --> only use load on startup or when needed
 	 * TODO: - displays the read value
 	 * return: true=success, false=nothing (sensible) loaded
 	 */
 	this.loadAverage = function() {
 		average_newentry = true;
 		var str = app.LoadText(kta.storage.average_no_groups,'');
 		var err=0;
 		if (str) {
			app.Debug('average speed load: '+str); 			
 			if(average_list.length) average_list.length = 0; // for the unusual case of loading after init of app delete list:
 			try {
 				average_list = JSON.parse(str);
 			}
 			catch(e) {
 				app.Debug(e);
 				err=1;
 				average_list.length = 0;
 			}
 			if (average_list.length > 1) throw 'loadAverage: found list too long ('+average_list.length+')';
 			average_old_n = average_old_sum = 0; // damit nach pause/resume richtig neu berechnet
 		}
 		// init das display 
 		this.averageSpeed(-1); // -1 == calculate but don't add new value
 			
 		
 		if (err) return false;
 		else return true;
 	};
 	
    /*
        sets the maxspeed
        - newmaxspeed: only accepted if > current maxspeed
        - resetmode: undefined|false|true: if true: set maxspeed
        - auto saves maxspeed + time of max speed persisently
        ! uses always raw m/s until display!
    */
    this.maxSpeed = function(newmaxspeed,resetmode) {
        
        if(newmaxspeed!==undefined && (newmaxspeed > maxspeed || resetmode)) {
        	maxspeed = newmaxspeed;
			if(resetmode) {
				if(newmaxspeed == 0) maxspeedtime = 0;
				else {
					var t = app.LoadNumber(kta.storage.maxspeed_time,0); // time laden 
					if (t) maxspeedtime = t;
					else maxspeedtime = new Date().getTime(); // needed to be compatible: if user updates exsiting app, time must be generated for (long) existing maxspeed 
				}

			}				
			else maxspeedtime = new Date().getTime();
			
            app.SaveNumber(storage_tachocurrentmax,maxspeed); // is called quite often shortly after reset but not more often than once a second
            app.SaveNumber(kta.storage.maxspeed_time,maxspeedtime); // is called quite often shortly after reset but not more often than once a second
			displaySpeedWithFactor(maxspeed,'.maxspeedtext',analogGaugeMaxTick); // ! hier *mit* . !
        }
        return maxspeed;
    };
    
 	/* get data about maxspeed as object
 	 * - speed is already calc. with factor + displayed
 	 * - return values for additional info display 
 	 
 	 */
 	this.getMaxSpeedData = function(setelem) {
 		
 		var retobj = {
 			speed : displaySpeedWithFactor(maxspeed,setelem),
 			unittext : speedunittext,
 			time : maxspeedtime // can be 0 if maxspeed is enabled but not set at least once 
 		};
 		
 		return retobj;
 	};

 	/* get data about averagespeed as object
 	 * - speed is already calc. with factor + displayed
 	 * - return values for additional info display
 	 * - return: object with data | undefined 
 	 */
 	this.getAverageSpeedData = function(setelem) {
 		
 		if (average_list.length) {
 			
	 		var retobj = {
 				speed : displaySpeedWithFactor(average_list[0].sum / average_list[0].n,setelem),
 				unittext : speedunittext,
 				time : average_list[0].time
 			};
	 		return retobj;
 		}	
 		
 		// returns undefined by default
 	};

    /* call back for change by GPS
      * - uses displayspeed for tachoRange... and speed (raw) for max and average
     */
    this.change = function(newlocdata) {
		//app.Debug('loc change');        

        // if provider == network, speed has no reasonible value
        // so keep old value unless gps
        // TODO: alle Änderungen auch ohne GPS wenn möglich - z.B.  für initiale Werte
        // oder != 0 abfragen : entweder Wert !=0 oder nur von gps
        
        if (newlocdata.provider.toLowerCase() == "gps") {
			clearGpsWarning();
			
            // rounding saves a lot of space when converting values to string
            speed =  newlocdata.speed;
            if (speed < 0) speed = 0; // for the case of calculation or rounding errors
            //(if speed is momentarily <0 this can disturb statictic/display functions of app)
            
            //currently not used $('#bearingtext').text(newlocdata.bearing+'°');
            //currently not used $('#bearinginfo').text('GPS');


	        // for screenshots:
	        // speed = 42/3.6;	        
	        
	        // es wird nicht gezählt, falls man steht mit GPS & Average aktiv
	        if (maxaverage_show && speed > 0.28) {
	            this.averageSpeed(speed);
	            this.maxSpeed(speed);
	        }
	        
	        var displayspeed = displaySpeedWithFactor(speed,'.speed'); // already sets the output, but returns calculated as number
	        
	        	
	        if (cssgauge_visible) { // flag for performance
		        //app.Debug('cssgauge visible -> set analog speed');
		        
	        	if (displayspeed > 0) this.tachoRange(displayspeed); // must not be <= 0  (accidently)
	        	gauge.setValue(displayspeed); // hier den exakten float value nutzen
	        }

    		if (newlocdata.accuracy) accuracy = newlocdata.accuracy;
	   		kwd_setElementText('#accuracytext','GPS ('+Math.round(accuracy)+'m)'); // TODO: use textRef from Box 
	   		var c = accuracy;
	   		// c depends on value, assume: <5 == very good (green). > 100 == very poor (orange)
	   		// the formula is left verbose for understanding
	   		
	   		if (c>100) c = 100;
	   		if (c<5) c = 5;
	   		c = 105 - c;
	   		displayAccuracy.getTextElement().style.color = 'hsl('+c+',100%,43%)'; // set color	   			 	       
        }
        else {
            //$('#bearinginfo').text('Sensor');
            // gpswarning is controlled by block above only
        }
        
		// get always these values !:
		// but only set if not 0
        if (newlocdata.latitude!=0) lat = newlocdata.latitude; // TODO: check if you should round!
        if (newlocdata.longitude!=0) lon = newlocdata.longitude;    // TODO: check if you should round!
        if (newlocdata.altitude!=0) alt = newlocdata.altitude * altfactor; // TODO: save alt * factor seperatly if storage of data needed
        // analog speed testing: 
        
        // for screenshots:
        //lat = 52.5162731;
        //lon = 13.3777052;
        
        // window.setTimeout(this.setStep,250);

        //test
//        lat = 40.1641164;
//        lon = -7.8928645;

        //update geolocation
        refreshLocDisplay();
        
        //update altitude
        
       
		//        $('#altitudetext').text(Math.round(alt));
   		kwd_setElementText('#altitudetext',Math.round(alt)); // fast enough and must kill span if still there
    };
    
    this.isHud = function() {
    	return hud;
    };
    
    /* switch the hud (mirroring) on and off
    - sets one specific state if parameter setto is set ('on'|'off')
    */
    this.switchHud = function(setto) {
    
        if (setto=='on') hud = true;
        else if (setto=='off') hud = false;
        else hud = !hud; 
        
        var scale = hud ? -1 : 1;

        /*$("#display-container").css({
            'transform' : 'scaleX('+scale+')',
            '-webkit-transform' : 'scalex('+scale+')',
            '-moz-transform' : 'scaleX('+scale+')'
        });*/
       var dc = document.getElementById('display-container');
       dc.style.webkitTransform = 'scaleX('+scale+')';
       dc.style.transform = 'scaleX('+scale+')';
       
		if (hud) {
		  //$('.skin').addClass('skin-minimal');
			var elems = document.getElementsByClassName('skin');
			for(var i=0;i<elems.length;i++) {
				elems[i].classList.remove('skin-subtle');
				elems[i].classList.remove('skin-plastic');
				elems[i].classList.add('skin-minimal');
			}
		  	if(kta.androidmode) app.SetScreenMode('Full'); // TODO: evtl. in mächster DroidScript Version geändert

		}
		else {
		  //$('.skin').removeClass('skin-minimal');
			var elems = document.getElementsByClassName('skin');
			for(var i=0;i<elems.length;i++) {
				elems[i].classList.remove('skin-minimal');
			}
			kta.setSkin(); // setzt ursprüngliche skin
		  	if(kta.androidmode) app.SetScreenMode('Normal');
		}
    };
	
	/*
	  setzt Tacho Wertebereich in Anzeige analog hoch 
	  - newvalue enthält eine aktuelle Geschwindigkeit, die ausgewertet werden muss!
	  - wenn newvalue < 0, Max. Wert auf abs(newvalue) direkt gesetzt anstatt zu erhöhen
	  - wenn newvalue zufällig 0 -> nichts tun
	  - Automatische Wertebereich-Erhöhung kann real nicht abgeschaltet werden, sondern wird
	    im Menü lediglich auf niedrig oder hoch zurückgesetzt :-)
	  - TODO: value gleich setzen, wenn Bereich geändert, am besten auch, wenn nicht geändert
	*/
	this.tachoRange = function(newvalue) { 

    	if(newvalue) {

    	    var dochange = false;
    	    var el = document.getElementById('cssgauge');
    	    app.Debug('cssgauge display: '+el.hidden);
    	    if ((newvalue > tachorange) && (el.hidden == false)) // nichts tun wenn ananlog nicht sichtbar!
            { 
                
                // do NOT increase but directly calculate new; the divisor == step to round up
                // (this avoids jumping 5 times when starting while having e.g. 100km/h)
                // TODO: 40th step does not work properly
                if (newvalue >= 500) tachorange = Math.ceil(newvalue / 500)*500;
                else if (newvalue >= 100) tachorange = Math.ceil(newvalue / 100)*100;
                else if (newvalue >= 20) tachorange = Math.ceil(newvalue / 50)*50;
                else if (newvalue >= 10) tachorange = Math.ceil(newvalue / 20)*20;
                else tachorange  = 20;
                
                app.Debug("extended range:"+tachorange);
    	        dochange = true;
            }
            else if (newvalue < 0) {
                // this makes it possible to reset to a range
                tachorange = -newvalue;
                dochange = true;
            }
            
            // nun ist tachorange korrekt berechnet, falls nicht größer, nichts tun
            if (dochange) {
                
        	    var minors = 2;
				var maj = tachorange / 10; 
				var split = 6;
				
				if (tachorange<=10) {
				    minors = 2;
				}
				else if (tachorange<=20) {
				    minors = 2;
				}
				else if (tachorange<=50) {
				    minors = 5;
				}
				else if (tachorange<=200) {
				    minors = 2;
				}
				else if (tachorange<=300) {
				    minors = 3;
				}
				else if (tachorange<=400) {
				    maj = 50;
				    minors = 5;
				}
				else if (tachorange<=500) {
				    
				    minors = tachorange / 100;
				}				
				else {
				    minors = 2;
				}
				    
				
				var steps = tachorange / maj;
				// TODO: autoadjust by checking amount of steps
			    split = Math.floor(steps / 3 * 2);
				
        	    if(gauge) gauge.config({
					'wrapper':'cssgauge-wrapper',
					'gauge':'cssgauge',
					'size':'auto', // not yet implemented !
					'maxRange':tachorange,
					'majorStep':maj, // must be < maxRange and reasonable adjusted
					'minorTicks':minors, // should be between 0 and 5
					'overallAngle':250, // degrees, better < 340
					'value':0 // must be < max Range
        	    });
        	    // some skin classes must be set again:
        	    //if(hud)	$('.skin').addClass('skin-minimal'); // TODO: problem if multiple adds possible

        	    app.SaveNumber(storage_tachorange,tachorange);
            }
    	}
    	return tachorange; 
	};
	
	
	// construct
	
    // current maxspeed
    this.maxSpeed(app.LoadNumber(storage_tachocurrentmax,0),true); // 2nd param true -> force set 
    // current average speed
    this.loadAverage();
    

} // KwdGpsTools


/*  AutoSettings
    sucht per jquery Elemente aus dem DOM, deren Zustand in 
    localStorage gespeichert wird, um z.B. Programmeinstellungen
    wiederherstellen zu können.
    - abhängig von bestimmten Konventionen im HTML:
        - id muss gesetzt sein
        - class 'switcher' 
        - Funktionen sollten Zustandsänderung an AutoSettings weitergeben
          (Bsp. hier siehe 'setRadio()' und 'switchClass()'
        - Zustände sollten nicht außerhalb von AutoSettings in vars gespeichert 
          werden
	
	TODO: extern (interface) alles mit boolean!

          
    TODO: PROBLEM: funktioniert in App nicht oder schlecht, 
        - Verhalten von get (kann auch *undefined* liefern!) wurde repariert
        --> Timing Problem (wegen jQuery?) besteht immer noch
        - besser wäre, alle switcher bei Programmstart in Array aufzunehmen, wenn
          load scheitert, dies würde auch Array-Vergrößern bei erstem Switch 
          sparen
*/
//class
function AutoSettings(newstoragename,newsetclass) {
    //private
    var data = new Array();
    var storagename = '';
    var setclass = 'switched-on';
    var check = "";
    
    var that = this;
    
    //public
    
    
    /*  speichert in storage wenn möglich
        - gibt false zurück, wenn speichern nicht möglich
        - verändert Struktur 'data' nicht
    */
    this.save = function() {
        
        if(storagename!='' && data.length!=0) {
            var str = JSON.stringify(data);
            window.localStorage.setItem(storagename,str);
            return true;
        }    
        return false;        
        
    };
    
    /*  lädt von storage wenn möglich
        - gibt false zurück, wenn laden nicht möglich
        - verändert Struktur 'data' nicht, wenn laden nicht möglich
    */
    this.load = function() {
        
        if(storagename!='') {
            var str = window.localStorage.getItem(storagename);
            if(str!==null) {
                data = JSON.parse(str);
                return true;
            }            
        }    
        return false;        
    };

    /* findet Element oder fügt es hinzu
        - gibt index des Elementes zurück oder -1 im Fehlerfall
    */
    this.added = function(name) {
        var i;
        var l = data.length;
        for(i=0;i<l;i++) {
            if(data[i]['name'] == name) {
                return i;
            }
        }
        
        if(i>=data.length) {
            var a = {
				'name' : name,
				'value' : 'false'
			};
            data[i] = a;

            return i;
        }
        
        return -1;
    };
    
    /*  initialisiert alle Switches
        - ändert HTML der entsprechenden Elemente
        - liest aktuelles 'data', versucht intern keinen 'load' oder 'generate'
    */        
    this.initall = function() {
        
        var i;
        var l = data.length;
        for(i=0;i<l;i++) {
            var el = document.getElementById(data[i]['name']);
            if(el) {
	            if(data[i]['value'] == 'false') {
	                //jquery: $('#'+data[i]['name']).removeClass(setclass);
	                el.classList.remove(setclass);
	            }
	            else {
	                el.classList.add(setclass);
	            }
           }
        }
    };

    /*  liest einen Wert aus Settings liste
        liefert undefined wenn Wert nicht vorhanden
    */
    this.get = function(name) {
        var i;
        var l = data.length;
        for(i=0;i<l;i++) {
            if(data[i]['name'] == name) {
                if(data[i]['value']=='true') return true;
                else return false;
            }
        }
        
        return; // ! automatically returns 'undefined' 
    };
    
    /*  setzt einen Status und erzeugt Element, wenn nicht vorhanden
        - value string!! 'true' und 'false' werden behandelt
    */
    this.set = function(name,value) {
        
        if(typeof name !== 'undefined') {
            var i = this.added(name);
            if(i!=-1) {
                data[i]['value'] = value;
                return true;
            }           
        }
        return false;
    };
    
    
    /* return: true: on, false: off
 		- value: if given sets to this (must be boolean true|false)
 		return: neuer Status (true|false)
     */
    
    this.switchit = function(id,value) {

		var elem = document.getElementById(id);  
        var sw = elem.classList.contains(setclass); // get current state
        var setto = false;
        if(value===undefined) setto =!sw;
        else setto = (value == true) ? true : false;
        var ret = false;
                
        if(sw && !setto) {
        	// remove class may sometimes be called when there is no more class - without effect
            elem.classList.remove(setclass);
            this.set(id,'false');
        }
        else if (!sw && setto) {
            //$(elem).addClass(setclass);
            elem.classList.add(setclass);
            this.set(id,'true');
            ret = true;
        }

        this.save();
        return setto;
    };
    
    /* im Gegensatz zum switch muss bei radio bei allen
       betreffenden Elementen (klasse) das Element gesetzt/erzeugt werden
       
       TODO: 'swicthed-on' in var!!
    */
    this.radio = function(klasse,id) {
    	
        
        if(typeof id != 'string') throw('kwd settings radio only IDs!');
        
        // alle der klasse auf false
        /*$(klasse).removeClass('switched-on');
        $(klasse).each(function() {
            that.set($(this).attr('id'),'false');
        });*/	
		var elems = document.getElementsByClassName(klasse);
		for(var i=elems.length-1;i>=0;i--) {
			elems[i].classList.remove('switched-on');
			this.set(elems[i].id,'false');
		} 
        
        // gesetztes auf true
        //$(elem).addClass('switched-on');
        document.getElementById(id).classList.add('switched-on');
        
        //this.set($(elem).attr('id'),'true');
        this.set(id,'true');
        
        this.save();
    };

    
    //construct
    if(newstoragename) storagename = newstoragename;
    if(newsetclass) setclass = newsetclass;
    if(this.load()) this.initall();
}



/* manages Visibility of menus or cards or any HTML elements given by id (always called 'menu' here)
 * - 
 * - push() and pop() make sure the caller does not need to know order or type or id of open menu
 * - TODO: function clear/rewind
 * - TODO: choose to not hide lower on push 
 * - TODO: save state (show/hide) of each entry
 * - TODO: find error while OnBack (if any)
 */
// class
function KwdPopupStack() {
	
	// private:
	
	var stack = new Array();
	/* adds a menu to the stack
	 * - callback will be used on pop for additional actions on pop
	 * - id must be the name used by HTML element id  
	 */
	
	//public:
	
	/* code for the *current* project, 
	 * TODO: to make this class independently provide callback mechanism!
	 */
	this.doOnChange = function(show_id,hide_id) {

		if(show_id) {
			var el = document.getElementById(show_id);
			el.style.display = 'block';
			el.scrollTop = 0;
			kwd_showById('dialogs-blender');
			
			// Dialoge vom Typ 'infodialog' werden bei kleinen Displays verändert.
			if (el.classList.contains('infodialog')) {
				
				if (el.scrollHeight > getDisplayHeight()) // TODO: need to calculate border??
				{
					// ganze display breite nutzen
					el.style.maxWidth = getDisplayWidth() + 'px';
				 	//app.Debug('found big infodialog:'+el.scrollHeight);
				
					// suche nach Buttons
					var i = 0;
					var els = el.getElementsByClassName('btn');
					if(els.length>1) {					
						app.Debug('infodialog buttons:'+els.length);
						for(i=0;i<els.length;i++) {
							els[i].style.display = 'inline-block';
							els[i].style.margin = '0.5em 0 0.5em 0';
							if(i==0) els[i].style.marginLeft = '0.5em';
						}
					}
				}
			}
	
			kta.centerVisibleDialog(show_id);

		}
		else { // this must be only when stack empty
			kwd_hideById('dialogs-blender');			
		}
		
		if(hide_id) {
			document.getElementById(hide_id).style.display = 'none';
		}

	    window.scrollTo(0,0);
	    resetMenuFade();
	};
	
	this.push = function(id,callback) {
	
		var stackentry = {
			'id': id,
			'callback' : callback
		};
		
		var lastid;
		
		// we hide the last stackentry and
		if (stack.length) {
			lastid = stack[stack.length-1].id;
		} 
		// now show the new menu
		// id is always stored without the #, user can decide to write # or not
		if (id.charAt(0)=='#') id = id.substr(1,id.length-1);
		//app.Debug(id);
		stack.push(stackentry);
		//app.Debug(stack);		
		this.doOnChange(id,lastid);
	}; 
	
	/* removes a menu from stack
	 * - return: id of popped menu
	 * - if stack empty, do nothing and give back emptys string
	 */
	this.pop = function() {
		
		if (stack.length>=1) {
			var entry = stack.pop();
			// hide the menu to be popped
			//$('#'+entry.id).hide(); // !jQuery
			document.getElementById(entry.id).style.display = 'none';
			var lastid;
			if(stack.length) {
				lastid = stack[stack.length-1].id; // now the previous is the topmost
				//$('#'+last.id).show(); // !jQuery
			}
			this.doOnChange(lastid,entry.id);
			return entry.id;
		}
		else return '';
	};
	
	/* hides current element and empties stack
	 * 
	 */
	this.clear = function() {
 		if(stack.length) {
 			//$('#'+stack[stack.length-1].id).hide();
			var id = stack[stack.length-1].id;
			var el = document.getElementById(id);
 			//if (el) el.style.display = 'none';
			this.doOnChange('',id);
 			stack.length = 0; // clear all
			
 		}
	};
	
	/* returns the currently visible menu of stack
	 * - does nothing but returning id,
	 * - returns FALSE if no menu there, else the id string without '#'
	 * - just use this method to check for an empty stack! 
	 */
	this.current = function () {
		if (stack.length) {
		  var e = stack[stack.length-1];
		  if (e.id) {
		      //app.Debug(e.id);
		      return e.id; // TODO: check if can be written like that!
		  }
		}
		//app.Debug('stack empty');
		return false;
	};	
} // class PopupStack


/* DisplayBox
 * - outer wrapper = display-box -> border etc.; size adjusted with css (name of wrapper not important)
 * - inner = diplay-text -> size adjusted with transform scale - can be div and still fit to text???
 *  
 * TODO: maybe better to save the dimensions of textRef in seperate vars instead of relying on not have changed the css
 */// class
function DisplayBox (newid,mode) {

	var id;
	var boxRef = null; // element in DOM
	var boxRef_padding = 0; // TODO: 2 Werte: jedes Padding einzeln!
	var textRef = null; 
	var text_w = 0;
	var text_h = 0;
	var primary = false;
	var visible = true;  // for toggle - and performance
	var firstvisible = false;
	var teststring = newid;
	
	/* gibt Namen zurück
	 * 
	 */
	this.name = function() {
		return id;
	};
	
	/* returns boxRef (node object)
	 * - doesn't check if valid
	 */
	this.getElement = function() {
		return boxRef;
	};

	/* returns textRef (node object)
	 * - doesn't check if valid
	 */
	this.getTextElement = function() {
		return textRef;
	};
	
	this.testString = function(newstr) {
		if((typeof newstr != 'undefined') && newstr) teststring = newstr;
		return teststring;
	};
	
	this.show = function() {
		if(!visible) {
			//$(boxRef).show();
			boxRef.style.display = 'block';
			visible=true;
		}
	};
	
	this.hide = function() {
		if(visible) {
			//$(boxRef).hide();
			boxRef.style.display = 'none';
			visible=false;
		}
	};
	
	this.isVisible = function() {
		return visible;
	};
	
	/* sets or removes class for first *visible* display
	 * - value stored
	 * TODO: caller must ask whether he wants digitalspeed either - or not
	 */
	this.setFirst = function(isfirst) {
		
		if ((isfirst && firstvisible) || (!isfirst && !firstvisible)) return;
		
		if (isfirst) {
			//$(boxRef).addClass('first-display');
			boxRef.classList.add('first-display');
			//app.Debug('first set to '+id);
			firstvisible = true;
		}
		else {
			//$(boxRef).removeClass('first-display');
			boxRef.classList.remove('first-display');
			app.Debug('first removed from '+id);
			firstvisible = false;
		}
	};
	
	/* passt die Größe dem umgebenden div (settings.wrapper) an
	 * - unabhängig, da bei jedem resize benötigt.
	 */
	this.scale = function(x,y,dim) {
		// manage scale + corrected position!
		// TODO: CSS scale origin des .gauge oben links
		// - the width, height of wrapper are always the innermost value 
		// - checks if width or height is limiting ("bounding box")
		if (boxRef==null || textRef==null) return;
		
		// TODO: save values on construct if scroll-dims not work!
		// ! manuell padding hinzugefügt :-(())
		var ws =  x /  text_w; 
		var hs =  y / text_h;
		var scale = 1;
		
		if(dim) {
			if(dim=='width') {
				scale = ws;
			}
			else {
				scale = hs;
			}			
		}
		else scale = (ws < hs) ? ws : hs;
				
		// TODO: should also work with transform-origin 50% 50% 0 and center text by top/left values
		// TODO: you could ask a global flag and decide whether to use webkit or not
		/*jquery: $(textRef).css({
			'-webkit-transform-origin':'50% 0 0',
			'-webkit-transform':'scale('+scale+','+scale+')',
			
			'transform-origin':'50% 0 0',
			'transform':'scale('+scale+','+scale+')'
		});		*/
		textRef.style.webkitTransformOrigin = '50% 0 0'; // TODO: check if working!
		textRef.style.webkitTransform = 'scale('+scale+','+scale+')'; // TODO: check if working!
		textRef.style.transformOrigin = '50% 0 0';
		textRef.style.transform = 'scale('+scale+','+scale+')';
		
		if(dim) {
			if(scale==ws) {
				//refit height
				//jquery: var newh = ($(textRef).height()+12) * scale; // need correction is +padding +border (due to box-sizing:border-box) 
				//jquery: $(boxRef).css('height',newh+'px');
				boxRef.style.height = (textRef.scrollHeight + 12) * scale + 'px'; // why 12 ?
				
			}
			else {
				//refit width
				//$(boxRef).css('height',$(boxRef).outerHeight()*scale); // consider box-sizing
				//jquery: var neww = $(textRef).width() * scale; 
				//jquery: $(boxRef).css('width',neww+'px');
				boxRef.style.width = textRef.scrollWidth * scale + 'px';
			}
		}
	};	
	
	this.resize = function(x,y,dim) {
		/*jquery: $(boxRef).css({
			'width':x+'px',
			'height':y+'px'
		});*/
		boxRef.style.width = x + 'px';
		boxRef.style.height = y + 'px'; //TODO: why set both already??
		// try to center text into wrapper box
		// TODO: WAIT when size of above set is not yet!! OR calculate the border/padding!
		/*jquery: $(textRef).css({
			'left':($(boxRef).innerWidth() - $(textRef).width()) / 2 + 'px' 
		});*/
		
		if(x!=0) x-= boxRef_padding*2;
		//if(y!=0) y-= boxRef;
		this.scale(x,y,dim);
		
		// TODO: make work
		// - cannot work since text_w is unscaled ori size
		//var diffw = textRef.getBoundingClientRect().width;
		var leftpos = (boxRef.clientWidth - text_w) /2;
		textRef.style.marginLeft = leftpos - boxRef_padding + 'px'; //Hier manuell die padding der  Box hinzugerechnet :-(
	};
	
	// construct displayBox
	id=newid;
	boxRef = document.getElementById(newid);
	//jquery:textRef = $('.display-text',boxRef);
	var dts = boxRef.getElementsByClassName('display-text');
	if(dts && dts.length) textRef = dts[0];
	else throw 'kwd: DisplayBox, canno set textRef';
	//textRef = boxRef.querySelector('.display-text'); // TODO: use when above code doesn't work 
	 
	
	//jquery: $(boxRef).show(); 
	boxRef.style.display = 'block'; // in case it is disabled initially // hide depending on app settings is done later
	if(mode) primary = true;
	
	// padding speichern:
	boxRef_padding = parseFloat(getComputedStyle(boxRef,null).paddingLeft);
	//app.Debug('padding found '+newid+': '+boxRef_padding);
	
	// fix inner text box size to preset text
	// change to block important for scale (must be inline before for getting text size) 
	/*jquery:$(textRef).css({
		'width':$(textRef).width(),
		'height':$(textRef).height(),
		'display':'block',
		'position':'absolute'  
	});*/
	// ! span tags *don't* have clientWidth/Height!
	text_w = textRef.scrollWidth || textRef.offsetWidth;
	var testw = getComputedStyle(boxRef,null).width;
	textRef.style.width = text_w + 'px';  // set fix  from 'auto' to current width
	text_h = textRef.scrollHeight || textRef.offsetHeight; 
	textRef.style.height = text_h + 'px';  // set fix  from 'auto' to current height
	textRef.style.display = 'block';           // make block (was inline!) - TODO: check if 'inline-block' is better
	textRef.position = 'absolute';
	
	//jquery: var w = $(boxRef).width(); // save this for the object
	
	// NEW: we don't resize already since positionDisplays is coming
	
} // class displayBox


/* verwaltet nur noch die Objekte vom Typ 'displayBox', die im displays-wrapper als zusätzliche Displays zusammengefasst sind.
 * - nicht nur List-Funktionen sondern auch visuelle Interaktionen und Abhängigkeiten (z.B. Schriftgrößen)
 * - considers last element as "aaccuracy" which may be styled differently 
 * - TODO: id_maxwidth: id von HTMl-Element, definiert, welches durch seine Schriftgröße die Größe der anderen bestimmen soll
 * - TODO: id_maxheight: id von HTMl-Element, definiert, welches durch seine Schriftgröße die Größe der anderen bestimmen soll
 */
function DisplayBoxList(id_maxwidth) {
	var idmaxwidth;
	var list = [];
	
	/* adds an element to list
	 * id: id of HTML tag
	 */
	this.add = function(id,reset_text) {
	
		var box = new DisplayBox(id,(id==idmaxwidth)); // ! boolean result for 2nd param
		list.push(box);
		// TODO: use inner vars of new box for reset text since the elements are already found!
		
		//jquery: if(reset_text)	$('.display-text','#'+id).text(reset_text); 
			
		if(reset_text) {
			var el = document.getElementById(id);
			if (el) {
				
				var dts = el.getElementsByClassName('display-text');
				if(dts && dts.length) dts[0].innerHTML = reset_text;
			}
		}	
		
		return box;			
	};
	
	/* returns object with certain id
	 * - TODO: provide function to return object by index, or return all (or at least length of array)
	 */
	this.get = function(id) {
		for(var i=0;i<list.length;i++) {
			if(list[i].name()==id) return list[i];
		}	
		return null;
	};
	
	/* returns true if all displays (except digitalspeed) are hidden
	 * 
	 */
	this.noneVisible = function() {
		for(var i = list.length-1; i >= 0; i--) {
			if (list[i].isVisible()) return false;
		}
		return true;
	};
	
	/* verschiedene Einpass-Funktionen
	 * - ! z.Z. nur für stapel übereinander geeignet
	 * TODO: immer noch fehler, da in positionDisplays digitalspeed nicht mit gerechnet, aber hier mit verarbeitet
	 * TODO: nur gerade sichtbare einberechnen
	 * TODO: style für :first dynamisch für ersten sichtbaren
	 */
	this.scaleTo = function(x,y) {
			var i;
			
			// sets the setFirst css class depending on which are visible
			var foundfirstvisible = false;
			for(i=0;i<list.length;i++) {
				
				if (list[i].isVisible() && !foundfirstvisible) {
					foundfirstvisible = true;
					list[i].setFirst(true);
				}
				else list[i].setFirst(false); // since element could be set to first before last config change
			}			
			
			var c = 0;
			for(i=0;i<list.length;i++) { // always loop forward here!
				if (list[i].isVisible()) {
					c++;
				}
			}


			if(y==0) { // normal screen wide
				for (i=list.length-1;i>=0;i--) {
					list[i].resize(x,0,"width");	
				}
				app.Debug('scaled to max h');				
			}
			else {
				//app.Debug('visible displays: '+c);
				var dy = y/c; // c generated above
			
				for (i=0;i<list.length;i++) {
					//TODO: *must* calculate outerWidth(true)
					//on .display-box for using space
					list[i].resize(x,dy,"");						
				}
				app.Debug('scaled to h ='+dy);								
			}
			
			// TODO: resize accuracy again because of text size ..
			
	};
	// construct
	idmaxwidth = id_maxwidth;
	if (idmaxwidth.charAt(0)=='#') idmaxwidth = idmaxwidth.substr(1,id.length-1);	
} // class displayBoxList


/* verwaltet Objekte vom Typ 'displayBox', aber nur alles was zum digital-speed wrapper gehört
 */
function DigitalSpeedBoxList(id_maxwidth) {
	var idmaxwidth;
	var list = [];
	
	var avrmax = true; // flag für Sichtbarkeit - TODO: muss bei Umschaltung im Menü gesetzt werden
	
	this.showMaxAverage = function(newstate) {

		if(newstate) {
			avrmax = true;
		}
		else {
			avrmax = false;
		}

		if(gpstool) gpstool.showMaxAverage(avrmax);
		else throw "kein gpstool für DigitalSpeedBoxList init";
		
		return avrmax;
	};	

	/* adds an element to list
	 * id: id of HTML tag
	 */
	this.add = function(id,reset_text,dtype) {
	
		var box = new DisplayBox(id,(id==idmaxwidth)); // ! boolean result for 2nd param
		list.push(box);
		// TODO: use inner vars of new box for reset text since the elements are already found!
		
		//jquery: if(reset_text)	$('.display-text','#'+id).text(reset_text); 
			
		// ! with this code only *one* child of the 'id' is processed!:
		if(reset_text) {
			var el = document.getElementById(id);
			if (el) {
				var dts = el.getElementsByClassName('display-text');
				if(dts && dts.length) dts[0].innerHTML = reset_text;
			}
		}	
		return box;			
	};
	
	/* returns object with certain id
	 * - TODO: provide function to return object by index, or return all (or at least length of array)
	 */
	this.get = function(id) {
		for(var i=0;i<list.length;i++) {
			if(list[i].name()==id) return list[i];
		}	
		return null;
	};
	
	/* returns true if all displays (except digitalspeed) are hidden
	 * 
	 */
	this.noneVisible = function() {
		for(var i=0;i<list.length;i++) {
			if (list[i].isVisible()) return false;
		}
		return true;
	};
	
	/* Einpass-Funktion
	 * - berechnet Höhe wenn avr/max sichtbar 
	 */
	 
	this.scaleTo = function(x,y) {
			var i;
			var y_am = 0;
			
			// nur wenn was in Liste
			if (list.length <=0 ) return;
			
			var scalemode = '';
			if(!y) {
				scalemode = 'width';
				y = 0;
			}
			else {
				if (avrmax && list.length > 1) {
					// teilt Höhe in 3/4 für speed und 1/4 für avr/max
					y_am = y * 0.25;
					y = y * 0.75; 
				} 
			}

			// erstes Element *muss* digispeed sein
			list[0].resize(x,y,scalemode);
			
			// average + max	
			for (i=1;i<list.length;i++) {
				list[i].resize(x/2,y_am,scalemode);
			}
					
	};
	
} // class DigitalSpeedBoxList


/* verwaltet Objekte vom Typ 'displayBox', aber nur alles was zum digital-speed wrapper gehört
 * TODO: teste prototype/ "Vererbung" mit Basisklasse
 */
function AnalogSpeedBoxList() {
	var list = [];
	
	var avrmax = true; // flag für Sichtbarkeit - TODO: muss bei Umschaltung im Menü gesetzt werden

	this.zoomanalog = false;

	
	/* Achtung! Setzt die Aktivität,
	 * nicht ob es tatsächlich sichtbar ist!
	 */
	this.showMaxAverage = function(newstate) {

		if(newstate) {
			avrmax = true;
		}
		else {
			avrmax = false;
		}

		if(gpstool) gpstool.showMaxAverage(avrmax); // TODO; vermeide Dopplung des Aufrufs (DigitalSpeedBoxList)
		else throw "kein gpstool für AnalogSpeedBoxList init";

		return avrmax;
	};	

	/* adds an element to list
	 * id: id of HTML tag
	 */
	this.add = function(id,reset_text) {
	
		var box = new DisplayBox(id,false); // ! boolean result for 2nd param - NOT USED HERE
		list.push(box);
		// TODO: use inner vars of new box for reset text since the elements are already found!
		
		//jquery: if(reset_text)	$('.display-text','#'+id).text(reset_text); 
			
		// ! with this code only *one* child of the 'id' is processed!:
		if(reset_text) {
			var el = document.getElementById(id);
			if (el) {
				
				var dts = el.getElementsByClassName('display-text');
				if(dts && dts.length) dts[0].innerHTML = reset_text;
			}
		}	
		return box;			
	};
	
	/* returns object with certain id
	 * - TODO: provide function to return object by index, or return all (or at least length of array)
	 */
	this.get = function(id) {
		for(var i=0;i<list.length;i++) {
			if(list[i].name()==id) return list[i];
		}	
		return null;
	};
	
	/* returns true if all displays (except digitalspeed) are hidden
	 * 
	 */
	this.noneVisible = function() {
		for(var i=0;i<list.length;i++) {
			if (list[i].isVisible()) return false;
		}
		return true;
	};
	
	/* verschiedene Einpass-Funktionen
	 * - verarbeitet nur Einträge 2,3 (nicht dona!) 
	 * TODO: ähnlich wie bei digital
	 */
	
	this.scaleTo_istDeaktiviert = function(x,y) {
			
			//TODO: remove this:
			return;
			
			var i;
			
			if(y==0) { // normal screen wide
				for (i=list.length-1;i>=0;i--) {
					list[i].resize(x,0,"width");	
				}
				app.Debug('scaled to max h');				
			}
			else {
				//app.Debug('visible displays: '+c);
				var dy = y/c; // c generated above
			
				for (i=0;i<list.length;i++) {
					if (list[i].name()=='digitalspeed') {
					    // TODO: do nothing here
						//list[i].resize(x,0,"width");
					}
					else {
					//TODO: *must* calculate outerWidth(true)
					//on .display-box for using space
						list[i].resize(x,dy,"");						
					}	
				}
				app.Debug('scaled to h ='+dy);								
			}
	};
	
} // class AnalogSpeedBoxList


// in browser global var important:
var gauge = null;


function MenuButton(id,on) {
	var enabled = true;
	var visible = false;
	var elem_width;
	var elem_id;
	var elem;
	
	this.show = function()
	{
		if (enabled && !visible)
		{
			//elem.style.display = 'block';
			elem.style.transform = 'translateX(0)';
			visible = true;
		}
	};
	
	this.hide = function()
	{		
		if (enabled && visible)
		{
			//elem.style.display = 'none';
			elem.style.transform = 'translateX('+elem_width+'px)';
			visible = false;
		}			
	};
	
	this.fade = function() {
		if (enabled)
		{
			
		}		
	};	
	
	// construct 
	enabled = on;
	elem_id = id;
	elem = document.getElementById(id);
	// get and save size for translate animation
	//elem_width = getComputedStyle(elem,null).width;
	elem_width = elem.offsetWidth;
	//elem.style.display='none';
}


var menubuttontimeout = false;
function resetMenuButtonFade()
{
	if(menubuttontimeout!==false) clearTimeout(menubuttontimeout);
	menubuttontimeout = setTimeout(kta.menubutton.hide,5000);
}
//TODO: stop timeout by scroll event
function fadeMenus() {
	//if(menustack.current()!==false) $('.dialog').fadeOut();// TODO: fade mit complete function
	menustack.clear();
	resetHud(); // may cause unexpected fade in + out if no menu open
}
var menutimeout = false;
function resetMenuFade() {
	if(menutimeout!==false) clearTimeout(menutimeout);
	var newtimeout = 1000*60; // 60s
	if(menustack.current()=='infocard') newtimeout*=4; // 4 min
	if(menustack.current()!==false) menutimeout = setTimeout(fadeMenus,newtimeout);
}



var fadetimeout = false;

// only called onInit and OnBack
// function on ice since we don't need infos on the main screen now
/*function resetAutoFade() {
	

    if(fadetimeout!==false) clearTimeout(fadetimeout);

    $('.autofade').show();
    $('.test').css({ 'opacity': '1.0' });

    
    // TODO: class "preventfade" oder so
    // is now handled by PopupStack :-)
    if(!menustack.current()) {
        fadetimeout = setTimeout(fadehud,5000);
		app.Debug("fade timeout set, since no menus open");
    } else app.Debug("fade DENIED");
}
*/
function fadehud() {
    
    // restart counter if something is in the way:
    // TODO: class "preventfade" oder so
    // TODO: hidden abfrage geht nicht :-(
    if(!menustack.current()) {
    	// TODO: use .autofade again for color/backgroundcolor of several elements e.g. gauge 
        //$('.autofade').fadeOut('slow');
		//$('#hg').addClass('hgchange');
		document.getElementById('hg').classList.add('hgchange');
		kta.menubutton.hide();
    }
    else clearTimeout(fadetimeout);
}


/* does only the lock and fullscreen
 * - no fading or hiding (until needed again) 
 * - TODO: fullscreen geht evtl.erst durch nächste grafische Änderung (???)
 */
function resetHud() {

    kwd_showByClass('autofade');
    document.getElementById('hg').classList.remove('hgchange');
	
	if(fadetimeout!==false) clearTimeout(fadetimeout);
	// also stop menubuttontimeout! 
	if(menubuttontimeout!==false) clearTimeout(menubuttontimeout);

	if (!menustack.current()) {
        fadetimeout = setTimeout(fadehud,5000);
	}	
	
	// TODO: make info of advertising here :-)
	if (layout_gauges < 1 && !menustack.current()) kwd_showById('no-gauges');
	//else $('#no-gauges').hide();
	else kwd_hideById('no-gauges');
}


/* setzt analog und digital-Tacho korrekt einzeln oder übereinander
    - da es nur gleiche Aufrufe gab, jetzt keine Parameter mehr- Elemente direkt genutzt
    - settings Struktur muss initialisiert sein!
    - NEW: sub-elements ar hidden when whole tacho is hidden
    - max und average werden *nicht* abgeschaltet sondern nur versteckt, wenn kein Tacho sichtbar
    - TODO: ! die average/max Parameter für Analog könne auch ohne das Gauge sichtbar sein
      
*/
function setTachoLayout() {
     
    var maxaverage_visible = true;
    
    // Aktivität von max/average separat setzen
   	if (settings.get('switchmaxaverage')==false) {
		digitalSpeedDisplays.showMaxAverage(false);
		kwd_hideById('digital-speedstats-wrapper');
		analogDisplays.showMaxAverage(false);
		kwd_hideById('analog-speedstats-wrapper');
		maxaverage_visible = false;
		gauge.setSpecialTickVisibility(analogGaugeAverageTick,false);
		gauge.setSpecialTickVisibility(analogGaugeMaxTick,false);		// IDEA: analogGaugeAverageTick.setVisibility(false);
		// reset tick color:
		document.getElementById('g-ticks-container').classList.remove('tick-base-color');
	}
	else {
		digitalSpeedDisplays.showMaxAverage(true);
		analogDisplays.showMaxAverage(true);		
		gauge.setSpecialTickVisibility(analogGaugeAverageTick,true);
		gauge.setSpecialTickVisibility(analogGaugeMaxTick,true);
		kwd_showById('digital-speedstats-wrapper');
		// tick color make alle blue (no mor reds)
		document.getElementById('g-ticks-container').classList.add('tick-base-color');
	}

    // setze Tacho
    if (settings.get('tachoswitch')!=false) {
    	
	  //$('#tacho-container').show();
	  var el = document.getElementById('tacho-container');
	  if (el) el.style.display = 'block';
	 
	                   	
	    var a;
	    var d;
	    if (settings.get('digitalanalog')!=false) a = d = true;
	    else {
			a = (settings.get('analog')==false) ? false:true;
			d = (settings.get('digital')==false) ? false:true;
		}
	
	    if(a && d) {
	        cssgauge_visible = true;
	        // es muss jeweils nur max/average für *analog* gesetzt/gelöscht werden, da für digital innerhalb des display-wrappers
	        if(maxaverage_visible) kwd_showById('analog-speedstats-wrapper');

	        document.getElementById('cssgauge-wrapper').style.top = '10px';	        
	        //$('#cssgauge-wrapper').show();
	        //document.getElementById('cssgauge-wrapper').style.display = 'block';  // just see if error :-)
	        //$('#digital-on-analog').show();    
	        document.getElementById('digital-on-analog').style.display = 'block';
	        //$('#cssgauge').addClass('dona');
	        document.getElementById('cssgauge').classList.add('dona');
	        displayDigitalspeed.hide();
	        //$('#digitalspeed-wrapper').hide();
	        document.getElementById('digitalspeed-wrapper').style.display = 'none';   
	    }
	    else if (a && !d) {
	        cssgauge_visible = true;
	        if(maxaverage_visible) kwd_showById('analog-speedstats-wrapper');
	        
	        document.getElementById('cssgauge-wrapper').style.top = '10px';
	        //kwd_showById('cssgauge-wrapper'); // $('#cssgauge-wrapper').show(); 
	        kwd_hideById('digital-on-analog'); //$('#digital-on-analog').hide();
	        document.getElementById('cssgauge').classList.remove('dona'); //$('#cssgauge').removeClass('dona');
	        displayDigitalspeed.hide();
	        kwd_hideById('digitalspeed-wrapper'); //$('#digitalspeed-wrapper').hide();   
	    }
	    else if (!a && d) {
	        cssgauge_visible = false;
	        if(maxaverage_visible) kwd_hideById('analog-speedstats-wrapper');
	        
	        document.getElementById('cssgauge-wrapper').style.top = '-2000px';
	        //$('#cssgauge-wrapper').hide();
	        //document.getElementById('cssgauge-wrapper').style.display = 'none';	        
	        displayDigitalspeed.show();
	        //$('#digitalspeed-wrapper').show();
	        document.getElementById('digitalspeed-wrapper').style.display = 'block';   
	    }
	    else {
	        cssgauge_visible = false;
	        document.getElementById('cssgauge-wrapper').style.top = '-2000px';
	        //kwd_hideById('cssgauge-wrapper'); //$('#cssgauge-wrapper').hide();
	        displayDigitalspeed.hide();
	        kwd_hideById('digitalspeed-wrapper'); //$('#digitalspeed-wrapper').hide();
	    }
	}
	else {
		//$('#tacho-container').hide();
		kwd_hideById('tacho-container');
		cssgauge_visible = false;
		displayDigitalspeed.hide();
	}

}


//Add messages to log.
// log is an array since we don't when we can first access the output we like
// thus array can be read later
logarray = []; // global
function Log( msg ) 
{ 
    logarray.push(msg);
    if (kta.browsermode) app.Debug(msg);
    /*
if( txt.GetLineTop( txt.GetLineCount() ) >= 0.2 )  
        log.shift(); 
    log.push( msg + "\n" ); 
    txt.SetText( log.join("") );
*/
    //txt.SetText(msg);
} 

function getDisplayHeight() {
	var h;
	
 	if(kta.useSystemSize && window.devicePixelRatio) {
		h = app.GetDisplayHeight() / window.devicePixelRatio; 		
 	}
 	else { 
	 	//TODO: problem: when sys you must get css pixel ratio
	    // get vars and test, since we got problems with body.client... vs. window.innerheight
		h = window.innerHeight || document.documentElement.clientHeight	|| document.body.clientHeight;
	}
	
	return h;
}

function getDisplayWidth() {
	
	var w;
	
 	if(kta.useSystemSize && window.devicePixelRatio) {
		w = app.GetDisplayWidth() / window.devicePixelRatio; 		
 	}
 	else { 
	 	//TODO: problem: when sys you must get css pixel ratio
	    // get vars and test, since we got problems with body.client... vs. window.innerheight
		w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		
		//app.Debug('display innerWidth: '+window.innerWidth);
		//app.Debug('display documentElement.clientWidth: '+document.documentElement.clientWidth);
		//app.Debug('display body.clientWidth: '+document.body.clientWidth);
		//app.Debug('display $(window).width: '+$(window).width());
	}
	
	return w;
}

//TODO: give also ratio
function getDisplayMinSize() {
	var s = getDisplayWidth();
	var s2 = getDisplayHeight();
	if (s < s2) return s;
	else return s2; 
}

/* berechnet alle Größen und Positionen der Anzeigen
 * - initial: gesetzt wenn bei Programmstart aufgerufen
 * TODO: not 'initial' but put all this stuff into initApp
 */
function scaleDisplays(initial) {
		
    app.Debug("scaleDisplays: "+(initial ? 'app start' : 'normal'));
    // TODO: catch the case window.devicePixelRatio is not existent or set to 0 (could be in old browser versions)
    app.Debug('window.devicePixelRatio: '+window.devicePixelRatio);
 
	
	var screen_h = getDisplayHeight();
	var screen_w = getDisplayWidth();
	var def_margin = kta.defaultMargin;

    var w = 0;
    var h = 0;
    var screen_longest;
    var zoom_treshhold = 1.8; // TODO: must be changed due to zoom and tablet ??
    
    if (screen_w <  screen_h) {
       isLandscape = false;
       w = screen_w;
		screen_longest = screen_h; 
	    // adapt banner size
	    kta.kstage.changeAdBanner('100%',(screen_h*0.1)+'px');
    }
    else {
       isLandscape = true;
       w = h = screen_h;
       screen_longest = screen_w; 
	    // adapt banner size
	    kta.kstage.changeAdBanner('100%',(screen_h*0.2)+'px');
    }
    
    
    var screen_analog = screen_longest / zoom_treshhold;
    
	// set the positioners to a certain initial width:
	// (otherwise displays can not init to a certain size)
	//$('.positioner').css('width',screen_w); // first set screen width for all
	var posis = document.getElementsByClassName('positioner');
	for (var i=posis.length-1;i>=0;i--) {
		posis[i].style.width = screen_w - (def_margin * 2) + 'px';	
	}

    var i = 0;
    
	// TODO: unbedingt in position displays verschieben
   	// current idea: must not be larger than half of longest dimension of screen - except zoom mode
    // TODO: consider kta.tablet + gauge.zoom | analogDisplays.zoom
    // - gauge will be centered later
    // - no limitation when no other displays
    //if (cssgauge_visible) {
    	var gaugesize = w;
    	// TODO: switch zoom here (for digital zoom can be controlled by positionDisplays)
   		//if (!displays.noneVisible() && w > screen_analog) gaugesize = screen_analog;
   		if(kta.tablet && w > screen_analog) gaugesize = screen_analog;
	    var el = document.getElementById('cssgauge-wrapper');
	    if (el) {
	    	el.style.width = gaugesize - (def_margin*2) + 'px';
	    	el.style.height = gaugesize - (def_margin*2) + 'px';
	    }
	    gauge.scale();
    //}
    
    // unfortunately border radius + width are set here as element style 
    // which override css class settings
    // thus skin class switch can't work without JS
    // we must recognize skin here!
    
	// calculate border radius of box-wrappers
	// because a) be independend of text size of device
	// and b) make sure older webkit-implementations work (css viewport units may not be recognized)
	// and c) no fixed size due to very small device screens
	
	var cborderradius = cborderwidth = 1;
	var checkel = document.getElementById('cssgauge'); // just *any* element which is affected by .skin
	if (!checkel.classList.contains('skin-minimal') && !checkel.classList.contains('skin-subtle')) 
	{
		cborderradius = getDisplayMinSize() * 0.1;
		//app.Debug('box-wrapper border: '+cborderradius+' ('+window.devicePixelRatio+')');	
		// new: border width depend on gauge border (= 1/30 of its size)
		cborderwidth = gaugesize / 30;
	}
	
	// 
	
	var els = document.getElementsByClassName('box-wrapper');
	for(i=els.length-1;i>=0;i--) 
	{
		els[i].style.borderRadius = cborderradius + 'px';
		els[i].style.webkitBorderRadius = cborderradius + 'px';
		els[i].style.borderWidth = cborderwidth + 'px'; 
		//app.Debug('set 1 box-wrapper');
	}
	
	// handle border width of avr/max on analog
	// separate is easiest due to symmetry
	var el = document.getElementById('averagespeed');
	el.style.borderWidth = cborderwidth + 'px';
	el.style.borderLeftWidth = 1 + 'px';
	var el = document.getElementById('maxspeed');
	el.style.borderWidth = cborderwidth + 'px';
	el.style.borderRightWidth = 1 + 'px';

	// zentriere alle Dialoge:
	// - nur sichtbare
	// - wird nur gebraucht on resize mit offenem dialog
	if(initial || kta.onResize) {
		var els = document.getElementsByClassName('dialog');
		for(i=els.length-1;i>=0;i--) {
			//app.Debug('computed:'+getComputedStyle(els[i],null).display);
			if(getComputedStyle(els[i],null).display != 'none') {  // TODO: lieber flag oder visible oder translate arbeiten
				kta.centerVisibleDialog(els[i].id);
			}
		}
	}		
	    
    if (initial) {    
    
	    // digital on analog speed size
	    // now orientated to position and size of #cssgauge (not screen at all!)
	    // ! note that this is only needed when *initial* since it is scaled together with gauge 

		//var cssgaugewidth = $('#cssgauge').width(); // here NOT outerWidth! 
		var cssgaugewidth = document.getElementById('cssgauge').clientWidth; // here NOT outerWidth! 
	    var wdona = cssgaugewidth * 0.4; 
	    var newfontsize = wdona/2;
	    
		dona.resize(wdona,0,'width'); // glob var
		
		
	    /*jquery:$("#digital-on-analog").css({
	        'left': (cssgaugewidth - $('#digital-on-analog').width()) / 2,
	        'top':  (cssgaugewidth - $('#digital-on-analog').height()) / 2
		});*/
		// TODO: you must WAIT or try to make is as ONE (read the diff between inner width and width --> know in advance which result width will be)
		var el = document.getElementById('digital-on-analog');
		el.style.left = (cssgaugewidth - el.clientWidth) / 2 + 'px';
		el.style.top =  (cssgaugewidth - el.clientHeight) / 2 - 10 + 'px'; // 10px oberhalb Miitt

	    // size and position of info (km/h) on analog must depend on cssgauge
	    /*jquery: $('#info-on-analog').css({
	        'width':cssgaugewidth/2.7+'px',
	        'height':'auto',
	        'top':cssgaugewidth*0.73+'px',
	        'left':((cssgaugewidth-(cssgaugewidth/2.7))/2)+'px', // must be same ratio like in width
	        'font-size':cssgaugewidth/20+'px',
	        'line-height':'1em'
	    });*/
	   
	   // TODO: wenn gauge auch halbkreis wird, muss man genau darauf achten, wann gauge width und wann height verwendet wird!!!
		var el = document.getElementById('info-on-analog');
		if(el) {
			el.style.width = cssgaugewidth/2.7+'px';
			el.style.height = 'auto';
			el.style.top = (cssgaugewidth*0.7)+'px'; // 0.32 0.6 0.7	
			el.style.left = ((cssgaugewidth-(cssgaugewidth/2.7))/2)+'px', // must be same ratio like in width
			el.style.fontSize = (cssgaugewidth/20)+'px';
			el.style.lineHeight = '1em';
		}
	
	    //$('#digital-on-analog .speed').css({'font-size':''+newfontsize+'px'});
	    // position digital
	    // dona-text is a div inside:
	    
	    // dona-text 
	    // - save width with max. digits (4)
	    // - make the width fixed
	    // - now you scale to a) size with 4 digits b) to bigger size with 3 digits
	    // - for b) you must calculate the difference in width (about 1/4 == 1 digit)

        
        // TODO: this is all disabled since 26.9. 15:50 because we want introduce dona as a display-box
        /*jquery
        $('#dona-text').css({
            // the width will be set her ONCE
            'width': dona_scalebase + 'px'
        });
        
        // compute scale for 4 digits (0000):
        dona_scale4 = dona_space / dona_scalebase;
        dona_scale3 = dona_space / (dona_scalebase*0.75);
        dona_text_scale(dona_scale3);
        // replace inital 0000 text
        $('#dona-text').text('0');

	    // only correct centered position
	    // - the css width is not changed anymore
	    // - must take width of #digital-on-analog as ref
	    $('#dona-text').css({
	        'left': ($('#digital-on-analog').width() - $('#dona-text').width()) / 2 + 'px', 
	        'top': ($('#digital-on-analog').height() - $('#dona-text').height()) / 2 + 'px'
	    });
	    */
	   
	   // correct border-radius
    }
    
    kta.onResize = false;
    
}    // scaleDisplays

/* adjusts positions, proportions and sizes of displays,
 * depending on which display is currently visible
 * - also perfoms scaling of displays
 * - ! do not set height of positioner but of wrapper
 *
 * TODO: Wenn keine zusatz-displays:  Digital & avr/max ist Höhe begrenzt --> Höhe vorab berechnen und scale inkl. y-Wert 
 */
function positionDisplays() {
		
	
	var hscreen = getDisplayHeight(); // TODO: put into kta!
	var screen_w = getDisplayWidth();
	var screen_ratio = screen_w / hscreen;
	var def_margin = kta.defaultMargin;
	
	// TODO inside display objects??
	// only use this on outer #...-positioner
	var digitalspeed_height =  0; // only needed later as result value
	var digitalspeed_width = 0;  // must be set when visible!
	var digitalspeed_top = 0;
	
	var displays_height = hscreen;
	var displays_width = screen_w;
	var displays_top = 0;
  	
 	//app.Debug('position screen: '+screen_w+'x'+hscreen);
 	
	// TODO: may be better more complicated "if" but fewer calculations!
	// - analog: never resize (until ZOOM is introduced) but influences displays
	// - digitalspeed: always scaleto y=free, depending on displays visible, only height at last
	// - displays visible: always scaleto y=free/auto, but dependend on width given by tacho
	
	// analog (only center or not)
				
	var cssgaugewrapper = document.getElementById('cssgauge-wrapper');


	if(cssgauge_visible) {

		var cssgauge_size = cssgaugewrapper.offsetWidth; // width == height
		var gaugeleft = 0;
		var gaugetop = 0;
		var maxaverage_size = (screen_w / 2 - def_margin*2	); // must be applied to display-boxes // 10 == gap
		var maxaverage_height = 0; // adjust depending on orientation + displays + skin
		var maxaverage_left = 0; // must be applied to analog-speedstats-wrapper
		var maxaverage_bottom = 0; // must be applied if landscape
		//var maxaverage_bottom = 10; // when top == 0, this overrides maxaverage_top
		var maxaverage_wrapper_width = screen_w - def_margin*2;
		var maxaverage_backcolor = 'black';
		
		if (isLandscape) {
			
			
			if(displays.noneVisible()) {
				gaugeleft = (screen_w - cssgauge_size) / 2 - def_margin;
				//maxaverage_size /= (screen_ratio * 0.95); // factor from max possible width
				maxaverage_backcolor = 'transparent';
			} 
			else {
				maxaverage_wrapper_width = cssgaugewrapper.offsetWidth; 
			}
			// size (height) always corresponding to gauge size
			maxaverage_size = cssgauge_size / 2 - def_margin;
			// always center vertically:
			gaugetop = (hscreen - cssgauge_size) /2 - def_margin - 2; // -2 due to rounding errors of scaled gauge
			maxaverage_bottom = - gaugetop; // TODO: check if margin must be included
		}
		else {
			//maxaverage_top = cssgaugewrapper.offsetHeight - cssgaugewrapper.offsetHeight * 0.3; // TODO: ask height of speedstats
			//maxaverage_bottom =  hscreen - cssgauge_size;
			// always center horizontally
			gaugeleft = (screen_w - cssgauge_size) / 2 - def_margin;
			//maxaverage_wrapper_width = cssgaugewrapper.offsetWidth; 
			maxaverage_size = cssgauge_size / 2 - def_margin;			
		}
		
		cssgaugewrapper.style.top = gaugetop + 'px';
		cssgaugewrapper.style.left = gaugeleft + 'px';
		

		// Setze Größen von max/average auf analog
		maxaverage_height = (maxaverage_size * 0.4) ;
		analogMaxSpeed.resize(maxaverage_size*0.8,maxaverage_height,'');
		document.getElementById('maxspeed').style.width = maxaverage_size + 'px';
		analogAverageSpeed.resize(maxaverage_size*0.8,maxaverage_height,'');
		document.getElementById('averagespeed').style.width = maxaverage_size + 'px';
		var ma_wrapper = document.getElementById('analog-speedstats-wrapper');
		ma_wrapper.style.width = maxaverage_wrapper_width + 'px';
		ma_wrapper.style.left = maxaverage_left + 'px';
		//ma_wrapper.style.backgroundColor = maxaverage_backcolor;
		ma_wrapper.style.bottom = maxaverage_bottom + def_margin +'px';
		//ma_wrapper.style.top = 'auto';
		//app.Debug('maxaverage_bottom: '+maxaverage_bottom);
		//ma_wrapper.style.bottom = maxaverage_bottom + 'px';
	}
	
	// digital (scale full or half)
	
	else if (displayDigitalspeed.isVisible()) {

		var statwrap = document.getElementById('digital-speedstats-wrapper');
		statwrap.style.position = 'relative';
		statwrap.style.bottom = 'auto';			

		
		digitalspeed_width = screen_w;
		
		if (isLandscape && !displays.noneVisible()) {
			digitalspeed_width = screen_w / 2;
		}
		
		/*jquery: $('#digitalspeed-positioner').css({ // you can set with but not height to absolute
			'width':digitalspeed_width+'px'
		});*/
		document.getElementById('digitalspeed-positioner').style.width = digitalspeed_width+'px';
		// screen cannot be sooo stretched, that resize must depend on height in landscape mode
		// you can use scaleto (although it is called twice when displays visible) -> TODO:
		//TODO: also easier in object: before each scaleto, height must reset to 'auto'
		//$('#digitalspeed-wrapper').css('height','auto');
		var el = document.getElementById('digitalspeed-wrapper');
		el.style.height = 'auto';
		
		// hier werden digital + enthaltene max/average scaled:				
		//displayDigitalspeed.resize(el.clientWidth,0,'width');
		
		var y = 0;
		if (isLandscape && displays.noneVisible()) {
			y = hscreen  - 40; // TODO: wie margin etc. korrekt in var oder auslesen??
		}		
		// Funktion scaleTo teilt Platz auf, abhängig von sichtbaren avr/max
		digitalSpeedDisplays.scaleTo(el.clientWidth,y);
		
		// must be after scale
		//digitalspeed_height = $('#digitalspeed-wrapper').outerHeight(true);
		//digitalspeed_height = parseFloat(el.offsetHeight  + el.style.marginTop + el.style.marginBottom); // you really have to WAIT here!!!!
		digitalspeed_height = parseFloat(el.offsetHeight + def_margin *2);

		if(isLandscape) {
			digitalspeed_top = (hscreen - digitalspeed_height)/2;
		}
		
	}
	
	// displays-block
	
	var displayswrapper = document.getElementById('displays-wrapper');

	if(!displays.noneVisible()) {

		//$('#displays-wrapper').show();
		displayswrapper.style.display = 'block';
		
		
		// width only cut in landscape
		if(isLandscape) {
			
			displays_top = 0;
			
			if(displayDigitalspeed.isVisible()) {
				displays_width -= digitalspeed_width;
			}
			else if (cssgauge_visible) {
				//displays_width -= $('#cssgauge-wrapper').outerWidth(true);
				// TODO: check if 'auto' or other strings can be here 		
				// TODO: geht so nicht!
				displays_width -= parseFloat(cssgaugewrapper.offsetWidth) + def_margin;
			}
		}
		// and height in portrait
		else {
			if(displayDigitalspeed.isVisible()) {
				displays_top = digitalspeed_height; 
			}
			else if (cssgauge_visible) {
				//displays_top = $('#cssgauge-wrapper').outerHeight(true);
				displays_top = parseFloat(cssgaugewrapper.offsetHeight) + def_margin;
			}
			displays_height -= displays_top;
		}
				
		// left position and width
		// TODO: more calcs???
		/*jquery: $('#displays-positioner').css({
			'width':displays_width+'px',
			'left':screen_w-displays_width+'px'
		});*/
		var displayspositioner = document.getElementById('displays-positioner');
		displayspositioner.style.width = displays_width+'px';
		displayspositioner.style.left = screen_w-displays_width+'px';
		
		// get offset  for layout (borders margin) depending on landscape
		// TODO: you have to WAIT again
		var layoutoffset_x = displays_width - displayswrapper.clientWidth; // TODO: make it *once* and save
		var layoutoffset_y = displayspositioner.clientHeight - displayswrapper.clientHeight; // TODO: make it *once* and save
		//app.Debug('offsets:'+layoutoffset_x+'-'+layoutoffset_y);
		
		//TODO: also easier in object: before each scaleto, height must reset to 'auto'
		//$('#displays-wrapper').css('height','auto');
		displayswrapper.style.height = 'auto';
		displays.scaleTo(displays_width-layoutoffset_x,0); // y:0 for receiving maximized heights 
		
		if (displays_height < (displayswrapper.offsetHeight + def_margin*2)) { 
			displays.scaleTo(displays_width-layoutoffset_x,displays_height-layoutoffset_y); // not hspace but inner height due to layout of wrapper!!
		}
				
		// y center the scaled displays if not height > hscreen
	
		if (isLandscape) { // y center only in landscape now			
			displays_height = parseFloat(displayswrapper.offsetHeight + displayswrapper.style.marginTop + displayswrapper.style.marginBottom); // must be taken after scaleTo !
			if (displays_height < hscreen) displays_top = (hscreen - displays_height - def_margin*2) / 2;	
		}				
		
		// change vars to adjust digitalspeed-positioning
		
	} // displays visible
	else {
		// this is always when no displays seen:
		//$('#displays-wrapper').hide();
		displayswrapper.style.display = 'none';
	}
	
	
	// adjust vertical position + height of displays and digitalspeed
	// - height can be preset by scaleTo (but not manually/directly)
	// - top must not be set already
	 
	if (isLandscape && displayDigitalspeed.isVisible() && !displays.noneVisible()) {

		var statwrap = document.getElementById('digital-speedstats-wrapper');
		
		// check which is larger!
		if(displays_height>digitalspeed_height) {				
			digitalspeed_height = parseFloat(displayswrapper.offsetHeight + displayswrapper.style.marginTop + displayswrapper.style.marginBottom);
			digitalspeed_top = displays_top;
			displays_height = 'auto';
			
			statwrap.style.position = 'absolute';
			statwrap.style.bottom = '0px';
		}
		else {
			// displays set top to digitalspeed
			displays_top = digitalspeed_top;
			//displays_height = $('#digitalspeed-wrapper').outerHeight(); // does work when both things have same layout
			var digiwrap = document.getElementById('digitalspeed-wrapper');
			displays_height = digiwrap.offsetHeight + digiwrap.style.marginTop + digiwrap.style.marginBottom; // does work when both things have same layout			
			digitalspeed_height= 'auto';
			
			statwrap.style.position = 'relative';
			statwrap.style.bottom = 'auto';			
		}		
	}
	else { 
		// may be double // TODO: remove when else working
			displays_height = 'auto';
			digitalspeed_height = 'auto';		
	}
	
	// set top and height of digital + displays
	
	/*$('#digitalspeed-positioner').css({
		'top':digitalspeed_top+'px',
		'left':0                           // just to be sure
	});*/
	var digipos = document.getElementById('digitalspeed-positioner');
	digipos.style.top = digitalspeed_top+'px';
	digipos.style.left = 0;
	
	//$('#digitalspeed-wrapper').css('height',digitalspeed_height); // ! height can also be string "auto"
	document.getElementById('digitalspeed-wrapper').style.height = digitalspeed_height + 'px';
		
	/*$('#displays-positioner').css({
		'top':displays_top+'px',
		'left':screen_w - displays_width +'px'
	});*/
	var dispos = document.getElementById('displays-positioner');
	dispos.style.top = displays_top + 'px'; // TODO: check if works better without px
	dispos.style.left = (screen_w - displays_width) + 'px'; // TODO: check if works better without px
	
	//$('#displays-wrapper').css('height',displays_height); // ! height can also be string "auto"
	displayswrapper.style.height = displays_height + 'px';
	
}


/* central proc to save/restore the tacho range (persistent app settings).
  mode: "load" | "save" (if not set, performs load!)
  value: speed to be set (if "load", value is default in case load fails), if value not set or set to <=0, the CURRENT value will be taken if available
  return: -1 : error, else value which has been set
  
  ! save routine is inside gpstool.tachoRange
  
  TODO: check if it is possible that function runs before gpstool is defined!
*/
function resetTachoRange(mode,value) {
    
    // TODO: test change value
    
    if (mode=='save') {
        
        if (value && value>0) {
            gpstool.tachoRange(-value); // minus --> force set
        }
        else value=-1;
    }
    else {
        var c = app.LoadNumber(storage_tachorange,value);  // default==10, if no value found
        gpstool.tachoRange(-c); // neg. value -> force set    
    }

    return value;
}
    
 
// global vars
var displayHints = true;
/*
zählt bis 2 oder 3 (mit resize) um initApp() zu starten
10: init bereits ausgeführt */

function setTachoUnits(newunits) {
	var txt = '';
	var factor = 1;
	switch(newunits) {
		case 'mph' : txt = 'mph'; factor = 2.236936; showHint('Miles per hour','Meilen je Stunde'); break;
		case 'ms'  : txt = 'm/s'; factor = 1; showHint('Meters per second','Meter je Sekunde'); break;
		case 'kn'  : txt = 'kn'; factor =  1.9438445; showHint('Knots','Knoten'); break;
		default : txt = 'km/h'; factor =   3.6; showHint('Kilometers per hour','Kilometer je Stunde'); break;
	}
	gpstool.speedFactor(factor,txt); // save txt, makes later print of correct values easier
	//$('.tachounit').text(txt);
	var els = document.getElementsByClassName('tachounit');
	for(var i=els.length-1;i>=0;i--) {
		els[i].innerHTML = txt; // TODO: use nodeValue		
	}
	gpstool.maxSpeed(gpstool.maxSpeed(),true); // the max-value display with current value 
	gpstool.averageSpeed(0); // ==0 leads to refresh without changing the values
}    

function setAltimeterUnits(newunits,showhints) {
	var txt = '';
	var factor = 1;
	if(newunits=='setalt-ft') {
		txt = 'ft';
		factor = 3.280839;
		if (showhints!==false) showHint('Feet','Fuß');
	}
	else {
		txt = 'm';
		factor = 1;
		if (showhints!==false) showHint('Meters','Meter');
	}
	gpstool.altitudeFactor(factor);
	
	//$('.altitudeunit').text(txt);
	var els = document.getElementsByClassName('altitudeunit');
	for(var i=els.length-1;i>=0;i--) {
		els[i].innerHTML = txt; // TODO: use nodeValue		
	}
}    



var kwd_addEvent = (function( window, document ) {
 if ( document.addEventListener ) {
  return function( elem, type, cb ) {
   if ( (elem && !elem.length) || elem === window ) {
    elem.addEventListener(type, cb, false );
   }
   else if ( elem && elem.length ) {
    var len = elem.length;
    for ( var i = 0; i < len; i++ ) {
     addEvent( elem[i], type, cb );
    }
   }
  };
 }
 else if ( document.attachEvent ) {
  return function ( elem, type, cb ) {
   if ( (elem && !elem.length) || elem === window ) {
    elem.attachEvent( 'on' + type, function() { return cb.call(elem, window.event); } );
   }
   else if ( elem.length ) {
    var len = elem.length;
    for ( var i = 0; i < len; i++ ) {
     addEvent( elem[i], type, cb );
    }
   }
 };
}
})( this, document );



/* may change in behaviour - uses click for browsermode
 * 
 */
function kwd_addTouchEvent(addid,addclass,newcallback) {
	
	var eventtype = kta.browsermode ? 'click':'touchstart';
	
	if(addid) {
		
		document.getElementById(addid).addEventListener(eventtype,newcallback);
	}
	else if(addclass){
		var els = document.getElementsByClassName(addclass);
		for(var i=els.length-1;i>=0;i--) {
			els[i].addEventListener(eventtype,newcallback);
		}
	}
	
}

/* do not check fastoptions here!! */
function kwd_setTimeFormat(evt) {
	
		settings.switchit('settimeformat');

		if (kta.clockseconds) {
			kwd_hideById('seconds-text'); //$('#seconds-text').hide();
			kta.clockseconds = false;
			showHint('Seconds off','Sekunden aus');
		}
		else {
			kwd_showById('seconds-text','inline'); //$('#seconds-text').show();
			kta.clockseconds = true;
			showHint('Seconds on','Sekunden an');
		}
}

function refreshall() {
	        // resize after init
		scaleDisplays(false);
		//ORI scaleDisplays(); // wenn später korrekt arbeitet, dürfte doppelter Aufruf egal sein!!
		positionDisplays();

}

/* returns speed unit as readable text
 * - depends on autosettings
 */
function getCurrentSpeedUnits() {
	var  dunit = 'km/h';
	if(settings) {
		if(settings.get('setmph')) dunit = 'mph';
		else if(settings.get('setkn')) dunit = 'kn';
		else if(settings.get('setms')) dunit = 'm/s';
	}
	return dunit;
}


function processTouchEvent(element) { 
	
		// always handle menubutton:
		if (menustack.current()===false && kta && kta.menubutton)
		{
			kta.menubutton.show();
			resetMenuButtonFade();
		}
		// Nachdem spezielle Abfragen/Anpassungen, id für switcher/button gleichsetzen
		var check = element.kwdSwitcherId || element.kwdButtonId || element.kwdDisplayId;
		if(!check) 
		{
			// name for general click
			check = "undetermined_touch"; 
		}
		app.Debug("touch event: "+check);

		// all menu items are handled here too

    	resetMenuFade();  // TODO: nicht bei kwdDisplayId
    	var dodefault = false; // assume to find an entry *here*
        var doPosition = false;
        var unittext = '';
        	        
        switch (check) {
        	case 'setlanguage':
		    	if (kta.language=='de') {
		    		setLanguage('en');
		    		showHint ('Erneut tippen für Deutsch');
		    	}
		    	else {
		    		setLanguage('de');
		    		showHint ('Touch again for English');
		    	}
		    	app.SaveText(kta.storage.language,kta.language); // new val already in kta.language
		        break;
        	case 'moresettings':
		        menustack.push('moresettingsdialog');
        		break;
        	case 'showinfo':
		        showAppInfo();
		        break;
		    case 'tachosettings':
    	        menustack.push('tachosettingsdialog');
    	        break;
    	    case 'altitudesettings':
		        menustack.push('altitudeunitsettings');
    	        break;
            case 'tachoswitch' :
            	if(settings.get(check)==false) {
            		layout_gauges ++;
            	}      
            	else layout_gauges --;
                settings.switchit(check);
                setTachoLayout();            	
                doPosition = true;
            	break;
            case 'digitalanalog':     	
            case 'digital' :
            case 'analog' :
            	settings.radio('radio',check);
            	if(settings.get('tachoswitch')!=true) settings.switchit('tachoswitch'); // always activate tacho as well
                setTachoLayout();            	
                doPosition=true;
                break;
            case 'switchtime':
                if(settings.switchit(check)) {
                	displayTime.show();
                	layout_gauges++ ;
                	startClock();
                }
                else {
                	displayTime.hide();
                	layout_gauges--;
                	stopClock();
                }
                doPosition = true;
                break;
            case 'switchaltitude':
                
                if(settings.switchit(check)) {
                	displayAltitude.show();
                	layout_gauges++ ;
                }
                else {
                	displayAltitude.hide();
                	layout_gauges--;
                }
                doPosition = true;
                break;
            case 'switchposition':
                if(settings.switchit(check)) {
                	displayLocation.show();
                	layout_gauges++ ;
                }
                else {
                	displayLocation.hide();
	                layout_gauges--;
                } 
                doPosition = true;
                break;
			case 'switchaccuracy':
				if(settings.get(check)===false) { // can be true|false|undefined
					layout_gauges = kta.kstage.accuracy.show(settings,check,layout_gauges);
				}
				else {
					layout_gauges = kta.kstage.accuracy.hide(settings,check,layout_gauges);
				}
				doPosition = true;
				break;
            case 'switchhudsettings':
           		gpstool.switchHud();
                if(settings.switchit(check))
                {
                	// needed for android SDK which reads the href value
                	// to perform an action in the framework-app activity
                	document.getElementById('switchhudsettings').setAttribute('href', "#switchhud_on");
                	kta.kstage.changeAdBanner('','',false);
                }
                else 
                {
                	// need for android SDK which reads the href value
                	document.getElementById('switchhudsettings').setAttribute('href', "#switchhud_off");
                	kta.kstage.changeAdBanner('','',true);
                }
            	break;
            case 'switchwarning':
                if (settings.switchit(check)) {
                    displayHints = true;
	                showHint('All notes active','Alle Hinweise aktiviert.');
	                if(kta.debug) 	{
						if(!kta.mydebug) kta.mydebug = app.CreateDebug();
						app.ShowDebug(true);
					}
                }
                else {
                  showHint('All notes disabled','Alle Hinweise deaktiviert.');
				  displayHints = false;
	                if(kta.debug) 	{
						app.ShowDebug(false);
					}					  
				}  
                
                break;
            case 'switchautorange':
            	/*if(settings.get('tachoswitch')!=true) {
            		settings.switchit('tachoswitch');
            		layout_gauges++;
            		doPosition = true;
            	}
            	setTachoLayout();
                */
               resetTachoRange("save",10);  // current minimum
                showHint('Speedometer auto range reset','Auto-Bereich zurückgesetzt');
                break;
            case 'switchunits':
            	menustack.push('unitsettings');
				break;
            case 'setkmh': unittext = 'kmh'; break;      	
            case 'setmph': unittext = 'mph'; break;    	
            case 'setms':  unittext = 'ms'; break;   	
            case 'setkn':  unittext = 'kn'; break;   	
            case 'switchfastoptions':
            	settings.switchit(check);
     			kta.fastOptions(!kta.fastOptions()); // = toggle
            	break;
            case 'dona-tachounit':
            case 'kmh-digital':
				if (kta.fastOptions()) {
					var newunit = 'kmh';
					if(settings.get('setkmh')) newunit = 'mph';
					if(settings.get('setmph')) newunit = 'kn';
					if(settings.get('setkn')) newunit = 'ms';
					setTachoUnits(newunit);
					settings.radio('unitradio','set'+newunit);
				}
				else dodefault = true;					
            	break;
            	
			case 'tacho-container' :
		    	if(kta.fastOptions() && settings.get('tachoswitch')!=false) {
		    		var next;
		    		if (settings.get('digitalanalog')!=false) next = 'digital';
		    		else if (settings.get('digital')!=false) next = 'analog';
		    		else next = 'digitalanalog';
		    			
			       	settings.radio('radio',next);
			        setTachoLayout();            	
			        doPosition = true;
			        switch(next) {
			        	case 'digitalanalog':showHint('Touch again for Digital display','Erneut Tippen für Digital'); break;
			        	case 'digital': showHint('Touch again for Analog display','Erneut Tippen für Analog'); break;
			        	case 'analog': showHint('Touch again for both displays','Erneut Tippen für Digital + Analog'); break;
			        }
		    	} else dodefault = true;
		    	
		    	break; 
            	
            	
            case 'm-alt':
            	if (kta.fastOptions()) {
					if(settings.get('setalt-ft')) check = 'setalt-m'; // TODO: getter of set element of a radio group
	            	else check = 'setalt-ft';
	            }
	            else {
	            	dodefault = true;
	            	break; // break nur im else und nicht unten!
	            }
            case 'setalt-ft':
            case 'setalt-m':
            	settings.radio('altunits',check);
            	setAltimeterUnits(check);
            	//OnBack();
            	break;
            case 'geoaltitude':
            	var au = 'm';
            	if (settings.get('setalt-ft')) au = 'ft';
				showHint('Altitude in '+au,'Höhe in '+au);
            	break;
			case 'time': 
				// teste if + break!
				if (!kta.fastOptions()) break;
			case 'settimeformat':
				kwd_setTimeFormat(); // TODO: repeat function with *menu entry* for case fast_options == off
				break;
			case 'geolocation':
			    if(kta.fastOptions()) {    		
			        if(gpstool.switchLocFormat()=='decimal') 
			        	showHint('Touch again for degree values','Tippen für Grad-Anzeige');
			        else showHint('Touch again for decimal values','Tippen für Dezimal-Anzeige');
		    	}
				break;
			// all dismissable dialogs
            case 'switchnews3':
            case 'switchredwarning':
            case 'switchkeepmaxspeed':
            case 'switchkeepaveragespeed':
            	settings.switchit(check);
            	break;
            case 'switchdialogs':
        		menustack.push('explainswitchdialog');
            	break;
            case 'resetmaxspeed':
				menustack.push('askresetmaxspeed',true); // TODO: error when second param not yet used?
				break;
            case 'resetaveragespeed':
				menustack.push('askresetaveragespeed',true); // TODO: error when second param not yet used?
				break;
			case 'switchskins':
				menustack.push('skinsettingsdialog');
				break;
			case 'setskin-default':
			case 'setskin-glass':
			case 'setskin-subtle':
            	settings.radio('skinradio',check);				
				kta.setSkin(check);					
				break;
			case 'averagespeed':
			case 'digital-average':
				// scheint zu funktionieren, da von innen nach außem Event gefunden :-)
				var u = getCurrentSpeedUnits();
				showHint('Average speed ('+u+')','Durchschnittliche Geschwindigkeit ('+u+')'); // TODO: start Zeit (seit letztem Reset) angeben
				break;
			case 'maxspeed':
			case 'digital-max':
				var u = getCurrentSpeedUnits();
				// scheint zu funktionieren, da von innen nach außem Event gefunden :-)
				showHint('Last maximal speed ('+u+')','Letzte Höchstgeschwindigkeit ('+u+')'); // TODO: start Zeit (seit letztem Reset) angeben
				break;
			case 'switchmaxaverage' :					
				if(settings.switchit(check)) {
					showHint('Max and average value on',' Max- und Mittelwert an');
				}
				else {
					showHint('Max and average value off',' Max- und Mittelwert aus');
				}
				setTachoLayout();
				
				doPosition = true;
				/* ALT					 
				if(settings.switchit(check)) {
					// on
					digitalSpeedDisplays.showMaxAverage(true);
					analogDisplays.showMaxAverage(true);
				}
				else {
					// off
					digitalSpeedDisplays.showMaxAverage(false);
					analogDisplays.showMaxAverage(false);
				}
				*/
				break;				

			// .btn
			
            case '#exit' : Quit(); break;
            case '#cancel' : OnBack(); break; 
            case '#menubutton':
            	if (menustack.current()===false) OnBack();
            	else
            	{
            		menustack.clear();
            		kta.kstage.startBannerCounter();
            		resetHud();
            	}
            	break;
            case '#settings' : OnMenu(); break; // TODO: check if can be started inside menus!! (Hope menus ly over :-)
            case '#info' :
            	showAppInfo();
                break;
			case '#warningcont' :
				// TODO: check if another menu COULD come in between!
				OnBack();
				break;
			case '#confirmresetmaxspeed' : 				
				gpstool.maxSpeed(0,true); 
				showHint('Maximum speed cleared','Höchstgeschwindigkeit gelöscht');
				OnBack();
				break;				
			case '#confirmresetlastmaxspeed' : 
				// bring up confirm dialog				
				OnBack();
				menustack.push('askresetmaxspeed');
				break;				
			case '#confirmresetaveragespeed' : 				
				gpstool.clearAverage();
				showHint('Average speed cleared','Mittlere Geschwindigkeit gelöscht');
				OnBack();
				break;
			case '#confirmresetlastaveragespeed' : 
				// bring up confirm dialog				
				OnBack();
				menustack.push('askresetaveragespeed');
				break;				
			// only android 
			case '#confirmturngpson' :
				if(kta.androidmode) // is redundant
				{
					// TODO: only once when app starts
					Android.callGPSSettings();
				} 
				break;
			case '#confirmresetexplaindialogs':
	            settings.switchit('switchnews3',false);
   	            settings.switchit('switchredwarning',false);
   	            settings.switchit('switchkeepmaxspeed',false);
   	            settings.switchit('switchkeepaveragespeed',false);
   	            OnBack();
				break; 
				
			case 'back-arrow':
				OnBack();
				break;					

            default: dodefault = true;
            	break;
        }

        if (unittext) {
        	// TODO: eleganter: set von 'check' abschneiden und Aufruf (siehe setAltimeterUnits())
        	settings.radio('unitradio',check);
        	setTachoUnits(unittext);
        	//OnBack(); // proceed like Android select menu
        }
        else if(doPosition) {
        	scaleDisplays();
        	positionDisplays();
		}
        // always (cases are checked inside functions)
		startGps();        
		
		return dodefault;
}

/* vereint alle Programmstartfunktionen
(sinn siehe caller)
*/
function initApp()  {

	// TODO: here may be checks whether html not rendered ready (e.g. check a width of a certain important div) -> setTimeout

    kta.tablet = app.IsTablet(); // returns boolean
    kta.initMenuButton('menubutton',kta.tablet);
    
    
	var debugstr = "";
	if (kta.debug) 
	{
		debugstr += kta.stage + ' ';
		if (kta.browsermode) debugstr += "browser ";
		if (kta.androidmode) debugstr += "android-SDK ";
		document.getElementById('debuginfo').innerHTML = debugstr;
	}
	
	
	//DEBUG vs. release vs. Emulator & Test:
	if(kta.browsermode || kta.debug) {
		document.getElementById('splashscreen').style.opacity = 0.5; // debug
		document.getElementById('debuginfo').style.display = 'block';
	}
	if (kta.version) document.getElementById('appversion').innerHTML = kta.version.toFixed(2);
	
    // hide DS note in androidmode
    if(kta.androidmode) {
    	var els = document.getElementsByClassName('droidscriptonly');
    	if (els) {
    		for (var i=0;i<els.length;i++) {
    			els[i].style.display = 'none';
    		}
    	}
    }
    //if(!kta.browsermode) kta.useSystemSize = true;
	
	// add the back arrows to dialogs ()
	var els = document.getElementsByClassName('dialog');
	for(var i = els.length-1;i>=0;i--) {
		var e = els[i];
		if((e.id != 'warningdialog') && (e.id != 'newsdialog')) {
			e.firstElementChild.insertAdjacentHTML('afterbegin','<a href="#back" class="back-arrow"><span class="icon-left-big"></span></a>'); 
		}
		// re-style dialogs for tablet
		/* not until tablet style is ready
		 if(kta.tablet) {			
			e.style.borderTopLeftRadius = '0';
			e.style.borderBottomLeftRadius = '0';
			e.style.borderLeftWidth = '0';
		}*/
	} 
	
	
	
    // init gauge before first scaleDisplays!
	// ! no more auto draw + scale on init gauge (only on later config!) 
    gauge = new CssGauge( {
		'wrapper':'cssgauge-wrapper',
		'gauge':'cssgauge',
		'size':'auto', // not yet implemented !
		'maxRange':10,
		'majorStep':1, // must be < maxRange and reasonable adjusted
		'minorTicks':2, // should be between 0 and 5
		'overallAngle':250, // degrees, better < 340
		'value':0 // must be < max Range
	});

	// generate special ticks for gauge
	analogGaugeMaxTick = gauge.addSpecialTick('#aa0000',0);
	analogGaugeAverageTick = gauge.addSpecialTick('#A87E00',0);
	gauge.draw();
	gauge.setSpecialTickVisibility(analogGaugeMaxTick, false);
	gauge.setSpecialTickVisibility(analogGaugeAverageTick, false);
	gauge.scale();
	gauge.setValue(0);
	//gauge.initSpecialTicks(); // re-init values after re-draw()


	
	// TODO: enable again:-> add to displays list
	// for testing in browser
	if(!kta.browsermode) {
		//kwd_hideById('speedstats'); //$('#speedstats').hide();
		kwd_hideById('switchnightmode'); //$('#resetmaxspeed').hide();
		//kwd_hideById('resetmaxspeed'); //$('#resetmaxspeed').hide();
		//kwd_hideById('resetaveragespeed');//$('#resetaveragespeed').hide();
		//kwd_hideById('maxspeed'); //$('#maxspeed').hide();
		//kwd_hideById('averagespeed'); //$('#averagespeed').hide();
	}

	analogDisplays = new AnalogSpeedBoxList(); 
 	dona = analogDisplays.add('digital-on-analog','--'); // dona must only be scaled once since it is scaled with gauge later
	dona.setFirst(true);
	analogMaxSpeed = analogDisplays.add('maxspeed','--');
	analogAverageSpeed = analogDisplays.add('averagespeed','--');
	
	//scaleDisplays(true); // must be before all the settings-dependend turn-offs of displays (in contrast to positionDisplays)
	
	// init displays
	displays = new DisplayBoxList('geolocation');
	// save all in glob vars too
	// ! order of add must be order in HTML!
	displayTime = displays.add('time');
	displayAltitude = displays.add('geoaltitude','--');
	displayLocation = displays.add('geolocation','--');
	displayAccuracy = displays.add('geoaccuracy'); // TODO: does deny reset text work?
	// TODO: enable again: displayAccuracy.getTextElement().style.fontSize = '35%'; // smaller font than other displays
	
	digitalSpeedDisplays = new DigitalSpeedBoxList();
	displayDigitalspeed = digitalSpeedDisplays.add('digitalspeed','--');
	digitalMaxSpeed = digitalSpeedDisplays.add('digital-max','--','max'); 
	digitalAverageSpeed = digitalSpeedDisplays.add('digital-average','--','average'); 
	
	displayDigitalspeed.setFirst(true);	

	
	// TODO: 10.11.2015 check if new problem
	scaleDisplays(true); // must be before all the settings-dependend turn-offs of displays (in contrast to positionDisplays)


	// object referencing works (changes in displays.[one object] appear in references e.g. displayTime) 
	//var testobject = displays.get('time');
	//app.Debug('set new obj str: '+testobject.testString('thomas') );
	//app.Debug('check obj str in time: '+displayTime.testString() );
	
	
		    
    menustack = new KwdPopupStack();
    settings = new AutoSettings(storage_settings); // string definiert Namen in localstorage // loads saved settings
    

    gpstool = new KwdGpsTools(); //global var speed now named: gpstool
  
    // Tacho range vor möglichem 'hide' laden 
	resetTachoRange("load",10); // default==10, if no value found


    // TODO: layout_gauges sollte man evtl. auch mit einem stack steuern !!
    // TODO: oder integriert in display-objekt-verwaltung
    setTachoLayout();
	if (settings.get('tachoswitch')!=false) layout_gauges++;
	

    // this are the normal hints!
    if(settings.get('switchwarning')==false)  {
        displayHints = false;
    }
    
    if(settings.get('switchtime')==false) displayTime.hide(); else { layout_gauges++; startClock(); }
    if(settings.get('switchposition')==false) displayLocation.hide(); else layout_gauges++;
    // inside the stage function will be decided:
    layout_gauges = kta.kstage.accuracy.init(settings,'switchaccuracy',layout_gauges);
    
    if(settings.get('switchaltitude')==false) displayAltitude.hide(); else layout_gauges++;
	if(settings.get('switchhudsettings')===true) settings.switchit('switchhudsettings'); // auto saved will be overidden here, because all switchers are auto-saved
	
	if (settings.get('settimeformat')==false) {
		kwd_hideById('seconds-text'); //$('#seconds-text').hide();
		kta.clockseconds = false;
	}             

	
	var skin;
	if (settings.get('setskin-glass')) skin = 'setskin-glass';
	else if (settings.get('setskin-subtle')) skin = 'setskin-subtle';
	else skin = 'setskin-default';
	kta.setSkin(skin);
	
	setLanguage(app.LoadText(kta.storage.language,'auto')); // auto bis einmal gesetzt, dann immer definiert
        
	if (settings.get('switchfastoptions')==false) {
		kta.fastOptions (false,false); // 2nd false: don't show any Messages
	}


    //settings.init('backkey',true); // init bewirkt, dass true nur gesetzt wird, wenn es nicht geladen werden konnte
    // init ist meist nicht nötig, wenn im html der gewünschte Anfangsstatus gesetzt ist
    
    // menu for exit instead of back a
    // TODO: what happens on tablets??
    //app.SetMenu( "Einstellungen,Beenden" );

	var units = 'setalt-m';
	if(settings.get('setalt-ft')) units = 'setalt-ft';
	setAltimeterUnits(units,false); // false: don't show any Messages
	units = 'kmh';
	if(settings.get('setmph')) units = 'mph';
	else if(settings.get('setms')) units = 'ms';
	else if(settings.get('setkn')) units = 'kn';
	setTachoUnits(units); // must be after gpstool init

    // push dialog for keeping max/average
	// must be called *after* SetTachoUnits! 
    if(settings.get('switchmaxaverage')) {
    	
		// max
	    if(settings.get('switchkeepmaxspeed')!=true)
	    {
			var maxdata = gpstool.getMaxSpeedData('.lastmaxspeed'); // ! the speed is already put into html  
			if (maxdata.time) {
				kwd_setElementText('.lastmaxspeedunits',maxdata.unittext);
		
				var d = new Date(maxdata.time);
				var comparedate = new Date();
				var namedday = '';
				if(d.getMonth() == comparedate.getMonth() && d.getFullYear() == comparedate.getFullYear()) {
					if (d.getDate() == comparedate.getDate()) namedday = 't';
					// TODO: make work on "month change yesterday"
					else if (d.getDate() == (parseInt(comparedate.getDate()+1))) namedday = 'y';
				}
				
				var datestr = ((d.getHours()<10)?('0'+d.getHours()):(d.getHours())) + ((kta.language=='de') ?('.'):(':') ) + ((d.getMinutes()<10)?('0'+d.getMinutes()):(d.getMinutes()));
				if (kta.language=='de') {
					if (namedday=='y')
						datestr = 'gestern '+datestr;
					else if (!namedday)  				 
						datestr = d.getDate() + '.' +d.getMonth() + '.'+ d.getFullYear() + ' ' +datestr;
					datestr += ' Uhr';
				}
				else {  
					if (namedday=='y')
						datestr = 'yesterday '+ datestr;
					else if (!namedday)  				 
						datestr = d.getMonth() + '/' + d.getDay() + '/' + d.getFullYear() + ' ' + datestr;
					datestr += ' h';
				}
				
				//  TODO: recognize today, yesterday, x days ago
				kwd_setElementText('.lastmaxspeedtime',datestr);
		    	menustack.push('askkeepmaxspeed');
		   }
		}
		
    	// average	

		// TODO: how to make general function? (or better: obj hierarchy with inheritance of code)
	    if(settings.get('switchkeepaveragespeed')!=true) 
		{	
			var avrdata = gpstool.getAverageSpeedData('.lastaveragespeed'); // ! the speed is already put into html  
			if (avrdata) {
				kwd_setElementText('.lastaveragespeedunits',avrdata.unittext);
		
				var d = new Date(avrdata.time);
				var comparedate = new Date();
				var namedday = '';
				if(d.getMonth() == comparedate.getMonth() && d.getFullYear() == comparedate.getFullYear()) {
					if (d.getDate() == comparedate.getDate()) namedday = 't';
					// TODO: make work on "month change yesterday"
					else if (d.getDate() == (parseInt(comparedate.getDate()+1))) namedday = 'y';
				}
				
				// TODO: even this could be sub function
				// TODO: when oop combine functions needed for time display
				var datestr = ((d.getHours()<10)?('0'+d.getHours()):(d.getHours())) + ((kta.language=='de') ?('.'):(':') ) + ((d.getMinutes()<10)?('0'+d.getMinutes()):(d.getMinutes()));
				if (kta.language=='de') {
					if (namedday=='y')
						datestr = 'gestern '+datestr;
					else if (!namedday)  				 
						datestr = d.getDate() + '.' +d.getMonth() + '.'+ d.getFullYear() + ' ' +datestr;
					datestr += ' Uhr';
				}
				else {  
					if (namedday=='y')
						datestr = 'yesterday '+ datestr;
					else if (!namedday)  				 
						datestr = d.getMonth() + '/' + d.getDay() + '/' + d.getFullYear() + ' ' + datestr;
					datestr += ' h';
				}
				
				//  TODO: recognize today, yesterday, x days ago
				kwd_setElementText('.lastaveragespeedtime',datestr);
		    	menustack.push('askkeepaveragespeed');
		   }
		}
    }


    if(settings.get('switchnews3')!=true) menustack.push('newsdialog3'); // true means ok set means don't show again
        
    // this is the WARNING
    if(settings.get('switchredwarning')!=true)  {
    	menustack.push('warningdialog'); // note: all dialogs hidden by default!
    }

    //Create and start location sensor. 
    //(Achievable update rate is hardware specific) 
    loc = app.CreateLocator( "GPS,Network" ); 
    loc.SetOnChange( loc_OnChange );  // you cannot directly set to member of gpstool :-(
    loc.SetRate( 1 ); //seconds (refresh data), test lower rate! good for background activity!
    startGps(); // never do loc.Start(); alone --> use this wrapper  
    
        
    // TODO: hier auch scaleDisplays(), besonders für Landscape
    positionDisplays();
    setGpsWarning(); // initially display warnings until gps receives data

    // EVENTS
    
	// adds listener to wrapper! - it works through capturing OR bubbling!
	// this is for all dialogs and settings (no info card and no display-boxes):
	// - need listener for touchstart AND touchend (otherwise you can destroy or disturb scrolling in browser )
	var wrapel = document.getElementById('touch-wrapper');
	
	// - on touchstart we save the event if it is interesting to us
	// - we only need to know whether the x/y has changed
	// - also could deny, if event is already under way
	// - we also color the menuitem manually if given
	// 
	 if(wrapel) wrapel.addEventListener('touchstart',function(evt) {
		
		this.kwdSwitcherId = '';
		this.kwdButtonId = '';
		this.kwdDisplayId = '';
    	this.kwdCancelTouch  = false;

		// TODO: this statt wrapel
		 
		
		// check if you can save something in this from event (x/y)
		/*var ts = evt.changedTouches;
		if(ts.length) {
			this.kwdpageX = ts[0].pageX; 
			this.kwdpageY = ts[0].pageY;
		} */
		// ! if there can be mor sub-spans you must check also parent of parent!
		var switcher;
		if (evt.target.classList.contains('switcher')) switcher = evt.target;
		if(!switcher && evt.target.parentNode.classList.contains('switcher')) switcher = evt.target.parentNode;
		if (switcher) {
			this.kwdSwitcherId = switcher.id;
			//	switcher.style.backgroundColor = 'rgba(255,255,255,0.3)';
		}
		else {
			// TODO: back-arrow einfach als eine button-id setzen!
			var button;
			if (evt.target.classList.contains('btn')) button = evt.target;
			if(!button && evt.target.parentNode.classList.contains('btn')) button = evt.target.parentNode;
			if (button) {
				this.kwdButtonId = button.hash;
	//			button.style.backgroundColor = '#666';
			}
			else {

				var backarrow;
				if (evt.target.classList.contains('back-arrow')) backarrow = evt.target;
				if(!backarrow && evt.target.parentNode.classList.contains('back-arrow')) backarrow = evt.target.parentNode;
				if(backarrow) {
					this.kwdButtonId = 'back-arrow';
				}
				else {
					var display = evt.target;
					var found = false;
					while (!found && display) {
						found = display.classList.contains('fast-option');
						if (!found) {
							display = display.parentElement; // == parentNode?
							if(!display || display.tagName.toLowerCase() == 'body') break;
						}
					}					
					if (display) {
						this.kwdDisplayId = display.id;
					}
				}	
			}
		}
		
		
		return true;
	});
	
    if(wrapel) wrapel.addEventListener('touchmove',function(evt) {
    	// TODO: allow move in a small range as long as touchstart-target not left
    	
		this.kwdSwitcherId = this.kwdButtonId  = this.kwdDisplayId = '';
    	this.kwdCancelTouch  = true;
      	return true;
    });
	
	
	// todo: man könnte element-id bei touchstart speichern, und hier nur noch einen großen switch
	if (wrapel) wrapel.addEventListener('touchend',function(evt) {
		
		if (this.kwdCancelTouch) 
			return true;

/*		if(this.kwdSwitcherId) 
			document.getElementById(this.kwdSwitcherId).style.backgroundColor = 'transparent';
		/*if(this.kwdButtonId && this.kwdButtonId != 'back-arrow') {
			// Schleife über alle Buttons, da keine Button id verfügbar!!
			var els = document.getElementsByClassName('.btn');
			if (els) for(var i = els.length-1; i >= 0; i-- ) {
				if(!els[i].id || els[i].id != 'donate-button')
					els[i].style.backgroundColor = '#888';
			}
		}*/
			

		/*var ts = evt.changedTouches;
		if(ts.length) {
			//TODO: prüfe ob bereich (z.B. bis 3-5 pixel Abweichung nötig )
			if((this.kwdpageX != ts[0].pageX) || (this.kwdpageY != ts[0].pageY)) {
				this.kwdSwitcherId = this.kwdButtonId  = this.kwdDisplayId = '';
				return true; // event-Bearbeitung abgebrochen
			}
		} */


		var dodefault = processTouchEvent(this);
		
		this.kwdSwitcherId = this.kwdButtonId  = this.kwdDisplayId = '';
		
		if(!dodefault) {
			evt.stopPropagation();
			evt.preventDefault();
			return false;
		}
		return true;
	}); 
    
    // equal to 'touchend'
    // for cases 'touchend' is not triggered at all in some cases
	if (wrapel) wrapel.addEventListener('touchcancel',function(evt) {
		
		if (this.kwdCancelTouch) 
			return true;

/*		if(this.kwdSwitcherId) 
			document.getElementById(this.kwdSwitcherId).style.backgroundColor = 'transparent';
		/*if(this.kwdButtonId && this.kwdButtonId != 'back-arrow') {
			// Schleife über alle Buttons, da keine Button id verfügbar!!
			var els = document.getElementsByClassName('.btn');
			if (els) for(var i = els.length-1; i >= 0; i-- ) {
				if(!els[i].id || els[i].id != 'donate-button')
					els[i].style.backgroundColor = '#888';
			}
		}*/
			

		/*var ts = evt.changedTouches;
		if(ts.length) {
			//TODO: prüfe ob bereich (z.B. bis 3-5 pixel Abweichung nötig )
			if((this.kwdpageX != ts[0].pageX) || (this.kwdpageY != ts[0].pageY)) {
				this.kwdSwitcherId = this.kwdButtonId  = this.kwdDisplayId = '';
				return true; // event-Bearbeitung abgebrochen
			}
		} */


		var dodefault = processTouchEvent(this);
		
		this.kwdSwitcherId = this.kwdButtonId  = this.kwdDisplayId = '';
		
		if(!dodefault) {
			evt.stopPropagation();
			evt.preventDefault();
			return false;
		}
		return true;
	}); 
    


    // findet alle ext-link, wenn bubble
    document.getElementById('infocard').addEventListener('click',function(evt) { // bewusst hier click!
		
		var e = evt.target;
		var found = false;
		while (!found && e) {
			found = e.classList.contains('ext-link');
			if (!found) {
				e = e.parentElement; // == parentNode?
				if(!e || e.tagName.toLowerCase() == 'body') break;
			}
		}					
		
		if (e) {
			var lhash = e.hash; // hoffentlich hash nicht undefined
			if(lhash && lhash == '#back') OnBack();
			else {
		        var linktarget = e.href;
		        app.OpenUrl( linktarget );
		        evt.preventDefault();
		        evt.stopPropagation();
		        return false;
			} 
		}
		
		return true;    	
    });
	
	if (kta.stage!=kta.STAGE_BASIC) 
		var el = document.getElementById('close-banner').addEventListener('click',function(evt)
		{
			kta.kstage.changeAdBanner(0,0,false); //  banner.hide(); // TODO: recognize running counter
			// maybe not needed:
			    evt.preventDefault();
		        evt.stopPropagation();
				
		        return false;
		});

    
   	var els = document.getElementsByClassName('card');
   	for(var i=els.length-1;i>=0;i--) {
	   	kwd_addEvent(els[i],'scroll',function() {
   			resetMenuFade();
   		});
   	}
   	
   	
   	
   	//TODO: check if works!!!
	kwd_addEvent( window, 'scroll', function() {
		resetMenuFade();
	});

	var TO = false;

	kwd_addEvent(window, 'resize', function() {

        // TODO: only if really needed: 
        //      handle problem with possible multiple trigger resize events in some cases
        // see  tangara
        
        // TODO: warum reagiert nicht, wenn Statusbar des Gerätes weg ??
        // TODO: teste ob OnConfig bei Statusbar-weg reagiert !
        if(!kta.resizes) kta.resizes = 1;
        app.Debug("window resize #"+kta.resizes);
        kta.resizes++;
        // switch for next scaleDisplays
        kta.onResize = true;

		 if(TO !== false) clearTimeout(TO);
		 TO = setTimeout(refreshall, 100);
    });
    
    
    //$('#splashscreen').hide();
    // ! this loop does not work since the 'classList'== els itself is immediately changed
    // ! on classList.remove() thus the index i becomes invalid 
    document.getElementById('splashscreen').style.display = 'none';
    var els = document.getElementsByClassName('hide-on-startup');
    if (els)
    	for(var i=0;i<els.length;i++)
    	{
    		//els[i].classList.remove('hide-on-startup');
    		els[i].style.opacity = '1.0';
    	}
    // show menu button and ad counter only if no dialogs open
    if (menustack.current()==false) {
		kta.menubutton.show();
		kta.kstage.startBannerCounter();
	}
    app.Debug('num gauges:'+layout_gauges);
    resetHud();
    resetMenuFade();

} // initApp


function OnStart() {
	if(!kta.debug) app.SetDebugEnabled( false ); // check if app.Debug calls cause error (use wrapper function!)
	
	app.Debug("onStart");
    app.PreventScreenLock(true);
    // prevent accidently back 
    app.EnableBackKey( false );  

	if (app.kwd_droidscript_emulator) { // find emulator
		kta.browsermode = true;
		app.Debug('browser mode');
	} 
	else app.Debug('droidscript mode');

	app.Debug('project stage: '+kta.stage);
	
	if(app.GetOSVersion()>=14) { // 14 == Android 4.0.1
		kta.advancedstyles = true;
		app.Debug('modern Android version found');
	}
	if(typeof document.getElementsByTagName != 'undefined' && typeof document.getElementsByClassName  != 'undefined') {		
		kta.nojquery = true; // TODO: better ask the functions you need e.g. getElementsByClassname
		app.Debug('modern javascript found');
		//kwd_setElementText('#internalinfo','(x)');
	}
			
	setTimeout(initApp,100);
}