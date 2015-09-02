/*
TODO: 
* make a "class" (prototype)
*/

/*
Erzeugt eine analoge Anzeige, bisher nur optimiert für Tachometer
(positive Werte, 1 Zeiger)
FEATURES:
- Angabe des Winkels des Kreises, der genutzt wird.
- Übergabe aller Parameter als Objekt-Notation (KEINE Einzelmethoden :-()
- benötigt ein bestimmtes HTML-Gerüst inkl. CSS! (wird nicht erzeugt!)
- erzeugt Elemente neu, die variabel sind, wie Skalenstriche und -Beschriftungen
- Geschwindigkeit und Verlauf der Animation (transition) festgelegt.

TODO: 
- Farbige Bereiche (Balken) wie Canvas Gauges
- Zeitkritische Routinen: direkt DOM-Manipulation ohne jQuery und addClass wenn möglich
 
*/

// class
function CssGauge(init_settings) {
	
	// private
	var initial = true;
	var gauge_width = 0;
	var gauge_height = 0;
	var settings = null;
	var zero_angle = 0; // Winkel für 0-Stellung, kann negativ sein!
	//var current_angle = 20;
	var angle_range_ratio = 270/200;
	 // soll Objekt werden
	var previous_value = -1; // zum Vergleich (nicht zeichnen, wenn keine Änderung)
	var scale = 0;
	
	// public
	
	/* passt die Größe dem umgebenden div (settings.wrapper) an
	 * - unabhängig, da bei jedem resize benötigt.
	 */
	this.scale = function() {
		// manage scale + corrected position!
		// TODO: CSS scale origin des .gauge oben links
		// - the width, height of .gauge is expected to be constant (since not changed by scale)
		// - ! the unscaled size of .gauge can disturb the size of the body tag !
		// - checks if width or height is limiting ("bounding box")
		var ws =  $('#'+settings.wrapper).width() /  $('#'+settings.gauge).outerWidth();
		var hs =  $('#'+settings.wrapper).height() /  $('#'+settings.gauge).outerHeight();
		//console.log(ws+'x'+hs);
		scale = (ws < hs) ? ws : hs;
			
		$('#'+settings.gauge).css({
			'transform-origin':'0 0 0',
			'transform':'scale('+scale+','+scale+')'
		});		
	};
	
	/* aktualisiert die als "beweglich" definierten Komponenten
	   - zunächst gilt nur der Zeiger als "beweglich"
	   - prüft oder korrigiert NICHT die "unbeweglichen" Komponenten
	*/
	this.draw = function() {

		// get size and use it to scale and position contents:
		// TODO: wenn nötig, zwischen initial und später unterscheiden
		if (gauge_width==0) gauge_width = $('.gauge').width();
		if (gauge_height==0) gauge_height = $('.gauge').height();
		//alert (gauge_height);

		// center
		$('.g-center').css( { 
			'left' : gauge_width/2-($('.g-center').outerWidth()/2),
			'top' : gauge_height/2-($('.g-center').outerHeight()/2)
		});

		// pointer position; left middle  = rotation center
		$('.g-pointer').css({
			'top' : '0px',
		/*	'left' : gauge_height/2-($('.g-pointer').outerWidth()/2) + 'px',*/
			'left' : '130px', // hard coded because error not found :-(
			'transform-origin': 'center ' +gauge_height/2 +'px 0' // 	pointeroffset==gauge_height/2 is for pointer longer than half of gauge
		});
		
		// make some major ticks
		//var step = 20;
		var step = parseFloat(settings.majorStep);
		var majorcount = parseFloat(settings.maxRange) / step + 1;
		
		// clear previous:
		if(!initial) // for performance 
			$('.g-tick,.g-tickval,.g-minor').remove();
		//generate:
		for(var i=0;i<majorcount;i++) {
			$('.g-scale').append('<div id="major'+i+'" class="g-item g-tick g-majortick skin"></div> <div id="tick'+i+'" class="g-item g-tickval"><div id="inner'+i+'" class="g-tickval-inner">'+i*step+'</div></div>');
		}
		
		// make minor ticks
		var minorcount = parseInt(settings.minorTicks) * (majorcount -1);
		//console.log(minorcount);
		if (minorcount>0) {
			for(var i=0;i<minorcount;i++) {
				$('.g-scale').append('<div id="minor'+i+'" class="g-item g-minor skin"></div>');
			}
		}
		
		// position major ticks
		// to the left edge, vert. centered
		// the left edge is given by the html since border of gauge is outside
		var tickbordergap = 10; // means px
		
		$('.g-majortick').css ({
			'top' :  (gauge_height/2-($('.g-majortick').outerHeight()/2)) + 'px',
			'left': tickbordergap + 'px',
			'transform-origin': (gauge_width/2-tickbordergap)+'px center 0'
		});
		// pre-position tick values
		// left +3 is layout gap between stroke and number
		var correct1000 = 0;
		//if(settings.maxRange>=1000) correct1000 = 10;// need this for large numbers (4 digits)
		
		$('.g-tickval').css ({
			'top' :  (gauge_height/2-($('.g-tickval').outerHeight()/2)) + 'px',
			'left' : ($('.g-majortick').outerWidth()+ +correct1000 + tickbordergap) + 'px'
		});

		// rotate majorticks, tickvalues
		var rotate_offset =  parseFloat(settings.overallAngle) / 2 - 90; 
		var rotate_step = parseFloat(settings.overallAngle) / (majorcount - 1);
		
		for(var i=0;i<majorcount;i++) {
			// TODO: Verhältnisgleichung, wegen: 360°:100% 
			// 1/4 = 90° = space; 360-90° = 270:10 = 27 = step; 90°/2 = offset
			var rotate = i * rotate_step - rotate_offset;
			$('#tick'+i).css( {
				'transform-origin': ((gauge_width/2) - 20 - correct1000 - tickbordergap) +'px center'			
			});
			$('#major'+i+',#tick'+i).css( {
				'transform':'rotate('+rotate+'deg)'
			});
			// correct number rotate; note the minus rotate
			// Problem: Numbers widths
			rotate = -rotate;
			$('#inner'+i).css( {
				'transform':'rotate('+rotate+'deg)'
			});
		}


		// pre-position minor ticks
		$('.g-minor').css ({
			'top' :  gauge_height/2-($('.g-minor').outerHeight()/2),
			'left': tickbordergap + 'px',			
			'transform-origin': (gauge_width/2-tickbordergap)+'px center'
		});
		// rotate minor ticks

		var rotate_step_minor = parseFloat(settings.overallAngle) / (minorcount);
		
		for(var i=0;i<minorcount;i++) {
			var rotate = i * rotate_step_minor - rotate_offset;
			$('#minor'+i).css( {
				'transform':'rotate('+rotate+'deg)'
			});
		}
		
		initial = false;
	}; // draw
	
	/* nimmt den neuen Wert, um den Zeiger neu zu positionieren,
	   - tut nichts, wenn der neue Wert exakt gleich dem alten Wert
	*/
	this.setValue = function(new_value) {
		
		var v;
		// make valid float!
		if (isFinite(new_value)==false) return false;
		v = parseFloat(new_value);
		if (v!=previous_value) {
			previous_value=v;
			//andere Berechnung als oben, da senkrecht = 0;
			var offset = v * angle_range_ratio + zero_angle;
			$('#g-pointer').css('transform','rotate('+offset+'deg)'); // TODO: performance: save DOM element reference??
			return true;
		}
		return false;
	};
	
	/* vielleicht ist es auch einfacher, Einzelmethoden zu machen!!
	   - erwartet Settings in Objekt-Notation
	   - gibt aktuelle Settings zurück
	   - zeichnet immer alles neu, cobald neue Settings gefunden werden
	   - ! setzt jedoch Wert nicht! 
	   TODO: check values (e.g. relation majorStep to MinorTicks to maxRange)
	*/
	this.config = function(new_config) {
		if (typeof new_config == 'object') {
			settings = new_config;
			console.log(settings);
			angle_range_ratio = parseFloat(settings.overallAngle) / parseFloat(settings.maxRange); // loc. var for performance
			zero_angle = - parseFloat(settings.overallAngle) / 2;
			this.draw();
			this.scale();
			previous_value = -1; // force value reset
		}
		return settings;		
	};
	
	// construct
	
	if (typeof init_settings == "object") { 
		this.config(init_settings);  // includes draw, and scale since initial
		this.setValue(settings.value);
		//if(this.setValue(0)==false)alert("schei");
		//alert(this.config().maxRange);
	}
}

