
// templates

const LOCAL_STORAGE_FAVS = 'covid-19-favs';
const LOCAL_STORAGE_PARAMS = 'covid-19-params'; // same name used in config.js
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


const
	NUMERIC = 1,
	BOOLEAN = 2;

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
	
	console.log(id,'=',value);
	
	return value;
}
	
function addNumeric( id, name, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options
	
	options.min = options.min||0;
	options.max = options.max||100;
	options.step = options.step||1;
	options.default = options.default||10;
	options.value = param( id, options.value||options.default );
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<input id="${id}" class="value" type="number" name="${id}" min="${options.min}" max="${options.max}" value="${options.value}" step="${options.step}">
			<div class="info">${info} Range is from ${options.min} to ${options.max}. Default value is ${options.default}.</div>
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
		options: options,
	}
	
}


function addBoolean( id, name, options, info='', tags='' )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options
	
	options.default = param( id, options.default||false );
	options.value = param( id, options.value||options.default );
	options.tags = tags.split( ',' );
	
	if( predefinedFavs )
		options.fav = predefinedFavs.indexOf(id)>=0;
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.fav?'fav':''}" onclick="toggleFav('${id}')">${name} ${options.debug?'<span class="debug">(debug)</span>':''}</div>
			<input id="${id}" class="value" type="checkbox" name="${id}" value="${options.value}" ${options.value?'checked':''}>
			<div class="info">${info} Default state is ${options.default?'checked':'not checked'}.</div>
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
		options: options,
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
		if( data[id].options.fav )
			favs.push( id );

	localStorage.setItem( LOCAL_STORAGE_FAVS, favs.join(' ') );
}


function resetConfigurator()
{
	// clear local storage
	
	localStorage.removeItem( LOCAL_STORAGE_FAVS );
	
	// reload page
	
	location.reload();
}

function toggleFilter( )
{
	var n;
	
	if( document.getElementById('show-fav').checked ) n = 1;
	if( document.getElementById('show-all').checked ) n = 0;
		
	switch( n )
	{
		case 1: // show favourites
			for( var id in data )
				data[id].block.style.display = data[id].options.fav ? 'block' : 'none';
			break;
		default: // show all
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
		}
	}

	localStorage.setItem( LOCAL_STORAGE_PARAMS, str );

//	console.log(str);
}