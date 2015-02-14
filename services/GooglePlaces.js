var google_places = require('googleplaces'),
GOOGLE_API_KEY = process.env.GOOGLE_CLIENT_KEY || 'AIzaSyDnI-9gTqF4GRaAlM-hxFqG_LXfN7KUEs4';

var GOOGLE_PLACES = new google_places(GOOGLE_API_KEY,'json');

function GooglePlaces () {}

GooglePlaces.prototype.constructor = GooglePlaces;

GooglePlaces.prototype.search = function(parameters,callback){
	GOOGLE_PLACES.placeSearch(parameters, callback);
}

GooglePlaces.prototype.details = function(reference,callback){
  GOOGLE_PLACES.placeDetailsRequest({reference:reference}, callback);
}

module.exports = GooglePlaces;