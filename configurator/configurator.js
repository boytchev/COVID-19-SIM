
//
//	Retrieve/load the values of parameters
//		param( id, defaultValue )
//		param2( id, defaultValueA, defaultValueB )
//		processTags()
//
//	Generate/store the values of parameters 
//		prepareValues( onlyModified = false )
//
//	Generate HTML representation of parameter
//		addHeader( level, name, logo='', info='', tags='' )
//		addNumeric( id, name, defaultValue, options, info='', tags='' )
//		addNumericSlider( id, name, defaultValue, options, info='', tags='' )
//		addNumericRange( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
//		addNumericList( id, name, defaultValue, options, info='', tags='' )
//		addPercentage( id, name, defaultValue, options, info='', tags='' )
//		addBoolean( id, name, defaultValue, options, info='', tags='' )
//		addTime( id, name, defaultValue, options, info='', tags='' )
//		addTimeRange( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
//
//	User interaction
//		toggleFav( id )
//		infoConfigurator()
//		showAllConfigurator()
//		resetConfigurator()
//		debugConfigurator()
//		shareConfigurator()
//		toggleFilter( event )
//

// templates

const LOCAL_STORAGE_FAVS = 'covid-19-favs';
const LOCAL_STORAGE_PARAMS = 'covid-19-params'; // same name used in config.js
export const LOCAL_STORAGE_FILTER = 'covid-19-filter';

export const LOCALHOST = (location.hostname == 'localhost' || location.hostname == '127.0.0.1' || location.hostname == '');

const configParams = new URLSearchParams(
		window.location.search ||
		localStorage.getItem( LOCAL_STORAGE_PARAMS ) );

console.log('URL',window.location.search);
console.log('STO',localStorage.getItem( LOCAL_STORAGE_PARAMS ));

import * as ruler from './ruler.js';

export var ids = [];
export var id_count = 0;
export var internal_id_count = 0;

var allTags = [];
export var data = {};


	
var predefinedFavs = localStorage.getItem( LOCAL_STORAGE_FAVS );
if( predefinedFavs !== null )
	predefinedFavs = predefinedFavs.split( ' ' );


export var configInfo = param( 'cfg-si', true );
export var configAllParams = param( 'cfg-all', false );

//console.log('configInfo',configInfo)
//console.log('configAllParams',configAllParams)

export function timeMs( hours, minutes=0, seconds=0 )
{
	return 1000*(seconds + 60*minutes + 60*60*hours);
} // timeMs


export function dayMs( days, hours=0, minutes=0, seconds=0 )
{
	return 1000*(seconds + 60*minutes + 60*60*hours + 60*60*24*days);
} // dayMs




const SECONDS_IN_DAY = 24*60*60;
const SECONDS_IN_HOUR = 60*60;
const SECONDS_IN_MINUTE = 60;

export function msToString( ms, showSeconds=true, showMinutes=true )
{
	var seconds = Math.floor( ms/1000 );
	
	var days = Math.floor( seconds / SECONDS_IN_DAY );
		seconds = seconds % SECONDS_IN_DAY;
	
	if( !seconds )
	{
		if( days == 1 ) return days+' day';
		if( days ) return days+' days';
	}
	
	var	hours = Math.floor( seconds / SECONDS_IN_HOUR ),
		minutes = Math.floor( (seconds%SECONDS_IN_HOUR) / SECONDS_IN_MINUTE ),
		seconds = seconds % SECONDS_IN_MINUTE;

	var str = days?days+'d ':'';
	str += (hours<10?'0':'')+hours;
	if( showMinutes ) str += (minutes<10?':0':':')+minutes;
	if( showSeconds) str += (seconds<10?':0':':')+seconds;

	return str;
	
} // msToString


const
	NUMERIC = 1,
	BOOLEAN = 2,
	TEMPORAL = 3,
	PERCENTAGE = 4,
	HEADER = 5,
	NUMERIC_RANGE = 6,
	NUMERIC_LIST = 7,
	TEMPORAL_RANGE = 8,
	NUMERIC_SLIDER = 9,
	NUMERIC_LIST_SLIDER = 10,
	TEMPORAL_SLIDER = 11,
	NUMERIC_RANGE_SLIDER = 12,
	TEMPORAL_RANGE_SLIDER = 13;
