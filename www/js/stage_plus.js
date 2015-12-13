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

/*
TODO: die Objekte von plus sollten einfach auch in PRO eingebunden werden
wenn die Funktion identisch ist, in manchen Fällen sollten einfach die Unterobjekte
von basic eingebunden werden, wenn gebraucht (z.B. Banner)
*/
function KwdStagePlus() {
	
	var counter_timeout = false;
	var counter_step = 15;
	var banner_elem = document.getElementById('add-banner');
	var close_banner_elem = document.getElementById('close-banner');
	var that = this;

	/* banner position
	 * - landscape in menu: make menus left and ad right
	 * - portrait in menu: make ad on bottom - if no space, turn off ad
	 * - off-menu: turn off ad after 1 min. + make close button
	 */
	this.calculateAdPosition = function(x,y,onoff)
	{
		
	};

	this.countBanner = function() 
	{
		if(counter_timeout) clearTimeout(counter_timeout);
		counter_step--;
		close_banner_elem.innerHTML = counter_step;		
		if (counter_step>0) counter_timeout = setTimeout(that.countBanner,950);
		else {
			banner_elem.style.display = 'none';
			close_banner_elem.innerHTML = '<span class="icon-cancel"></span>';
		}	
	};
	

	/* changes size of ads banner
	 * - values must be css strings e.g. '100px' or '50%'
	 * - 0 value or empty string leads to no-change (don't use '0' as string)
	 * - onoff: true: show, false: hide
	 * TODO: a separate object AdBanner()
	 *
	  */
	this.changeAdBanner = function(x,y,onoff) {
		//var e = document.getElementById('add-banner');
		var e = banner_elem;
		if (e) {
			if (onoff===false) e.style.display = 'none';
			else {
				if (x) e.style.width = x;
				if (y) e.style.height = y;
				if (onoff) {
					e.style.display = 'block'; // 2nd if because onoff can also be undefined
					counter_step=0; // stops running counter
					that.countBanner();
				}
			
			}			
		}
	};

	this.startBannerCounter = function(seconds)
	{
		if(counter_timeout) clearTimeout(counter_timeout); // in case of multi starts
		if(seconds) counter_step = seconds; else counter_step = 15;
		close_banner_elem.innerHTML = counter_step;
		counter_timeout = setTimeout(that.countBanner,950);
	};
	
	this.cancelBannerCounter =function()
	{
		if(counter_timeout) clearTimeout(counter_timeout);
	};
	
	
	// construct
	// TODO: make function general for displays 
	// or also other objects or structures
	this.accuracy = new StagePlus_Accuracy();
	
	// TODO: banner: start initial timeout for removing "close banner hint"
} 

// instanciate in kwdtacho.js
