/* Part of Body, this which allow user to be edited
   currently it's disabled (hidden) for incompatibality purpose 
   I had move code here for easy editing :) */

TWEEN.start();

var paused = false;
//var screen = window.open( 'screen.html', 'screen' );
var video = document.createElement( 'video' );
var layers = [];
var layerCount = 0;
var controlsPanel;
window.addEventListener( 'load', init, false );

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft
		curtop = obj.offsetTop
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft
			curtop += obj.offsetTop
		}
	}
	return { left: curleft, top: curtop };
}

function inputControl( element, div ) {

	this.element = element;
	this.div = div;
	this.input = document.createElement( 'input' );
	this.input.style.width = '100%';
	this.div.appendChild( this.input );
	
	( function( data ) { 
		
		data.input.addEventListener( 'change', function( e ) {
			data.element.setValue( parseFloat( this.value ) );
		}, false );
		
		data.input.addEventListener( 'keyup', function( e ) {
			data.element.setValue( parseFloat( this.value ) );
		}, false );
		
	} )( this );
	
	this.setValue = function( value ) {
		this.value = value;			
		this.input.value = value;
	}

}

function progressControl( div ) {

	this.render = function() {			
		this.bar.style.width = this.value * this.div.clientWidth + 'px';
	}
	
	this.setValue = function( value ) {
		this.value = value;
		this.render();
	}
	
	this.div = div;
	this.bar = document.createElement( 'div' );
	this.bar.className = 'raised bar';
	this.div.appendChild( this.bar );		
	this.setValue( 0 );
	
}

function sliderControl( element, div ) {

	this.buttonDown = false;
	
	this.element = element;
	this.div = div;
	this.bar = document.createElement( 'div' );
	this.bar.className = 'raised bar';
	this.div.appendChild( this.bar );		
	
	this.min = 0;
	this.max = 0;
	
	this.setMin = function( min ) { 
		this.min = parseFloat( min ); 
	};
	this.setMax = function( max ) { 
		this.max = parseFloat( max ); 
	};
	this.setRange = function( min, max ) { 
		this.min = parseFloat( min );
		this.max = parseFloat( max );
	};
	
	this.render = function() {			
		this.bar.style.width = ( ( this.value - this.min ) / ( this.max - this.min ) ) * this.div.clientWidth + 'px';
	}
	
	this.render();
	
	( function( data ) {
		
		/*data.div.addEventListener( 'click', function( event ) {
		}, false );*/
		
		function getClampedAdjustedValue( v ) {
			var value = data.min + v * ( data.max - data.min ) / data.div.clientWidth;
			if( value < data.min ) value = data.min;
			if( value > data.max ) value = data.max;				
			return value;
		}
		
		data.div.addEventListener( 'mousedown', function( event ) {
			data.buttonDown = true;
			data.element.setValue( getClampedAdjustedValue( event.clientX - findPos( data.div ).left ) );
			data.render();
		}, false );

		data.div.addEventListener( 'mouseup', function( event ) {
			data.buttonDown = false;
		}, false );
		
		data.div.addEventListener( 'mousemove', function( event ) {				
			if( data.buttonDown ) {
				data.element.setValue( getClampedAdjustedValue( event.clientX - findPos( data.div ).left ) );
				data.render();
				event.preventDefault();
				return true;
			}
		}, false )
		
		data.div.addEventListener( 'mousewheel', function( event ) {
			console.log( event.detail );
		} , false );
		
		
	} )( this );

	
	this.setValue = function( value ) {
		this.value = value;			
		this.render();
	}
}
	
function Field( name, type, mode ) {

	this.name 	= name;
	this.type 	= type;
	this.syncWithFFT = false;
	
	var modeData = mode.split( ',' );
	switch( modeData[ 0 ] ) {
		case 'range': {
			this.min = parseFloat( modeData[ 1 ] );
			this.max = parseFloat( modeData[ 2 ] );
			break;
		}
	}
	this.mode = modeData[ 0 ];
	this.value 	= null;
	this.bindings = [];
	
	this.setValue = function( value ) {
		this.value = value;
		var message = this.name + '=' + this.value;			
		//screen.postMessage( message,  'https://secure.example.net' );
		for( var j in this.bindings ) {
			this.bindings[ j ].setValue( value );
		}
	}
	
	this.setSyncWithFFT = function( sync ) {
		this.syncWithFFT = sync;
		this.fftField.setAttribute( 'checked', sync );
	}
	
	this.bind = function( binding ) {
		this.bindings.push( binding );
	}
}

