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

function KwdStagePlus() {

	/* banner position
	 * - landscape in menu: make menus left and ad right
	 * - portrait in menu: make ad on bottom - if no space, turn off ad
	 * - off-menu: turn off ad after 1 min. + make close button
	 */
	this.calculateAdPosition = function(x,y,onoff)
	{
		
	};

	/* changes size of ads banner
	 * - values must be css strings e.g. '100px' or '50%'
	 * - 0 value or empty string leads to no-change (don't use '0' as string)
	 * - onoff: true: show, false: hide
	 * 
	 * TODO: provide parameter for timeout (turn off after milliseconds) - or use onoff parameter
	 */
	this.changeAdBanner = function(x,y,onoff) {
		var e = document.getElementById('add-banner');
		if (e) {
			if (onoff===false) e.style.display = 'none';
			else {
				if (x) e.style.width = x;
				if (y) e.style.height = y;
				if (onoff) e.style.display = 'block'; // 2nd if because onoff can also be undefined
			}			
		}
	};

	
	// construct
	// TODO: make function general for displays 
	// or also other objects or structures
	this.accuracy = new StagePlus_Accuracy();
} 

// initantiate in kwdtacho.js
