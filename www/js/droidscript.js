// class for app compat. hull functions
// works as a "emulator" :-)

function DroidScriptApp () {
    //private:
    debug_on = true;
	popuptimeout = false;
	
	this.kwd_droidscript_emulator = true; // to check in contrast to real DroidScript
	
	this.Start = function() {
		OnStart();
	};
	
	this.Debug = function(msg) {
		if(debug_on) console.log(msg);
		// TODO: better to make OWN function in kwd Tacho, so app.Debug can be wrapped (for performance)
	};
	this.SetDebugEnabled = function(mode) {
		debug_on = (mode) ? true : false; // better if mode does not contain booleans
	};
	
	this.clearPopup = function() {
		//$('.toastmessage').fadeOut(400);
	};
	this.ShowPopup = function(msg) {
		//if(popuptimeout!==false) clearTimeout(popuptimeout);
		this.Debug("popup: "+msg);
		//$('.toastmessage').text(msg);
		//$('.toastmessage').show();
		//setTimeout(this.clearPopup,5000);
	};
	
	/* return the probable correct value of screen orientation
	 * TODO: don't just return "portrait" when screen is not portrait-like 
	 */
	this.GetOrientation = function() {
		return 'Portrait';
	};
	this.SetOrientation = function() {
		return 'Portrait';
	};
	this.GetLanguageCode = function() {
		var userLang = navigator.language || navigator.userLanguage; 
		return userLang;
	};
	this.Exit = function() {
		//OnPause(); // since DoridScript makes this automatically when exit
/*
 * 
 		    var r = confirm("App closed. 'OK' to restart. 'Cancel' to stop.");
		    if (r == true) {
				location.href='kwdtacho.html';
		    } else {
				location.href='index.html';		    	
		    }
*/
		//alert("APP closed."); // no more alert if redirectin anyway
		window.onbeforeunload = function (e) {};
		
		location.href='index.html';
	};
	this.GetOSVersion = function() {
		return 22; // is Android 5.1
	};
	this.IsTablet = function() {
		return true;
	};
	this.EnableBackKey = function(mode) {
		console.log('app.EnableBackKey:'+mode);
	};
	this.SetScreenMode = function(mode) {
		if (mode.toLowerCase()=='full') console.log ('app: hide statusbar');
		if (mode.toLowerCase()=='normal') console.log ('app: show statusbar');
	};    
    this.PreventScreenLock = function(bool) {
    	if (bool) console.log('app: NO display timeout ');
    	else  console.log('app: normal display timeout ');
    };
	
	this.CreateLocator = function(options) {
		return new kwdGeoLocator(options);	
	};
	
	this.LoadText = function(key,defaultval) {
		
        if(key!='') {
            var str = window.localStorage.getItem(key);
            if(str!==null) {
                return str;
            }            
        }    
        
        return defaultval;        
	
	};

	this.LoadNumber = function(key,defaultval) {
		
        return parseFloat(this.LoadText(key,defaultval));
	};
	
	this.SaveText = function(key,val) {
		
        if(key!='') {
            window.localStorage.setItem(key,val);
        }    
	};

	this.SaveNumber = function(key,val) {
		
		this.SaveText(key,val.toString());
            
	};
	
	
	// concstruct code
		
	// simulate BACK BUTTON with ESC key
	document.onkeydown = function(evt) {
	    evt = evt || window.event;
	    if (evt.keyCode == 27) {
	    	//console.log('ESC detected');
	        OnBack();
	    }
	    else if (evt.keyCode == 77) {
	    	//console.log('M detected');
	        OnMenu();
	    }
	};

	// simulate correct exit of App when leavin page
	// TODO: läuft noch nicht, evtl. weil JS-Code der Seite schon gelöscht - dann aber generell sinnlos
	// TODO: teste einfacheres Script siehe w3schools.com
	window.onbeforeunload = function (e) {
  		var message = "Das Navigieren oder Aktualisieren führt zum EXIT der laufenden App.";
		Quit(); // function of app!!!


		  e = e || window.event;
		  // For IE and Firefox
		  if (e) {
		    e.returnValue = message;
		  }

	  // For Safari
	  return message;
	};
	
}


/*
 * 
     loc = app.CreateLocator( "GPS,Network" ); 
    loc.SetOnChange( loc_OnChange );  // TODO: try to directly set gpstool.change() !!
    loc.SetRate( 1 ); //seconds (refresh data)
    loc.Start(); 
*/
function kwdGeoLocator (options) {
	
	var timeout = 1000;
	var timeout_id = false;
	var callback_name = null;	
	var geodata = {
		'provider':'gps',
		'speed': 1,
		'accuracy': 0,
		'latitude':0,
		'longitude':0,
		'altitude':0,
		'bearing':0
	};
	
	/* this invokes to simulated callback call with geo data
	 * 
	 */
	this.change = function() {
		var r = Math.random();
		r = r*5 -2;
		// override random:
		r = 1;
		
		// NOTE: speed is still m/s here !
		//if (geodata.speed > 5) geodata.provider = 'network';
		geodata.speed += r; //= (geodata.speed<20000) ? geodata.speed * 1.1 : geodata.speed * 0.9; // nice simu
		if (geodata.speed<0) geodata.speed = 0;
		//geodata.speed=170/3.6;
		
		// set an altitude
		geodata.altitude = Math.random() * 300;
		
		//console.log (geodata);
		if (callback_name !== null) callback_name.call(this,geodata);
	};
	
	this.SetOnChange = function(functionname) {
		callback_name = functionname;
	};
	
	/* refresh rate is given in seconds
	 * 
	 */
	this.SetRate = function(rate) {
		if (rate) timeout = rate*1000;
	};
	
	this.Start = function() {
		timeout_id = setInterval(this.change,timeout);
	};
	
	this.Stop = function() {
		if (timeout_id !== false) clearInterval(timeout_id);
	};
	
	// construct code
	//alert(options);
} 

// make instance
app = new DroidScriptApp();
