/* Code for project stage PLUS 
 	// verwende source id : de.kuehne_webdienste.easyspeedometerplus

 * */
/* Code for project stage BASIC
 * // verwende source id : de.kuehne_webdienste.kwdtacho
 */
/*könnte von base class abgeleitet sein
*/
function StagePlus_Accuracy() {
	
	/* sets accuracy depending on saved state
	 * 
	 */
	this.init = function (set,id,gaugecount)
	{
		if (set.get(id)==false && displayAccuracy) displayAccuracy.hide();
		else gaugecount++;
		return gaugecount;
	};
	
	
	this.show = function(set,id,gaugecount)
	{
		if (displayAccuracy && !displayAccuarcy.isVisible())
		{
			gaugecount++;
			set.switchit(id,true);
		}
		return gaugecount;
	};
	
	
	this.hide = function(set,id,gaugecount)
	{
		if (displayAccuracy && displayAccuarcy.isVisible())
		{
			gaugecount--;
			set.switchit(id,true);
		}

		return gaugecount;		
	};
}

function KwdStagePlus() {
	
	// construct
	// TODO: make function general for displays 
	// or also other objects or structures
	this.accuracy = new StagePlus_Accuracy();
} 

// initantiate in kwdtacho.js
