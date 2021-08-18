
// templates

const LOCAL_STORAGE_FAVS = 'covid-19-favs';
const LOCAL_STORAGE_PARAMS = 'covid-19-params'; // same name used in config.js
const LOCAL_STORAGE_FILTER = 'covid-19-filter';

const storedParams = new URLSearchParams( localStorage.getItem( LOCAL_STORAGE_PARAMS ) );
const urlParams = new URLSearchParams( window.location.search );

console.log('URL',window.location.search);
console.log('STO',localStorage.getItem( LOCAL_STORAGE_PARAMS ));


var ids = [],
	tags = [],
	data = {};


	
var predefinedFavs = localStorage.getItem( LOCAL_STORAGE_FAVS );
if( predefinedFavs !== null )
	predefinedFavs = predefinedFavs.split( ' ' );


function timeMs( hours, minutes=0, seconds=0 )
{
	return 1000*(seconds + 60*minutes + 60*60*hours);
} // timeMs

const SECONDS_IN_DAY = 24*60*60;
const SECONDS_IN_HOUR = 60*60;
const SECONDS_IN_MINUTE = 60;

function msToString( ms )
{
	var seconds = Math.floor( ms/1000 ) % SECONDS_IN_DAY;
	
	var hours = Math.floor( seconds / SECONDS_IN_HOUR ),
		minutes = Math.floor( (seconds%SECONDS_IN_HOUR) / SECONDS_IN_MINUTE ),
		seconds = seconds % SECONDS_IN_MINUTE;
	
	return (hours<10?'0':'')+hours+(minutes<10?':0':':')+minutes+(seconds<10?':0':':')+seconds;
} // msToString


const
	NUMERIC = 1,
	BOOLEAN = 2,
	TEMPORAL = 3,
	PERCENTAGE = 4,
	HEADER = 5,
	NUMERIC_RANGE = 6;

// get a parameter
function param( id, defaultValue )
{
	var value;

	// first look for the parameter in the URL
	// if not there, then check in local storage
	// eventually, return the default value
//console.log('param',id);
//console.log(urlParams.has(id),urlParams.get( id ));
//console.log(storedParams.has(id),storedParams.get( id ));
//console.log(defaultValue);

	if( urlParams.has(id) )
		value = urlParams.get( id )
	else
	if( storedParams.has(id) )
		value = storedParams.get( id )
	else
		value = defaultValue;
		
	if( value=='true' ) value = true;
	if( value=='false' ) value = false;
	if( !isNaN(parseFloat(value)) ) value = parseFloat(value);	
	
//	console.log(id,'=',value);
	
	return value;
}
	
function param2( id, defaultValueMin, defaultValueMax )
{
	var value;

	if( urlParams.has(id) )
	{
		value = urlParams.get( id ).split('~');
		return [parseFloat(value[0]), parseFloat(value[1])];
	}
	else
	if( storedParams.has(id) )
	{
		value = storedParams.get( id ).split('~');
		return [parseFloat(value[0]), parseFloat(value[1])];
	}

	return [defaultValueMin,defaultValueMax];
}
	
function addNumeric( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.value = param( id, defaultValue ) || 0;
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	var html =`
		<table id="block-${id}" class="block">
			<tr>
				<td id="name-${id}"
					width="1"
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
						step="${options.step}">
				</td>
				<td class="unit" width="1">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range is from ${options.min} to ${options.max}. Default value is ${defaultValue}.
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
		tags: tags,
	}
	
}


function addPercentage( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.value = param( id, defaultValue );
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;

	function p( x ) { return Math.round(100*x); }
	
	// construct the html
		
	var html =`
		<table id="block-${id}" class="block">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}" class="value" type="number" name="${id}" min="${p(options.min)}" max="${p(options.max)}" value="${p(options.value)}" step="${p(options.step)}">
				</td>
				<td class="unit" width="1%">%</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range is from ${p(options.min)}% to ${p(options.max)}%. Default value is ${p(defaultValue)}%.
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
		tags: tags,
	}
	
}


function addBoolean( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options
	
	options.value = param( id, defaultValue );
	options.defaultValue = defaultValue;
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<table id="block-${id}" class="block">
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
		tags: tags,
	}
}



function toggleFav( id )
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


function resetConfigurator()
{
	// clear local storage
	
	localStorage.removeItem( LOCAL_STORAGE_FAVS );
	localStorage.removeItem( LOCAL_STORAGE_PARAMS );
	localStorage.removeItem( LOCAL_STORAGE_FILTER );
	
	// reload page
	
	location.reload();
}

function debugConfigurator()
{
	prepareValues( false );
	console.log( 'fav:', localStorage.getItem( LOCAL_STORAGE_FAVS ) );
	console.log( 'params:', localStorage.getItem( LOCAL_STORAGE_PARAMS ) );
	console.log( 'filter:', localStorage.getItem( LOCAL_STORAGE_FILTER ) );

}

function shareConfigurator()
{
	prepareValues( true );
	console.log( window.location.protocol + '//' + window.location.host + '/covid-19-simulator.html'+localStorage.getItem( LOCAL_STORAGE_PARAMS ) );
}