function Object() {
	
	this.tweens = [];
	this.fields = {};
	
	this.render = function() {
		console.log( 'NOT IMPLEMENTED!' );
	}
	
	this.go = function( variable, value, time ) {
		/*var that = this;			
		if( !this.tweens[ variable ] ) {
			this.tweens[ variable ] = new TWEEN.Tween( this ).easing( TWEEN.Easing.Cubic.EaseOut ).onUpdate( function() {
				that.render();
			} );
		}
		this.tweens[ variable ].to( { fields[ variable ].value: value }, time ).start();*/
	}
	
	this.getFields = function() {
		return this.fields;
	}
	
	this.getField = function( id ) {
		return this.fields[ id ];
	}
	
	this.addField = function( name, type, mode ) {
		this.fields[ name ] = new Field( name, type, mode );
	}
	
	this.setValue = function( name, value ) {
		this.fields[ name ].value = value;
	}
	
	this.getValue = function( name ) {
		return this.fields[ name ].value;
	}
}

function LayerObject() {

	Object.call( this );
	
	this.width = 0;
	this.height = 0;
	this.z = 0;
	this.number = null;
	
	this.addField( 'opacity', 'float', 'range,0,1' );
	this.addField( 'scale', 'float', 'range,1,2' );
	this.addField( 'rotation', 'float', 'range,0,360' );

	this.setValue( 'opacity', 1 );
	this.setValue( 'scale', 1 );
	this.setValue( 'rotation', 0 );
			
	this.div = document.createElement( 'div' );
	this.div.className = 'layer';
	var screen = document.getElementById( 'screen' );
	screen.appendChild( this.div );

	this.setNumber = function( number ) {
		this.number = number;
	}
	
	this.render = function() {
		this.div.style.opacity = this.getValue( 'opacity' );
		this.div.style.MozTransform = 'scale(' + this.getValue( 'scale' ) + ',' + this.getValue( 'scale' ) + ') rotate(' + this.getValue( 'rotation' ) + 'deg)';
		this.div.style.webkitTransform = 'scale(' + this.getValue( 'scale' ) + ',' + this.getValue( 'scale' ) + ') rotate(' + this.getValue( 'rotation' ) + 'deg)';
		if( this instanceof VideoLayerObject ) {
			this.checkLoad();
		}
	}
	
	this.centerContent = function() {
		this.div.style.width = this.width + 'px';
		this.div.style.height = this.height + 'px';
		this.div.style.marginLeft = - .5 * this.width + 'px';
		this.div.style.marginTop = - .5 * this.height + 'px';	
	}
	
	this.remove = function() {
		screen.removeChild( this.div );
		$( this.controls ).fadeOut( 500, function() {
			controlsPanel.removeChild( this );
		} );
	}
	
	this.setOrder = function( order ) {
		this.z = order;
		this.div.style.zIndex = this.z;
	}
	
}

function VideoLayerObject() {

	LayerObject.call( this );
	
	this.id = 'Video';
	this.video = document.createElement( 'video' );
	this.div.appendChild( this.video );
	this.progressBar = null;
	
	(function(self){self.video.addEventListener( 'loadedmetadata', function() {
		self.width = this.videoWidth;
		self.height = this.videoHeight;
		self.centerContent();
	}, false )})(this);
	
	this.video.addEventListener( 'ended', function() {
		this.play();
	}, false );
	
	this.pause = function( state ) {
		if( state ) { this.video.pause(); }
		else { this.video.play(); }
	}
	
	this.setSource = function( source ) {
		this.video.pause();

		this.video.src = source;
		this.video.autoplay = true;
		this.video.preload = true;
		this.video.loop = true;
		this.video.play(); // WTF, Chrome?
		this.startPreloader();
	}
	
	this.updateProgressBar = function( value ) {
		if( !this.progressBar ) return;
		this.progressBar.setValue( value );
	}
	
	this.startPreloader = function(){
		this.updateProgressBar( 0 );
		this.checkLoad();
	}

	this.checkLoad = function() {
		if( this.video.buffered && this.video.buffered.length ){
			for( var j in this.video.buffered ) {
				var p = ( this.video.buffered.end( j ) - this.video.buffered.start( j ) ) / this.video.duration;
				this.updateProgressBar( p );
			}
		}
	}
			
}

