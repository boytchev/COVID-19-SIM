
//
// Class Ruler
//		onMouseOver( id )
//		onMouseOut()
//		pos( value )
//		dot( value )
//		thumb( value )
//		label( label, value )
//

const EXT = 100; // total gaps from left and right
const DOT_Y_POS = 26;
const DOT_SIZE = 3;	
const THUMB_SIZE = 9;
const ratio = 1.25*window.devicePixelRatio;

import {data as allData, msToString, NUMERIC_SLIDER, NUMERIC_LIST_SLIDER, NUMERIC_RANGE_SLIDER, TEMPORAL_SLIDER } from './configurator.js';

var canvas = document.getElementById( 'ruler' ),
	ctx = canvas.getContext("2d"),
	id = null,
	data = null,
	width,
	thumbX,
	currentThumb = -1,
	mouseDown = false;

canvas.addEventListener( 'mousemove', onMouseMove );
canvas.addEventListener( 'mousedown', onMouseDown );
canvas.addEventListener( 'mouseup', onMouseUp );
canvas.addEventListener( 'mouseout', onMouseOut );
canvas.addEventListener( 'click', onClick );

canvas.addEventListener( 'dragstart', function(e)
{
	e.preventDefault();
}	);


// show the ruler at configuration parameter with given id
function show( )
{
	
	var rect = data.value.getBoundingClientRect(),
		leftPos = Math.round( rect.left + window.scrollX );

	width = Math.round( rect.right - rect.left );

	var rect = data.block.getBoundingClientRect(),
		topPos  = rect.top + window.scrollY;
		
	canvas.style.display = 'block';
	canvas.style.left = (leftPos-EXT/2)+'px';
	canvas.style.top = `calc(${topPos}px - 2em)`;
	canvas.style.width = (width+EXT)+'px';
	canvas.width = (width+EXT)*ratio;
	canvas.height = (40)*ratio;
	
	ctx.scale( ratio, ratio );
	ctx.font = '12px Roboto';
	ctx.textAlign = 'center';

	draw();
	
} // show

	
	
// hide the ruler
export function onMouseOut( event )
{
	canvas.style.display = 'none';
} // hide
	

export function onMouseOver( event )
{
	id = event.target.getAttribute( 'id' );

	if( id.indexOf('block-')==0 )
		id = id.substring(6);
	else
		return;

	data = allData[id];

	if( data.type != NUMERIC_SLIDER && 
		data.type != NUMERIC_LIST_SLIDER  && 
		data.type != NUMERIC_RANGE_SLIDER &&
		data.type != TEMPORAL_SLIDER )
		return;
	
	show( );
}



// get pixel position depending on value
function pos( value )
{
	switch( data.type )
	{
		case NUMERIC_SLIDER:
		case NUMERIC_RANGE_SLIDER:
		case TEMPORAL_SLIDER:
			var max = data.options.max,
				min = data.options.min;
			return EXT/2+11+Math.round((value-min)/(max-min) * (width-22));
			
		case NUMERIC_LIST_SLIDER:
			var max = data.options.values.length-1,
				min = 0;
			return EXT/2+11+Math.round((value-min)/(max-min) * (width-22));
			
		default:
			throw 'Invalid configuration parameter type "'+data.type+'"';
	}
} // pos



// get value from pixel position 
function unpos( x )
{
	var value;
	
	switch( data.type )
	{
		case NUMERIC_SLIDER:
		case NUMERIC_RANGE_SLIDER:
		case TEMPORAL_SLIDER:
			var max = data.options.max,
				min = data.options.min,
				step = data.options.step||1,
				value = (x-EXT/2-11)/(width-22)*(max-min)+min;
			return Math.max( Math.min( Math.round(value/step)*step, max ), min );	
			
		case NUMERIC_LIST_SLIDER:
			var max = data.options.values.length-1,
				min = 0,
				value = (x-EXT/2-11)/(width-22)*(max-min)+min;
			return Math.max( Math.min( Math.round(value), max ), min );	
			
		default:
			throw 'Invalid configuration parameter type "'+data.type+'"';
	}
} // unpos



function dot( value )
{
	ctx.arc( pos(value), DOT_Y_POS, DOT_SIZE, 0, 2*Math.PI );
}



function bar( valueA, valueB )
{
	var xA = pos(valueA),
		xB = pos(valueB);
	ctx.fillStyle = 'rgba(0,0,0,0.2)';
	ctx.fillRect( Math.min(xA,xB), DOT_Y_POS-THUMB_SIZE, Math.abs(xA-xB), 2*THUMB_SIZE );
}