function toggleFilter( )
{
	var filter = 'show-fav';

	var elems = document.querySelectorAll('input[type="radio"][name="show"]');
	for( var elem of elems )
		if( elem.checked ) 
			filter = elem.getAttribute( 'id' );
		
	localStorage.setItem( LOCAL_STORAGE_FILTER, filter );

	switch( filter )
	{
		case 'show-fav':
			for( var id in data )
				data[id].block.style.display = data[id].options?.fav ? 'block' : 'none';
			break;
			
		case 'show-all':
		default:
			for( var id in data )
				data[id].block.style.display = 'block';
	}
}

function prepareValues( onlyMOdified )
{
	var str = '';

	for( var id in data )
	{
		var cmd = '';
		
		switch( data[id].type )
		{
			case NUMERIC:
				if( !onlyMOdified || data[id].value.value != data[id].value.defaultValue )
					cmd = data[id].value.value;
				break;
			case BOOLEAN:
				if( !onlyMOdified || data[id].value.checked != (data[id].value.defaultValue=='true') )
					cmd = data[id].value.checked?'true':'false';
				break;
			case TEMPORAL:
				if( !onlyMOdified || data[id].value.value != data[id].value.defaultValue )
				{
					var arr = (data[id].value.value+':00:00').split(':');
					cmd = 1000*(parseInt(arr[0])*SECONDS_IN_HOUR + parseInt(arr[1])*SECONDS_IN_MINUTE + parseInt(arr[2]));
				}
				break;
			case PERCENTAGE:
				if( data[id].value.value != data[id].value.defaultValue )
					cmd = data[id].value.value/100;
				break;
			case HEADER:
				break;
			case NUMERIC_RANGE:
				if( !onlyMOdified || data[id].valueMin.value != data[id].defaultValueMin || data[id].valueMax.value != data[id].defaultValueMax )
					cmd = data[id].valueMin.value+'~'+data[id].valueMax.value;
				break;
		}
		
		if( cmd ) str += (str?'&':'?') + id + '=' + cmd;
	}

	localStorage.setItem( LOCAL_STORAGE_PARAMS, str );

//	console.log(str);
}

function addTime( id, name, defaultValue, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options

	options.min = msToString(options.min||0);
	options.max = msToString(options.max||1000);
	options.step = options.step||1;
	options.value = msToString(param( id, defaultValue ));
	options.tags = tags.split( ',' );
//console.log('reading',param( id, defaultValue ),'as', options.value);
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<table id="block-${id}" class="block">
			<tr>
				<td id="name-${id}"
					width="1%"
					class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">
					${name} 
				</td>
				<td class="valuerow">
					<input id="${id}" class="value" type="time" name="${id}" value="${options.value}" ${options.value?'checked':''}>
				</td>
			</tr>
			<tr class="info"><td colspan="2">
				${info} Range is from ${options.min} to ${options.max}. Default value is ${msToString(defaultValue)}.
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
		tags: tags,
	}
	
}

var ID = 1;

function addHeader( level, name, logo='', info='', tags='' )
{
	// construct the html
	var tag = 'h'+Math.round(level+1),
		id = 'id'+(ID++);
	
	if( logo )
	{
		logo = '<img class="logo" src="icons/'+logo+'.svg"> ';
	}
	
	var html =`
		<div id="block-${id}" class="header">
			<${tag} class="caption">${logo}${name}</${tag}>
			<div class="info">${info}</div>
		</div>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );

	data[id] = {
		type:	HEADER,
		block:	document.getElementById('block-'+id),
		tags: tags,
	}
	
}


function addNumericRange( id, name, defaultValueMin, defaultValueMax, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options

	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.valueMin = param2( id, defaultValueMin, defaultValueMax )[0] || 0;
	options.valueMax = param2( id, defaultValueMin, defaultValueMax )[1] || 100;
	options.tags = tags.split( ',' );
	options.unit = options.unit||'';
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	var html =`
		<table id="block-${id}" class="block">
			<tr>
				<td id="name-${id}"
					width="1"
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
						value="${options.valueMin}"
						step="${options.step}">
				</td>
				<td class="unit" width="1">${options.unit}</td>
			</tr>
			<tr>
				<td class="name" style="text-align: right;">TO</td>
				<td class="valuerow">
					<input id="${id}-max"
						class="value"
						type="number"
						name="${id}"
						min="${options.min}"
						max="${options.max}"
						value="${options.valueMax}"
						step="${options.step}">
				</td>
				<td class="unit" width="1">${options.unit}</td>
			</tr>
			<tr class="info"><td colspan="3">
				${info} Range for each bound is from ${options.min} to ${options.max}. Default value is ${defaultValueMin} to ${defaultValueMax}.
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
		valueMin:	document.getElementById(id+'-min'),
		valueMax:	document.getElementById(id+'-max'),
		defaultValueMin: defaultValueMin,
		defaultValueMax: defaultValueMax,
		options: options,
		tags: tags,
	}
	
}