function ImageLayerObject( id ) {

	LayerObject.call( this );
	
	this.id = 'Image';
	this.image = document.createElement( 'img' );
	this.div.appendChild( this.image );
	(function(self){ self.image.addEventListener( 'load', function() {
		self.width = this.width;
		self.height = this.height;
		self.centerContent();
	}, false )})(this);
	
	this.setSource = function( source ) {
		this.image.src = source;
	}
	
}

function TextLayerObject( id ) {
	
	LayerObject.call( this );
	
	this.id = 'Text';
	this.input = null;
	
	this.text = document.createElement( 'p' );
	this.text.style.display = 'table-cell';
	this.text.style.fontFamily = 'Doppio One';
	this.text.style.textShadow = '2px 2px 4px rgba( 0,0,0,.8 )';
	this.text.style.color = '#fff';
	this.text.style.textAlign = 'center';
	this.div.appendChild( this.text );
	
	this.setText = function( text ) {
		this.input.innerHTML = text;
		this.content = text;
		text = HtmlEncode( text );
		text = text.replace(/\n\r?/g, '<br />');
		this.text.innerHTML = text;
		this.width = this.text.clientWidth + 10;
		this.height = this.text.clientHeight + 0;
		this.centerContent();			
	}
	
}

function HtmlEncode( s ){
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  delete el;
  return s;
}


function removeLayer( layer ) {
	for( var l in layers ) {
		if( layers[ l ] == layer ) {
			var e = layers[ l ];
			layers.splice( l, 1 );
			e.remove();
		}
	}
}