function thumb( value )
{
	thumbX = pos(value);
	ctx.arc( thumbX, DOT_Y_POS, THUMB_SIZE, 0, 2*Math.PI );
}



function label( label, value )
{
	ctx.fillText( label, pos(value), 15);
}


function onMouseMove( event )
{
	if( Math.abs(event.offsetX-thumbX) < THUMB_SIZE )
		event.target.style.cursor = 'pointer';
	else
		event.target.style.cursor = 'default';
	
	if( mouseDown ) onClick( event );
}


function onClick( event )
{
	if( !mouseDown ) return;
	
	switch(	data.type )
	{
		case NUMERIC_SLIDER:
				data.options.value = unpos( event.offsetX);
				data.display.innerHTML = data.options.value;
				break;
				
		case NUMERIC_LIST_SLIDER:
				data.options.value = unpos( event.offsetX);
				data.display.innerHTML = data.options.values[data.options.value];
				break;
				
		case TEMPORAL_SLIDER:
				data.options.value = unpos( event.offsetX);
				data.display.innerHTML = msToString( data.options.value, data.options.seconds );
				break;
				
		case NUMERIC_RANGE_SLIDER:
				var value = unpos( event.offsetX);

				if( currentThumb < -0.5 )
					currentThumb = (Math.abs(value-data.options.valueA) < Math.abs(value-data.options.valueB)) ? 0 : 1;
			
				if( currentThumb == 0 )
					data.options.valueA = value;
				else
					data.options.valueB = value;

				data.display.innerHTML = Math.min(data.options.valueA,data.options.valueB)+'~'+Math.max(data.options.valueA,data.options.valueB);
				break;
		
		default:
			throw 'Invalid configuration parameter type "'+id+'"';
	}
	draw();
}



function onMouseDown( event )
{
	mouseDown = true;
	onClick( event );
}



function onMouseUp( event )
{
	mouseDown = false;
	currentThumb = -1;
//	console.log('now\t',currentThumb);
}



function draw()
{
	// clear
	ctx.clearRect( 0, 0, width+EXT, 40 );
	
	// draw axis
	ctx.fillStyle = 'lightgray';
	ctx.fillRect( EXT/2+11, DOT_Y_POS-0.5, width-22, 1 );
	ctx.fillStyle = 'black';
	
	if( data.type == NUMERIC_SLIDER || data.type == NUMERIC_RANGE_SLIDER)
	{
		var max = data.options.max,
			min = data.options.min,
			labelStep = data.options.labelStep,
			dotStep = data.options.dotStep || data.options.labelStep || 1;

		ctx.beginPath();
		if( data.options.labels )
		{
			// custom labels
			var labels = data.options.labels;
			for( var i=0; i<labels.length; i+=2 ) label( labels[i+1], labels[i] );
		}
		else
		{
			// default labels
			label( min, min );
			for( var i=max; i>min; i-=labelStep ) label( i, i );
		}

		// dots
		dot( min );
		for( var i=max; i>min; i-=dotStep ) dot( i );
		
		// thumb
		if( data.type == NUMERIC_SLIDER )
			thumb( data.options.value );
		
		if( data.type == NUMERIC_RANGE_SLIDER )
		{
			bar( data.options.valueA, data.options.valueB );
			thumb( data.options.valueA );
			thumb( data.options.valueB );
		}
	}
	else
	if( data.type == NUMERIC_LIST_SLIDER )
	{
		var n = data.options.values.length-1;

		ctx.beginPath();
		for( var i=0; i<=n; i++ )
		{
			label( data.options.values[i], i );
			dot( i );
		}

		// thumb
		thumb( data.options.value );
	}
	else
	if( data.type == TEMPORAL_SLIDER )
	{
		var max = data.options.max,
			min = data.options.min,
			labelStep = data.options.labelStep||timeMs(1),
			dotStep = data.options.dotStep||timeMs(1);

		ctx.beginPath();

		// labels
		label( msToString(min,data.options.labelSeconds,data.options.labelMinutes), min );
		for( var i=max; i>min; i-=labelStep )
			label( msToString(i,data.options.labelSeconds,data.options.labelMinutes), i );

		// dots
		dot( min );
		for( var i=max; i>min; i-=dotStep )
			dot( i );

		// thumb
		thumb( data.options.value );
	}
	
	ctx.fillStyle = 'gray';
	ctx.fill();
}


