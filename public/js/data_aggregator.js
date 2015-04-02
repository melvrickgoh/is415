function DataAggregator(){
	this.DATA_HASH = {};

	this.empty = function(){
		this.DATA_HASH = {};
	}
}

DataAggregator.prototype.loadData = function(input, type, data, token){
	var processLoadData = function(input,type,data,token){
		if (type == 'google'){
			if ($.inArray(token, DATA_COMBINE.DATA_HASH[input]["tokens"]) > -1) {
        return;
      } else {
        DATA_COMBINE.DATA_HASH[input]['tokens'].push(token);
        //add points to existing layer
        DATA_COMBINE.DATA_HASH[input]['payload']['google'] = $.merge(DATA_COMBINE.DATA_HASH[input]['payload']['google'],data);
      }
		}

		if (type == 'foursquare'){
			if (DATA_COMBINE.DATA_HASH[input]['foursquare']) {
				return;
			} else {
				DATA_COMBINE.DATA_HASH[input]['foursquare'] = true;
				//add code to combine data here
				DATA_COMBINE.DATA_HASH[input]['payload']['foursquare'] = $.merge(DATA_COMBINE.DATA_HASH[input]['payload']['foursquare'],data.response.venues);
			}
		}
	}

	if (!DATA_COMBINE.DATA_HASH[input]) {
		DATA_COMBINE.DATA_HASH[input] = {
			payload: { google: [],	foursquare: [] },
			search_term: input,
			tokens: []
		}
	}
	//load in the data
	processLoadData(input,type,data,token);
}

DataAggregator.prototype.getAggregatedData = function(){
	return LUNR.aggregated_store;
}

DataAggregator.prototype.cleanData = function(input,callback){
	var inputHash = DATA_COMBINE.DATA_HASH[input];
	if (inputHash) {
		var payload = inputHash['payload'],
		google = payload['google'],
		foursquare = payload['foursquare'];
		
		DATA_COMBINE.loadGoogleData(google);
		DATA_COMBINE.matchFoursquareData(foursquare);
	}else{
		alert('Data for ' + input + ' not found. Please retry');
	}
}

DataAggregator.prototype.loadGoogleData = function(payload){
	LUNR.reset(); //reset document index
	for (var i in payload) {
		LUNR.add('google',payload[i]);
	}
}

DataAggregator.prototype.matchFoursquareData = function(payload){
	for (var i in payload) {
		var foursquare = payload[i];
		var ranking = LUNR.match(foursquare.name);
		if (ranking.length > 0) { //ranking greater than 1. at least a similar one
			for (var k in ranking) {
				var itemRef = ranking[k],
				item = LUNR.store[itemRef.ref];
				//match google and foursquare items
				if (itemRef.score > 0.5) {
					var isHighlySimilar = DATA_COMBINE.matchFoursquareDistance(item,foursquare);
					if (isHighlySimilar) { //if highly similar within 70m
						LUNR.appendFoursquareAggregate(item.id,foursquare);
						break;
					}
				}
			}
			LUNR.loadFoursquareAggregate(foursquare);
		} else { //wholly new item
			LUNR.loadFoursquareAggregate(foursquare);
		}
	}
}

DataAggregator.prototype.matchFoursquareDistance = function(googlePayload,foursquarePayload){
	var distanceDiff = new L.latLng(googlePayload.geometry.location.k, googlePayload.geometry.location.D).distanceTo(new L.latLng(foursquarePayload.location.lat, foursquarePayload.location.lng));
	//console.log(googlePayload.name + ' .v ' + foursquarePayload.name + ' > ' + distanceDiff);
	return distanceDiff < 71;
}

var DATA_COMBINE = new DataAggregator();