function composeEditor( element ) {
	
	var fields = element.getFields();
	var panel = document.createElement( 'li' );
	panel.className = 'panel';
	panel.id = element.number;
	
	var title = document.createElement( 'h1' );
	panel.appendChild( title );
	title.innerHTML = element.id;
	title.className = 'handler';
	title.addEventListener( 'click', function(event) {
		$( controls ).toggle();
		event.preventDefault();
	}, false );
	
	var controls = document.createElement( 'div' );
	controls.style.padding = '4px';
	panel.appendChild( controls );
	
	var remove = document.createElement( 'a' );
	controls.appendChild( remove );
	remove.innerHTML = 'Delete';
	remove.setAttribute( 'href', '#' );
	remove.addEventListener( 'click', function( event ) {
		removeLayer( element );
		event.preventDefault();
	}, false );
	
	if( element instanceof VideoLayerObject || element instanceof ImageLayerObject ) {
	
		var progressDiv = document.createElement( 'div' );
		progressDiv.className = 'sunken slider';
		progressDiv.style.width = '100%';
		progressDiv.style.height = '4px';
		progressDiv.style.marginBottom = '4px';
		element.progressBar = new progressControl( progressDiv );
		controls.appendChild( progressDiv );

		var dropzone = document.createElement( 'div' );
		dropzone.innerHTML = 'Drag a file or click to select';
		dropzone.className = 'sunken dropzone';
		controls.appendChild( dropzone );
		controls.dropzone = dropzone;
		
		dropzone.addEventListener('dragenter', function(event){
			this.style.backgroundColor = 'rgba( 255,255,255,.2 )';
		}, true );

		dropzone.addEventListener('dragleave', function(event){
			this.style.backgroundColor = 'transparent';
		}, true );
		
		dropzone.addEventListener('dragover', function(event) {
			this.style.backgroundColor = 'rgba( 255,255,255,.2 )';
			event.preventDefault();
		}, true);
		
		dropzone.addEventListener('drop', function(event) {
			this.style.backgroundColor = 'transparent';
			event.preventDefault();
			var allTheFiles = event.dataTransfer.files;
			var reader = new FileReader();
			reader.onload = function(e) { 
				element.setSource( e.target.result );
			};
			reader.readAsDataURL(allTheFiles[0]);
			dropzone.innerHTML = allTheFiles[ 0 ].name;
			//layers[ 0 ].setSource( allTheFiles[ 0 ].name );
		}, true);
		
	}
	
	if( element instanceof VideoLayerObject || element instanceof ImageLayerObject ) {
	
		var selector = document.createElement( 'div' );
		var sources = [];
		if( element instanceof VideoLayerObject ) sources = [ 'videos/cross.webm', 'videos/disco.webm', 'videos/road01.webm', 'videos/logo.webm' ];
		if( element instanceof ImageLayerObject ) sources = [ 'images/miku.jpg', 'images/piano.jpg' ];
		
		for( var v in sources ) {
			var li = document.createElement( 'li' );
			var a = document.createElement( 'a' );
			a.innerHTML = sources[ v ];
			a.setAttribute( 'href', '#' );
			(function(v){ a.addEventListener( 'click', function() {
				element.setSource( v );
			}, false )})(sources[v]);
			li.appendChild( a );
			selector.appendChild( li );
		}
		selector.style.display = 'none';
		controls.appendChild( selector );
		
		controls.dropzone.addEventListener( 'click', function() {
			selector.style.display = 'block';
		}, false );
		
	}
	
	if( element instanceof TextLayerObject ) {
		var div = document.createElement( 'div' );
		var input = document.createElement( 'textarea' );
		input.style.color = 'black';
		input.style.width = '100%';
		div.appendChild( input );
		controls.appendChild( div );
		element.input = input;
		
		input.addEventListener( 'change', function( e ) {
			element.setText( this.value );
		}, false );
		
		input.addEventListener( 'keyup', function( e ) {
			element.setText( this.value );
		}, false );
		
	}
	
	for( var j in fields ) {
		switch( fields[ j ].type ) {
			case 'float': {
				var f = fields[ j ];
				
				var name = document.createElement( 'h2' );
				name.innerHTML = f.name;
				controls.appendChild( name );
				
				var div = document.createElement( 'div' );
				div.className = 'sunken slider';
				div.style.width = '100%';
				div.style.height = '10px';
				div.style.marginBottom = '4px';
				controls.appendChild( div );
				
				var slider = new sliderControl( f, div );
				slider.setRange( f.min, f.max );
				f.bind( slider );
				
				/*var div = document.createElement( 'div' );
				div.style.width = '40px';
				controls.appendChild( div );
				var input = new inputControl( f, div );
				f.bind( input );
				*/
				
				var divFFT = document.createElement( 'div' );
				divFFT.style.position = 'relative';
				divFFT.style.height = '1em';
				divFFT.style.display = 'block';
				divFFT.style.marginBottom = '10px';
				var check = document.createElement( 'input' );
				check.style.position = 'absolute';
				var d = new Date();
				check.id = 'check_' + element.number + '_' + f.name + '_' + d.getTime();
				check.style.left = 0;
				check.style.top = 0;
				check.setAttribute( 'type', 'checkbox' );					
				( function( e ) {
					check.addEventListener( 'change', function( event ) {
						e.setSyncWithFFT( this.checked );
				}, false );
				} )( f );
				f.fftField = check;
				divFFT.appendChild( check );
				var label = document.createElement( 'label' );
				label.setAttribute( 'for', check.id );
				label.innerHTML = 'Sync with FFT';
				label.style.position = 'absolute';
				label.style.left = '20px';
				label.style.top = 0;
				divFFT.appendChild( label );
				controls.appendChild( divFFT );			
				break;
			}
			case 'string': {
				break;
			}
		}
	}

	controlsPanel.appendChild( panel );
	element.controls = panel;
	
}

function addLayer( layer ) {
	layers.push( layer );
	layer.setNumber( layerCount );
	composeEditor( layer );
	layerCount++;
	sortLayers();
}

