/* Code for project stage BASIC
 * // verwende source id : de.kuehne_webdienste.kwdtacho
 */

function StageBasicObject() {
	
	/* prevents that accuracy gets enabled 
	 * 
	 */
	this.init = function (set,id,gaugecount) {
		set.switchit(id,false);
		if(displayAccuracy) displayAccuracy.hide();
		return gaugecount;
	};
	this.show = function() {
		// include message that function not available
	};
	this.hide = function() {
		// include message that function not available		
	};
}

function KwdStageBasic() {
	
	/* control accuracy display
	 * 
	 */
	this.switchAccuracy = function(onoff) {
		
	};
	
	// construct
	
	this.accuracy = new StageBasicObject();
} 

// initantiate in kwdtacho.js