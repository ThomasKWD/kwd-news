
/* Code for project stage BASIC
 * // verwende source id : de.kuehne_webdienste.kwdtacho
 * 
 * - accuracy enabled
 */

function StageBasic_Accuracy() {

	/* prevents that accuracy gets enabled 
	this.init = function (set,id,gaugecount) {
		set.switchit(id,false);
		if(displayAccuracy) displayAccuracy.hide();
		return gaugecount;
	};
	this.show = function(set,id,gaugecount) {
		//set.switchit(id,false);
		// include message that function not available
		menustack.push('nobasicdialog');
		showHint('Not available in this app','Nicht verfügbar in dieser App');
		return gaugecount;
	};
	this.hide = function(set,id,gaugecount) {
		// actually this function is never reached in BASIC (except on devicess where accuracy has already been used)
		if(displayAccuracy) displayAccuracy.hide();
		return gaugecount;
	};
*/
	// sets accuracy depending on saved state
	this.init = function (set,id,gaugecount)
	{
		if (set.get(id)==false && displayAccuracy) displayAccuracy.hide();
		else gaugecount++;
		return gaugecount;
	};
	
	
	this.show = function(set,id,gaugecount)
	{
		if (displayAccuracy)
		{
			gaugecount++;
			set.switchit(id,true);
			displayAccuracy.show();
		}
		return gaugecount;
	};
	
	
	this.hide = function(set,id,gaugecount)
	{
		if (displayAccuracy)
		{
			gaugecount--;
			set.switchit(id,false);
			displayAccuracy.hide();
		}

		return gaugecount;		
	};

}

function KwdStageBasic() {
	
	/* control accuracy display
	 * 
	 */
	this.switchAccuracy = function(onoff) {
		
	};
	
	// construct
	
	this.accuracy = new StageBasic_Accuracy();
} 

// initantiate in kwdtacho.js