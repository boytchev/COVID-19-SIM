
// templates

var ids = [],
	tags = [];

function addNumeric( id, name, options, info )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options
	
	options.min = options.min||0;
	options.max = options.max||100;
	options.value = options.value||'';
	options.step = options.step||1;
	options.default = options.default||10;
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.favourite?'fav':''} ${options.debug?'debug':''}">${name}</div>
			<input id="${id}" class="value" type="number" name="${id}" min="${options.min}" max="${options.max}" value="${options.value}" step="${options.step}">
			<div class="subinfo">${info} Range is from ${options.min} to ${options.max}. Default value is ${options.default}.</div>
		</div>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
}


function addBoolean( id, name, options, info )
{
	// check id
	
	if( ids.indexOf(id) > -1 )
		throw `error: Element with id="${id}" is already decalred.`;

	ids.push( id );
	
	// set default values for missing options
	
	options.value = options.value||'';
	options.default = options.default||false;
	
	// construct the html
	
	var html =`
		<div id="block-${id}" class="block">
			<div id="name-${id}" class="name ${options.favourite?'fav':''} ${options.debug?'debug':''}">${name}</div>
			<input id="${id}" class="value" type="checkbox" name="${id}" value="${options.value}">
			<div class="subinfo">${info} Default state is ${options.default?'checked':'not checked'}.</div>
		</div>`;

	// create a new dom element
	
	var block = document.createElement('div');
		block.innerHTML = html;
	
	// insert in dom 
	
	document.getElementById("blocks").appendChild( block );
}