function init() {

	controlsPanel = document.getElementById( 'controlsPanel' );
	
	var aVB = document.getElementById( 'addVideoButton' );
	aVB.addEventListener( 'click', function( event ) {
		addLayer( new VideoLayerObject() );
		event.preventDefault();
	}, false );
	
	var aIB = document.getElementById( 'addImageButton' );
	aIB.addEventListener( 'click', function( event ) {
		addLayer( new ImageLayerObject() );
		event.preventDefault();
	}, false );
	
	var aTB = document.getElementById( 'addTextButton' );
	aTB.addEventListener( 'click', function( event ) {
		addLayer( new TextLayerObject() );
		event.preventDefault();
	}, false );
	
	//Layer properties,
	var l = new VideoLayerObject();
	addLayer( l );

	l.setSource( 'videos/cross.webm' );
	l.getField( 'scale' ).setValue( 1.75 );
	l.getField( 'rotation' ).setSyncWithFFT( true );
	l.getField( 'opacity' ).setValue( 1 );
	
	var l = new ImageLayerObject();
	addLayer( l );
	
	l.setSource( 'images/miku.jpg' );
	l.getField( 'scale' ).setValue( 1 );
	l.getField( 'rotation' ).setValue( 0 );
	l.getField( 'opacity' ).setSyncWithFFT( true );
	
	l = new TextLayerObject();
	addLayer( l );
	l.setText( 'Welcome to the Firefox HTML5 Benchmark.' + '\n' + 'How smooth your GPU? Play around on right side control' );
	l.getField( 'scale' ).setSyncWithFFT( true );
	l.getField( 'rotation' ).setValue( 0 );
	l.getField( 'opacity' ).setValue( 1 );
	
	video.addEventListener( 'canplaythrough', onVideoCanPlayThrough, false );
	video.addEventListener( 'loadedmetadata', onVideoLoadedMetadata, false );
	video.addEventListener( 'MozAudioAvailable', onAudioAvailable, false );
	video.src = 'music/Revolve.ogg';//qebo.webm';
	video.play();
	//End of layer properties
	
	var pB = document.getElementById( 'pauseButton' );
	pB.addEventListener( 'click', function( event ){
		paused = !paused;
		for( var l in layers ) {
			if( layers[ l ] instanceof VideoLayerObject ){
				layers[ l ].pause( paused );
			}
		}
		if( paused ) { video.pause(); }
		else { video.play(); }
		event.preventDefault();
	}, false );
	
	$( '#controlsPanel' ).sortable( {
		handle: '.handler',
		update: sortLayers
	} );//.disableSelection();
	
	animate();
	//pB.click();
}

function sortLayers() {
	var newOrder = $( '#controlsPanel' ).sortable( 'toArray' );
	var z = 100;
	for( var o in newOrder ) {
		for( var l in layers ) {
			if( layers[ l ].number == newOrder[ o ] ) {
				layers[ l ].setOrder( z );
				z++;
				continue;
			}
		}
	}
}

function onVideoLoadedMetadata() {

	channels          = video.mozChannels;
	rate              = video.mozSampleRate;
	frameBufferLength = video.mozFrameBufferLength;
	
}

function onVideoCanPlayThrough() {

	channels          = video.mozChannels;
	rate              = video.mozSampleRate;
	frameBufferLength = video.mozFrameBufferLength;
	
	if( channels == 0 ) return;
	fft = new FFT(frameBufferLength / channels, rate);

}

var fft;
var spectrum = new Float32Array();

function onAudioAvailable( event ) {

	if( !fft ) onVideoCanPlayThrough();
	
	var samples = event.frameBuffer;
	var time    = event.time;

	 var fb = event.frameBuffer,
		t  = event.time, /* unused, but it's there */
		signal = new Float32Array(fb.length / channels),
		magnitude;

	for (var i = 0, fbl = frameBufferLength / 2; i < fbl; i++ ) {
	  // Assuming interlaced stereo channels,
	  // need to split and merge into a stero-mix mono signal
	  signal[i] = (fb[2*i] + fb[2*i+1]) / 2;
	}

	fft.forward(signal);		

}

function animate() {

	requestAnimationFrame( animate );
	render();
	
}

var bands = 32;

function render() {
	
	if( fft ) {
	
		var step = fft.spectrum.length / bands;
					
		for( var j = 0; j < bands; j++ ) {
		
			var i = 0;
			for( var k = 0; k < step; k++ ) {
				i += fft.spectrum[ j * step + k ];
			}
			i /= step;
			i *= 500;
			
			for( var l in layers ) {
				for( var e in layers[ l ].fields ) {
					var f = layers[ l ].fields[ e ];
					if( f.syncWithFFT ) {						
						f.setValue( f.min + i * ( f.max - f.min ) );
					}					
				}
			}
		}
		
	}
	
	for( var l in layers ) {
		layers[ l ].render();
	}
			
}