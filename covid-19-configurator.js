
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
	PERCENTAGE = 4;
	HEADER = 5;

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
	options.value = param( id, defaultValue );
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<div class="right">${options.unit?'<span class="unit" style="left:'+(options.offset||6.8)+'em;">'+options.unit+'</span>':''}<input id="${id}" class="value" type="number" name="${id}" min="${options.min}" max="${options.max}" value="${options.value}" step="${options.step}"></div>
			<div class="info">${info} Range is from ${options.min} to ${options.max}. Default value is ${defaultValue}.</div>
		</div>`;

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
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<div class="right"><span class="unit" style="left:3.5em;">%</span><input id="${id}" class="value" type="number" name="${id}" min="${Math.round(100*options.min)}" max="${Math.round(100*options.max)}" value="${Math.round(100*options.value)}" step="${Math.round(100*options.step)}" style="width: 3em;"></div>
			<div class="info">${info} Range is from ${Math.round(100*options.min)}% to ${Math.round(100*options.max)}%. Default value is ${Math.round(100*defaultValue)}%.</div>
		</div>`;

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
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<div class="right"><input id="${id}" class="value" type="checkbox" name="${id}" value="${options.value}" ${options.value?'checked':''}></div>
			<div class="info">${info} Default state is ${defaultValue?'checked':'not checked'}.</div>
		</div>`;

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
	prepareValues();
	console.log( 'fav:', localStorage.getItem( LOCAL_STORAGE_FAVS ) );
	console.log( 'params:', localStorage.getItem( LOCAL_STORAGE_PARAMS ) );
	console.log( 'filter:', localStorage.getItem( LOCAL_STORAGE_FILTER ) );

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
			
		case 'show-main':
			for( var id in data )
				data[id].block.style.display = data[id].options?.debug ? 'none' : 'block';
			break;
			
		case 'show-all':
		default:
			for( var id in data )
				data[id].block.style.display = 'block';
	}
}

function prepareValues()
{
	var str = '';

	for( var id in data )
	{
		str += (str?'&':'?') + id + '=';
		
		switch( data[id].type )
		{
			case NUMERIC:
				str += data[id].value.value;
				break;
			case BOOLEAN:
				str += data[id].value.checked?'true':'false';
				break;
			case TEMPORAL:
			console.log(id);
			console.log(data[id]);
				var arr = (data[id].value.value+':00:00').split(':');
				str += 1000*(parseInt(arr[0])*SECONDS_IN_HOUR + parseInt(arr[1])*SECONDS_IN_MINUTE + parseInt(arr[2]));
				break;
			case PERCENTAGE:
				str += data[id].value.value/100;
				break;
			case HEADER:
				break;
		}
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
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<div class="right"><input id="${id}" class="value" type="time" name="${id}" min="${options.min}" max="${options.max}" value="${options.value}" step="${options.step}"></div>
			<div class="info">${info} Range is from ${options.min} to ${options.max}. Default value is ${msToString(defaultValue)}.</div>
		</div>`;

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