export {NUMERIC_SLIDER,NUMERIC_LIST_SLIDER,NUMERIC_RANGE_SLIDER,TEMPORAL_SLIDER,TEMPORAL_RANGE_SLIDER};

// get a parameter
function param( id, defaultValue )
{
	var value;

	// first look for the parameter in the URL
	// if not there, then check in local storage
	// eventually, return the default value
	if( configParams.has(id) )
		value = configParams.get( id )
	else
		value = defaultValue;
		
	if( value=='true' ) value = true;
	if( value=='false' ) value = false;
	if( !isNaN(parseFloat(value)) ) value = parseFloat(value);	
	
//	if( LOCALHOST ) console.log(id,'=',value,configParams.get( id ));
	
	return value;
}


function param2( id, defaultValueA, defaultValueB )
{
	var value;
	

	if( configParams.has(id) )
	{
		value = configParams.get( id ).split('~');
//console.log(id,'=',value,configParams.get( id ));
//console.log('a',id,	[parseFloat(value[0]), parseFloat(value[1])]);
		return [parseFloat(value[0]), parseFloat(value[1])];
	}

//console.log(id,'=',value,configParams.get( id ));
//console.log('a',id,	[defaultValueA,defaultValueB]);
	return [defaultValueA,defaultValueB];
}
	
export function addNumeric( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.value = param( id, defaultValue ) || 0;
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;


	// calculate width of field
	var testVal = parseFloat(options.max)+parseFloat(options.step),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = Math.max( (testVal+'').length*0.9+0.5, 1.5 );

	
	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}"
						class="value"
						type="number"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.value}"
						step="${options.step}"
						style="width: ${width}em;">
				</td>
				<td class="unit" width="1%">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range is from ${options.min} to ${options.max}. Default value is ${defaultValue}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	NUMERIC,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		defaultValue: defaultValue,
		options: options,
	}
	
}


