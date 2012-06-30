var stats = new Stats();
stats.setMode( 0 ); // 0 = FPS 1 = MS
document.body.appendChild( stats.domElement );

var canvas = document.createElement( 'canvas' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild( canvas );

var context = canvas.getContext( '2d' );

setInterval( function (){
	var time = Date.now() * 0.001;
	context.clearRect( 0, 0, window.innerWidth, window.innerHeight );
	stats.begin();
	stats.end();
}, 1000 / 60 );