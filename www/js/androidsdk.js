// class for running app with own JAVA-API-bridge
// NOT a simple emulator
// many functions equal to droidscript.js

function AndroidSdkApp () {
    //private:
    var debug_on = true;
	var popuptimeout = false;
	
	
	this.kwd_droidscript_emulator = true; // to check in contrast to real DroidScript
	this.android_sdk = true;
	
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
	this.ShowPopup = function(msg,options) {
		
		//if(popuptimeout!==false) clearTimeout(popuptimeout);
		//this.Debug("popup: "+msg);
		//$('.toastmessage').text(msg);
		//$('.toastmessage').show();
		//setTimeout(this.clearPopup,5000);
		Android.ShowPopup(msg,options); // invoke java API code
	};
	
	this.GetLanguageCode = function() {
		var userLang = navigator.language || navigator.userLanguage;
		// TODO: kann auch 5-stellig sein (je nach Browser) z.B. "de-DE" 
		if (userLang.length > 2) {
			userLang = userLang.substr(0,2);
		}
		console.log('Sprache gefunden:'+userLang); 
		return userLang;
	};
	this.Exit = function() {
		// ! Nicht OnPause aufrufen!
		Android.Exit();
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
		console.log('screen mode: '+mode);
		//if (mode.toLowerCase()=='full') Android.setFullScreen(true);
		//else Android.setFullScreen(false);
		Android.setFullScreen(mode);
		
	};    
    this.PreventScreenLock = function(bool) {
    	// is done by frame app
    	//if (bool) console.log('app: NO display timeout ');
    	//else  console.log('app: normal display timeout ');
    };
	
	this.CreateLocator = function(options) {
		return new kwdGeoLocatorSdk(options);	
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
		// TODO: recherchieren ob localstorage unsicher ist (nach längerer Zeit automatisch gelöscht??) 
		
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


// must wrap this (otherwise overwrites same code in droidscript.s)


/*
 * 
     loc = app.CreateLocator( "GPS,Network" ); 
    loc.SetOnChange( loc_OnChange );  // TODO: try to directly set gpstool.change() !!
    loc.SetRate( 1 ); //seconds (refresh data)
    loc.Start();
    
    - Problem, direkt navigator.location ist zu langsam und spuckt keine speed-Werte aus
    TODO: in diesem Fall zusätzlich JAVA-Bridge aktivieren  
*/
function kwdGeoLocatorSdk (options) {
	
	var timeout = 1000;
	var timeout_id = false;
	var callback_name = null;	
	var geodata = {
		'provider':'gps',
		'speed': 0,
		'accuracy': 0,
		'latitude':0,
		'longitude':0,
		'altitude':0,
		'bearing':0
	};
	var that = this;
	
	/* this invokes to simulated callback call with geo data
	 * - controlled by setInterval
	 * - gets data actively from Android 
	 */
	this.change = function() {

	
		//geodata.provider = 'gps' // to be changed by onerror
		/*geodata.speed = newdata.coords.speed;
		geodata.accuracy = newdata.coords.accuracy;
		geodata.latitude = newdata.coords.latitude;
		geodata.longitude = newdata.coords.longitude;
		geodata.altitude = newdata.coords.altitude;
		geodata.bearing = newdata.coords.heading;
		*/
		var str = Android.getLocationData();
		if (str) {
			geodata = JSON.parse(str);
			// (test values see droidscript.js)
						
			//console.log ('current provider: '+geodata.provider);
			if (callback_name !== null) callback_name.call(this,geodata);
		}
	};
	
	this.invoke = function() {
		navigator.geolocation.getCurrentPosition(that.change,that.onError);
	};
	
	this.onError = function(error) {
	    switch(error.code) {
	        case error.PERMISSION_DENIED:
	            console.log("GPS: User denied the request for Geolocation.");
	            break;
	        case error.POSITION_UNAVAILABLE:
	            console.log("GPS: Location information is unavailable.");
	            break;
	        case error.TIMEOUT:
	            console.log("The request to get user location timed out.");
	            break;
	        case error.UNKNOWN_ERROR:
	            console.log("GPS: An unknown error occurred.");
	            break;
	    }		
	};
	
	this.SetOnChange = function(functionname) {
		callback_name = functionname;
	};
	
	/* refresh rate is given in seconds
	 * 
	 */
	this.SetRate = function(rate) {
		//if (rate) timeout = rate*1000;
	};
	
	/*
	 * startet interval
	 * - TODO: bei geoloaction fehler, z.B. kein Signal intervall stoppen
	 * - TODO: wenn sich schlecht macht, einfach provider umschalten
	 */
	this.Start = function() {
	//	if(navigator.geolocation) {
			//navigator.geolocation.watchPosition(that.change,that.onError);	
		//	timeout_id = setInterval(this.invoke,timeout);
	//	}
		//console.log(r);
		Android.startLocator();
		timeout_id = setInterval(this.change,timeout);
	};
	
	this.Stop = function() {
		//if(navigator.geolocation) {
			//navigator.geolocation.clearWatch(that.change);	
		//}
		if (timeout_id !== false) clearInterval(timeout_id);
		Android.StopLocator();
	};
	
	// construct code
	// TODO: Android code call for creating LocationManager
	// TEST
	Android.createLocator(options); // you don't need return value from Java, since object will be stored there 
} 

// make instance
// da droidscript.js parallel läuft!
if (typeof app == 'undefined') {
	//throw ("Problem: 'app' schon definiert.");
	app = new AndroidSdkApp();
}