export function addPercentage( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.value = param( id, defaultValue );
	options.tags = tags.split( ',' );

	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	function p( x ) { return Math.round(100*x); }
	
	// calculate width of field
	var testVal = parseFloat(p(options.max))+parseFloat(p(options.step)),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = Math.max( (testVal+'').length*0.9+0.5, 1.5 );


	// construct the html
		
	var html =`
		<table id="block-${id}"  class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}" class="value" type="number" name="${id}" min="${p(options.min)}" 	max="${p(options.max)}" value="${p(options.value)}" step="${p(options.step)}"
					style="width: ${width}em;">				
				</td>
				<td class="unit" width="1%">%</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range is from ${p(options.min)}% to ${p(options.max)}%. Default value is ${p(defaultValue)}%.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;
		
	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	PERCENTAGE,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		defaultValue: defaultValue,
		options: options,
	}
	
}


export function addBoolean( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options
	options.value = param( id, defaultValue );
	options.defaultValue = defaultValue;
	options.tags = tags.split( ',' );
	
	allTags.push( ...options.tags );

	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<table id="block-${id}"  class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}" class="value" type="checkbox" name="${id}" value="${options.value}" ${options.value?'checked':''}>
				</td>
			</tr>
			<tr class="info"><td colspan="2">
				${info} Default state is ${defaultValue?'checked':'not checked'}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	BOOLEAN,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		defaultValue: defaultValue,
		options: options,
	}
	
	if( options.config )
	{
		// save configuration parameter
		data[id].value.addEventListener( 'change', event =>
			{
				localStorage.setItem( 'covid-19-'+id, event.target.checked?'1':'0' );
				console.log('covid-19-'+id, event.target.checked?'1':'0' );
			} );

		// process SHOW INFO parameter
		if( id == 'cfg-si' )
		{
			data[id].value.addEventListener( 'change', event =>
				{
					configInfo = event.target.checked;					
					for( var elem of document.querySelectorAll( '.info' ) )
						elem.style.display = event.target.checked?'':'none';
				} );
		}

		// process SHOW ALL parameter
		if( id == 'cfg-all' )
		{
			data[id].value.addEventListener( 'change', event =>
				{
					configAllParams = event.target.checked;
					for( var elem of document.querySelectorAll( '.internal' ) )
						elem.style.display = event.target.checked?'':'none';
					// switching from all params to primary params
					// shoudl automaticaly set filter to all
					//document.getElementById( 'all' ).click();

					document.getElementById( 'hide_them' ).style.display = configAllParams?'inline':'none';
					document.getElementById( 'show_them' ).style.display = configAllParams?'none':'inline';
					
				} );
		}
	}
}



export function toggleFav( id )
{
	// toggle on screen and memory
	
	data[id].options.fav = !data[id].options.fav;
	data[id].name.classList.toggle( 'fav' );
	
	// record toggling
	
	var favs = [];
	for( var id in data)
		if( data[id].options?.fav )
			favs.push( id );

	localStorage.setItem( LOCAL_STORAGE_FAVS, favs.join(' ') );
}


export function infoConfigurator()
{
	var elem = document.getElementById( 'cfg-si' ).click();
}

export function showAllConfigurator()
{
	var elem = document.getElementById( 'cfg-all' ).click();
}

export function resetConfigurator()
{
	// clear local storage
	
	localStorage.removeItem( LOCAL_STORAGE_FAVS );
	localStorage.removeItem( LOCAL_STORAGE_PARAMS );
	localStorage.removeItem( LOCAL_STORAGE_FILTER );

	localStorage.removeItem( 'covid-19-cfg-si' );
	localStorage.removeItem( 'covid-19-cfg-all' );
	
	// reload page
	
	location.reload();
}

export function debugConfigurator()
{
	console.log( 'Full parameters:', prepareValues( false ) );
	console.log( 'Modified parameters:', prepareValues( true ) );
	console.log( 'Favourites:', localStorage.getItem( LOCAL_STORAGE_FAVS ) );
	console.log( 'Filter:', localStorage.getItem( LOCAL_STORAGE_FILTER ) );

}

export function shareConfigurator()
{
	prepareValues( true, true ); // only modified, skip configs
	
	var url = window.location.href,
		path = url.substring(0, url.lastIndexOf('/')),
		sharedURL = path + '/covid-19-simulator.html'+localStorage.getItem( LOCAL_STORAGE_PARAMS );
	
	prompt( 'Generating shareable URL is experimental feature. Grab the URL from below:', sharedURL );
}

export function toggleFilter( event )
{
	var elem = event.target,
		filter = elem.id=='tags' ? elem.value : elem.id;
	
	var filterElems = document.querySelectorAll( '.filter' );
	for( var filterElem of filterElems )
		filterElem.classList.toggle( 'selected', filterElem==elem );

	localStorage.setItem( LOCAL_STORAGE_FILTER, filter );

	var hideInternal = !configAllParams;
	
	switch( filter )
	{
		case 'fav':
			for( var id in data )
			{
				var show = data[id].options?.fav;
				if( hideInternal && data[id].options.internal ) show = false;
				data[id].block.style.display = show ? 'block' : 'none';
			}
			break;
			
		case '':
		case 'all':
			for( var id in data )
			{
				var show = true;
				if( hideInternal && data[id].options.internal ) show = false;
				data[id].block.style.display = show ? 'block' : 'none';
			}
			break;
			
		default:
			for( var id in data )
			{
//console.log(data[id].options);
				var show = (data[id].options.tags.indexOf(filter)>=0);
				if( hideInternal && data[id].options.internal ) show = false;
				data[id].block.style.display = show ? 'block' : 'none';
//				console.log(id,data[id].options.tags,filter,data[id].options.tags.indexOf(filter));
			}
	}
}

export function prepareValues( onlyModified = false, skipConfigs = false )
{
	var str = '';

	for( var id in data )
	{
		if( skipConfigs && data[id].options.config ) continue;
		
		var cmd = null;

		switch( data[id].type )
		{
			case NUMERIC:
				if( (!onlyModified) || (data[id].value.value != data[id].defaultValue) )
					cmd = data[id].value.value;
				break;
			case BOOLEAN:
				if( (!onlyModified) || (data[id].value.checked != data[id].defaultValue) )
					cmd = data[id].value.checked?'true':'false';
				break;
			case TEMPORAL:
				var arr = (data[id].value.value+':00:00').split(':'),
					value = 1000*(parseInt(arr[0])*SECONDS_IN_HOUR + parseInt(arr[1])*SECONDS_IN_MINUTE + parseInt(arr[2]));
				if( (!onlyModified) || (value != data[id].defaultValue) )
				{
					cmd = value;
				}
				break;
			case PERCENTAGE:
				if( (!onlyModified) || (data[id].value.value != Math.round(100*data[id].defaultValue)) )
				{
					cmd = data[id].value.value/100;
				}
				break;
			case HEADER:
				break;
			case NUMERIC_RANGE:
				if( (!onlyModified) || (data[id].valueA.value != data[id].defaultValueA) || (data[id].valueB.value != data[id].defaultValueB) )
				{
					var min = Math.min( data[id].valueA.value, data[id].valueB.value );
					var max = Math.max( data[id].valueA.value, data[id].valueB.value );
					cmd = min+'~'+max;
				}
				break;
			case NUMERIC_LIST:
				if( (!onlyModified) || (data[id].value.value != data[id].defaultValue) )
					cmd = data[id].value.value;
				break;
			case TEMPORAL_RANGE:
				var arrMin = (data[id].valueA.value+':00:00').split(':'),
					arrMax = (data[id].valueB.value+':00:00').split(':'),
					valueA = 1000*(parseInt(arrMin[0])*SECONDS_IN_HOUR + parseInt(arrMin[1])*SECONDS_IN_MINUTE + parseInt(arrMin[2])),
					valueB = 1000*(parseInt(arrMax[0])*SECONDS_IN_HOUR + parseInt(arrMax[1])*SECONDS_IN_MINUTE + parseInt(arrMax[2]));
				if( (!onlyModified) || (valueA != data[id].defaultValueA) || (valueB != data[id].defaultValueB) )
				{
					var min = Math.min( valueA, valueB );
					var max = Math.max( valueA, valueB );
					cmd = min+'~'+max;
				}
				break;

			case NUMERIC_SLIDER:
			case TEMPORAL_SLIDER:
				if( (!onlyModified) || (data[id].options.value != data[id].defaultValue) )
					cmd = data[id].options.percentage ? data[id].options.value/100 : Math.round(100*data[id].options.value)/100;
				break;
			case NUMERIC_LIST_SLIDER:
				if( (!onlyModified) || (data[id].options.values[data[id].options.value] != data[id].defaultValue) )
					cmd = data[id].options.values[data[id].options.value];
				break;
			case NUMERIC_RANGE_SLIDER:
			case TEMPORAL_RANGE_SLIDER:
				if( (!onlyModified) || (data[id].options.valueA != data[id].defaultValueA) || (data[id].options.valueB != data[id].defaultValueB) )
				{
					var min = Math.round(100*Math.min( data[id].options.valueA, data[id].options.valueB ))/100,
						max = Math.round(100*Math.max( data[id].options.valueA, data[id].options.valueB ))/100;
					cmd = min+'~'+max;
				}
				break;
			default:
				throw 'Invalid configuration parameter type "'+id+'"';
		}
		
		if( cmd !== null ) str += (str?'&':'?') + id + '=' + cmd;
	}

	localStorage.setItem( LOCAL_STORAGE_PARAMS, str );

	console.log(str);
	return str;
}

export function addTime( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = msToString(options.min||0);
	options.max = msToString(options.max||1000);
	options.step = options.step||1;
	options.value = msToString(param( id, defaultValue ));
	options.tags = tags.split( ',' );
	
	allTags.push( ...options.tags );

//console.log('reading',param( id, defaultValue ),'as', options.value);
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<table id="block-${id}"  class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}"
						class="value"
						type="time"
						name="${id}"
						value="${options.value}"
						min="${options.min}"
						max="${options.max}"
						${options.value?'checked':''}>
				</td>
			</tr>
			<tr class="info"><td colspan="2">
				${info} Range is from ${options.min} to ${options.max}. Default value is ${msToString(defaultValue)}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	TEMPORAL,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		defaultValue: defaultValue,
		options: options,
	}
	
}

var ID = 1;

export function addHeader( level, name, logo='', info='', tags='', options={} )
{

	// construct the html
	var tag = 'h'+Math.round(level+1),
		id = 'id'+(ID++);

	options.tags = tags.split(',');
	
	if( logo )
	{
		logo = '<img class="logo" src="icons/'+logo+'.svg"> ';
	}
	
	var html =`
		<div id="block-${id}" class="header ${options.internal?'internal':''}">
			<${tag} class="caption">${logo}${name}</${tag}>
			<div class="info">${info}</div>
			<div class="tags">${tags.split(',')}</div>
		</div>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );

	data[id] = {
		type:	HEADER,
		block:	document.getElementById('block-'+id),
		options: options,
	}
	
	allTags.push( ...options.tags );
}


