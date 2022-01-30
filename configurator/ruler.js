
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
const DOT_Y_POS = 33;
const DOT_SIZE = 3;	
const THUMB_SIZE = 9;
const ratio = 1.25*window.devicePixelRatio;

import {data as allData, msToString, NUMERIC_SLIDER, NUMERIC_LIST_SLIDER, NUMERIC_RANGE_SLIDER, TEMPORAL_SLIDER, TEMPORAL_RANGE_SLIDER } from './configurator.js';

var canvas = document.getElementById( 'ruler' ),
	ctx = canvas.getContext("2d"),
	id = null,
	data = null,
	width,
	thumbX,
	currentThumb = -1,
	mouseDown = false;

canvas.addEventListener( 'touchmove', onMouseMove );
canvas.addEventListener( 'touchstart', onMouseDown );
canvas.addEventListener( 'touchend', onMouseUp );
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

	rect = data.block.getBoundingClientRect();
	var	topPos  = rect.top + window.scrollY;
		
	canvas.style.display = 'block';
	canvas.style.left = (leftPos-EXT/2)+'px';
	canvas.style.top = `calc(${topPos}px - 2em - 7px)`;
	canvas.style.width = (width+EXT)+'px';
	canvas.width = (width+EXT)*ratio;
	canvas.height = (45)*ratio;
	
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
		data.type != TEMPORAL_SLIDER &&
		data.type != TEMPORAL_RANGE_SLIDER )
		return;
	
	show( );
}



// get pixel position depending on value
function pos( value )
{
	var max, min;
	
	switch( data.type )
	{
		case NUMERIC_SLIDER:
		case NUMERIC_RANGE_SLIDER:
		case TEMPORAL_SLIDER:
		case TEMPORAL_RANGE_SLIDER:
				max = data.options.max,
				min = data.options.min;
				return EXT/2+11+Math.round((value-min)/(max-min) * (width-22));
			
		case NUMERIC_LIST_SLIDER:
				max = data.options.values.length-1,
				min = 0;
				return EXT/2+11+Math.round((value-min)/(max-min) * (width-22));
			
		default:
			throw 'Invalid configuration parameter type "'+data.type+'"';
	}
} // pos



// get value from pixel position 
function unpos( x )
{
	var max, min, value;
	
	switch( data.type )
	{
		case NUMERIC_SLIDER:
		case NUMERIC_RANGE_SLIDER:
		case TEMPORAL_SLIDER:
		case TEMPORAL_RANGE_SLIDER:
			max = data.options.max;
			min = data.options.min;
			var	step = data.options.step||1;
			value = (x-EXT/2-11)/(width-22)*(max-min)+min;
			return Math.max( Math.min( Math.round(value/step)*step, max ), min );	
			
		case NUMERIC_LIST_SLIDER:
			max = data.options.values.length-1;
			min = 0;
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
	var lines = (label+'').split( "|" ),
		y = 20;
	for( var i = lines.length-1; i>=0; i-- )
	{
		ctx.fillText( lines[i], pos(value), y);
		y -= 12;
	}
}


function onMouseMove( event )
{
	var x = (event.clientX || event.touches[0].clientX) - canvas.offsetLeft;
	if( Math.abs(x-thumbX) < THUMB_SIZE )
		event.target.style.cursor = 'pointer';
	else
		event.target.style.cursor = 'default';
	
	onClick( event );
}


function onClick( event )
{
	if( !mouseDown ) return;
	
	var x = (event.clientX || event.touches[0].clientX) - canvas.offsetLeft,
		value = unpos( x );

	switch(	data.type )
	{
		case NUMERIC_SLIDER:
				data.options.value = value;
				data.display.innerHTML = Math.round(100*value)/100;
				break;
				
		case NUMERIC_LIST_SLIDER:
				data.options.value = value;
				if( data.options.display )
					data.display.innerHTML = data.options.display(data.options.values[value]);
				else
					data.display.innerHTML = data.options.values[value];
				break;
				
		case TEMPORAL_SLIDER:
				data.options.value = value;
				data.display.innerHTML = msToString( value, data.options.seconds, data.options.minutes, data.options.days );
				break;
				
		case NUMERIC_RANGE_SLIDER:
				if( currentThumb < -0.5 )
					currentThumb = (Math.abs(value-data.options.valueA) < Math.abs(value-data.options.valueB)) ? 0 : 1;
			
				if( currentThumb == 0 )
					data.options.valueA = value;
				else
					data.options.valueB = value;

				data.display.innerHTML = Math.round(100*Math.min(data.options.valueA,data.options.valueB))/100+'~'+Math.round(100*Math.max(data.options.valueA,data.options.valueB))/100;
				break;
		
		case TEMPORAL_RANGE_SLIDER:
				if( currentThumb < -0.5 )
					currentThumb = (Math.abs(value-data.options.valueA) < Math.abs(value-data.options.valueB)) ? 0 : 1;
			
				if( currentThumb == 0 )
					data.options.valueA = value;
				else
					data.options.valueB = value;

				data.display.innerHTML = msToString(Math.min(data.options.valueA,data.options.valueB),data.options.seconds)+'~'+msToString(Math.max(data.options.valueA,data.options.valueB),data.options.seconds);
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
}



function draw()
{
	// clear
	ctx.clearRect( 0, 0, width+EXT, 45 );
	
	// draw axis
	ctx.fillStyle = 'lightgray';
	ctx.fillRect( EXT/2+11, DOT_Y_POS-0.5, width-22, 1 );
	ctx.fillStyle = 'black';
	
	var max, min, labelStep, dotStep;
	
	if( data.type == NUMERIC_SLIDER || data.type == NUMERIC_RANGE_SLIDER)
	{
		max = data.options.max;
		min = data.options.min;
		labelStep = data.options.labelStep || data.options.step || 1;
		dotStep = data.options.dotStep || labelStep;

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
			for( var i=max; i>min; i-=labelStep ) label( Math.round(100*i)/100, i );
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
			if( data.options.labels )
				label( data.options.labels[i]||data.options.values[i], i );
			else
				label( data.options.values[i], i );

			dot( i );
		}

		// thumb
		thumb( data.options.value );
	}
	else
	if( data.type == TEMPORAL_SLIDER || data.type == TEMPORAL_RANGE_SLIDER)
	{
		max = data.options.max;
		min = data.options.min;
		labelStep = data.options.labelStep||timeMs(1)
		dotStep = data.options.dotStep||timeMs(1);

		ctx.beginPath();

		// labels
		label( msToString(min,data.options.labelSeconds,data.options.labelMinutes,data.options.days), min );
		for( var i=max; i>min; i-=labelStep )
			label( msToString(i,data.options.labelSeconds,data.options.labelMinutes,data.options.days), i );

		// dots
		dot( min );
		for( var i=max; i>min; i-=dotStep )
			dot( i );

		// thumb
		if( data.type == TEMPORAL_SLIDER )
			thumb( data.options.value );
		
		if( data.type == TEMPORAL_RANGE_SLIDER )
		{
			bar( data.options.valueA, data.options.valueB );
			thumb( data.options.valueA );
			thumb( data.options.valueB );
		}
	}
	
	ctx.fillStyle = 'gray';
	ctx.fill();
}


