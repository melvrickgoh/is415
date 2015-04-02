function Lunr(){
	this.index = lunr(function () {
    this.field('name', { boost: 10 })
    this.field('formatted_address')
	});
	this.store = {};
	this.aggregated_store = {};
}

Lunr.prototype.reset = function(){
	LUNR.index = lunr(function(){
		this.field('name', { boost: 10 })
    this.field('formatted_address')
	});
	LUNR.store = {};
	LUNR.aggregated_store = {};
}

Lunr.prototype.add = function(type,payload){
	if (type=='google') {
		LUNR.index.add(payload);
		LUNR.store[payload.id] = payload;
		LUNR.aggregated_store[payload.id] = LUNR.loadAggregate(payload);
	}
}

Lunr.prototype.match = function(term){
	return LUNR.index.search(term);
}

Lunr.prototype.loadAggregate = function(payload){
	return {
		id : payload.id,
		type: 'google',
		name: payload.name,
		place_id: payload.place_id,
		icon: payload.icon,
		rating: payload.rating || 0,
		formatted_address: payload.formatted_address,
		lat: payload.geometry.location.k,
		lng: payload.geometry.location.D
	}
}

Lunr.prototype.loadFoursquareAggregate = function(payload){
	LUNR.aggregated_store[payload.id] = {
		id: payload.id,
		type: 'foursquare',
		name: payload.name,
		lat: payload.location.lat,
		lng: payload.location.lng,
		formatted_address: payload.location.formatted_address ? payload.location.formatted_address.join(', ') : '',
		checkinsCount: payload.stats.checkinsCount,
		tipsCount: payload.stats.tipCount,
		usersCount: payload.stats.usersCount,
		contact: payload.contact.formattedPhone ? payload.contact.formattedPhone : ''
	}
}

Lunr.prototype.appendFoursquareAggregate = function(googleID,foursquarePayload){
	var aggregate = LUNR.aggregated_store[googleID];
	aggregate['type'] = 'combined';
	aggregate['checkinsCount'] = foursquarePayload.stats.checkinsCount;
	aggregate['tipsCount'] = foursquarePayload.stats.tipCount;
	aggregate['usersCount'] = foursquarePayload.stats.usersCount;
	aggregate['contact'] = foursquarePayload.contact.formattedPhone ? foursquarePayload.contact.formattedPhone : '';
}

var LUNR = new Lunr();