export function addNumericRange( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.valueA = param2( id, defaultValueA, defaultValueB )[0];
	options.valueB = param2( id, defaultValueA, defaultValueB )[1];
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// calculate width of field
	var testVal = parseFloat(options.max)+parseFloat(options.step),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = Math.max( (testVal+'').length*0.9+0.5, 1.5 );
	
	// construct the html
	var html =`
		<table id="block-${id}"  class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name}
				</td>
				<td class="valuerow">
					<input id="${id}-min"
						class="value"
						type="number"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.valueA}"
						step="${options.step}"
						style="width: ${width}em;">
					<span class="from-to">&#x223C;</span>	
					<input id="${id}-max"
						class="value"
						type="number"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.valueB}"
						step="${options.step}"
						style="width: ${width}em;">
				</td>
				<td class="unit" width="1%">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range for each bound is from ${options.min} to ${options.max}. Default value is ${defaultValueA} to ${defaultValueB}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	NUMERIC_RANGE,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		valueA:	document.getElementById(id+'-min'),
		valueB:	document.getElementById(id+'-max'),
		defaultValueA: defaultValueA,
		defaultValueB: defaultValueB,
		options: options,
	}
	
}


export function addNumericList( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.value = param( id, defaultValue );
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';

	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	var htmlOptions = '';
	for( var i=0; i<options.values.length; i+=2 )
		htmlOptions += `<option value="${options.values[i]}">${(''+options.values[i+1]).toUpperCase()}</option>`;
	
	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<select id="${id}"
						class="value"
						name="${id}">
						${htmlOptions}
					</select>
				</td>
				<td class="unit" width="1%">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Default value is <em>${options.values[options.values.indexOf(defaultValue)+1]}</em>.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	NUMERIC_LIST,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		defaultValue: defaultValue,
		options: options,
	}

	data[id].value.value = options.value;
}



export function addTimeRange( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = msToString(options.min||0);
	options.max = msToString(options.max||1000);
	options.step = options.step||1;
	options.valueA = msToString(param2( id, defaultValueA, defaultValueB )[0]);
	options.valueB = msToString(param2( id, defaultValueA, defaultValueB )[1]);
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name}
				</td>
				<td class="valuerow">
					<input id="${id}-min"
						class="value"
						type="time"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.valueA}"
						step="${options.step}">
					<span class="from-to">&#x223C;</span>	
					<input id="${id}-max"
						class="value"
						type="time"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.valueB}"
						step="${options.step}">
				</td>
			</tr>
			<tr class="info"><td colspan="2">
				${info} Range for each bound is from ${options.min} to ${options.max}. Default value is ${msToString(defaultValueA)} to ${msToString(defaultValueB)}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	TEMPORAL_RANGE,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		valueA:	document.getElementById(id+'-min'),
		valueB:	document.getElementById(id+'-max'),
		defaultValueA: defaultValueA,
		defaultValueB: defaultValueB,
		options: options,
	}
	
}


export function processTags()
{
	for( var filter of document.querySelectorAll('button.filter') )
	{
		var idx;
		while( (idx=allTags.indexOf( filter.id )) !== -1 )
			allTags.splice( idx, 1 );
	}
	
	//console.log('original count',allTags.length);
	allTags = [...new Set(allTags)];
	//console.log('final count',allTags.length);
	allTags.sort();
	//console.log('tags',allTags);
	
	var htmlOptions = '<option value="" disabled selected hidden>MORE...</option>';
	
	for( var tag of allTags )
		htmlOptions += `<option value="${tag}">${tag.toUpperCase()}</option>`;

	document.getElementById( 'tags' ).innerHTML = htmlOptions;



console.log('statistics');
var cnt = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
for(var id in data) cnt[data[id].type]++;
for(var i=1; i<14; i++)
{
	if( i==NUMERIC_SLIDER )
		console.log('\t-----');
	console.log(i+'\t',cnt[i]);
}

}


export function addNumericSlider( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	if( options.percentage )
		options.value = Math.round(100*param( id, defaultValue/100 )) || 0;
	else
		options.value = param( id, defaultValue ) || 0;
	
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	// calculate width of field
	var testVal = parseFloat(options.max)+parseFloat(options.step),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = Math.max( (testVal+'').length*0.58, 1.5 );


	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}" style="position: relative;">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow" style="min-width:10em;" id="${id}"></td>
				<td class="valuerow" style="width:1%;">
					<span id="display-${id}"
						class="value"
						style="display:inline-block; width:${width}em;">
						${Math.round(100*options.value)/100}
					</span>
				</td>
				<td class="unit" style="width:1%;">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="4">
				${info} Range is from ${options.min} to ${options.max}. Default value is ${defaultValue}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	NUMERIC_SLIDER,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		display:document.getElementById('display-'+id),
		defaultValue: defaultValue,
		options: options,
	}
}


	
export function addNumericListSlider( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = Math.min(...options.values)||0;
	options.max = Math.max(...options.values)||100;
	options.step = options.step||1;

	// get the index of the value
	var v = param( id, defaultValue ) || 0,
		vidx = options.values.indexOf( v );
	if( vidx<0 ) for( vidx=options.values.length-1; vidx>=0; vidx-- ) if( options.values[vidx]<v ) break;
	
	options.value = vidx;
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	// calculate width of field
	var testVal = parseFloat( options.max ),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = Math.max( (testVal+'').length*0.58, 1.5 );
	
	if( options.displayWidth ) width = options.displayWidth;
	
	function display(x)
	{
		if( options.display )
			return options.display( x );
		else
			return x;
	}
	
	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}" style="position: relative;">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow" style="min-width:10em;" id="${id}"></td>
				<td class="valuerow" style="width:1%;">
					<span id="display-${id}"
						class="value"
						style="display:inline-block; width:${width}em;">
						${display(options.values[options.value])}
					</span>
				</td>
				<td class="unit" style="width:1%">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="4">
				${info} Range is from ${display(Math.min(...options.values))} to ${display(Math.max(...options.values))}. Default value is ${display(defaultValue)}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;

	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	NUMERIC_LIST_SLIDER,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		display:document.getElementById('display-'+id),
		defaultValue: defaultValue,
		options: options,
	}
	
}


	
export function addTimeSlider( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.value = param( id, defaultValue ) || 0;
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	// calculate width of field
	var width = options.seconds ? 4.2 : 3;

	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}" style="position: relative;">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow" style="min-width:10em;" id="${id}"></td>
				<td class="valuerow" style="width:1%;">
					<span id="display-${id}"
						class="value"
						style="display:inline-block;
						width:${width}em;">
						${msToString(options.value,options.seconds)}
					</span>
				</td>
				<td class="unit" style="width:3em;">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="4">
				${info} Range is from ${msToString(options.min,options.seconds)} to ${msToString(options.max,options.seconds)}. Default value is ${msToString(defaultValue,options.seconds)}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
	
	data[id] = {
		type:	TEMPORAL_SLIDER,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		display:document.getElementById('display-'+id),
		defaultValue: defaultValue,
		options: options,
	}
	
}


	
export function addNumericRangeSlider( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.valueA = param2( id, defaultValueA, defaultValueB )[0];
	options.valueB = param2( id, defaultValueA, defaultValueB )[1];
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	// calculate width of field
	var testVal = parseFloat(options.max)+parseFloat(options.step),
		testVal = Math.round( 1000000*testVal )/1000000;
	
	var width = 2*Math.max( (testVal+'').length*0.58, 1.5 )+0.25;

	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}" style="position: relative;">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow" style="min-width:10em;" id="${id}"></td>
				<td class="valuerow" style="width:1%;">
					<span id="display-${id}"
						class="value"
						style="display:inline-block; width:${width}em;">
						${options.valueA}~${options.valueB}
					</span>
				</td>
				<td class="unit" style="width:1%;">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="4">
				${info} Range for each bound is from ${options.min} to ${options.max}. Default value is ${defaultValueA} to ${defaultValueB}.
				<div class="tags">${tags.split(',')}</div>
			</td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );

	data[id] = {
		type:	NUMERIC_RANGE_SLIDER,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		display:document.getElementById('display-'+id),
		defaultValueA: defaultValueA,
		defaultValueB: defaultValueB,
		options: options,
	}
	
}


	
export function addTimeRangeSlider( id, name, defaultValueA, defaultValueB, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	id_count++;
	if( options.internal ) internal_id_count++;
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.valueA = param2( id, defaultValueA, defaultValueB )[0];
	options.valueB = param2( id, defaultValueA, defaultValueB )[1];
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	allTags.push( ...options.tags );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	// calculate width of field
	var width = options.seconds ? 9 : 6.5;

	// construct the html
	var html =`
		<table id="block-${id}" class="block ${options.internal?'internal':''}" style="position: relative;">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}"
					onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow" style="min-width:10em;" id="${id}"></td>
				<td class="valuerow" style="width:1%;">
					<span id="display-${id}"
						class="value"
						style="display:inline-block; width:${width}em;">
						${msToString(options.valueA,options.seconds)}~${msToString(options.valueB,options.seconds)}
					</span>
				</td>
				<td class="unit" style="width:3em;">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range for each bound is from ${msToString(options.min,options.seconds)} to ${msToString(options.max,options.seconds)}. Default value is ${msToString(defaultValueA,options.seconds)} to ${msToString(defaultValueB,options.seconds)}.
				<div class="tags">${tags.split(',')}</div>
			</td><td></td></tr>
		</table>`;

			


	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );

	data[id] = {
		type:	TEMPORAL_RANGE_SLIDER,
		block:	document.getElementById('block-'+id),
		name:	document.getElementById('name-'+id),
		value:	document.getElementById(id),
		display:document.getElementById('display-'+id),
		defaultValueA: defaultValueA,
		defaultValueB: defaultValueB,
		options: options,
	}
	
}




export function onInputNumericSlider( event )
{
	var id = event.target.getAttribute( 'id' );

	if( id.substring(id.length-4) == '-max' || id.substring(id.length-4) == '-min' )
		id = id.substring(0,id.length-4);
		
	switch(	data[id].type )
	{
		case NUMERIC_SLIDER:
				data[id].display.innerHTML = event.target.value;
				break;
				
		case NUMERIC_LIST_SLIDER:
				data[id].display.innerHTML = data[id].options.values[event.target.value];
				break;
				
		case TEMPORAL_SLIDER:
				data[id].display.innerHTML = msToString( event.target.value, data[id].options.seconds );
				break;
				
		case NUMERIC_RANGE_SLIDER:
				data[id].display.innerHTML = data[id].valueA.value+'..'+data[id].valueB.value;
				break;
		
		default:
			throw 'Invalid configuration parameter type "'+id+'"';
	}
}
