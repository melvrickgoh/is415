var GoogleAPIs, 
GooglePlaces,
SINGAPORE_LATLON = [1.3520830,103.819836];

function PlacesController (googleapis,googleplaces) {
	GoogleAPIs = googleapis;
	GooglePlaces = googleplaces;
}

PlacesController.prototype.searchPlaces = function(type,callback){
	console.log(GooglePlaces);
	GooglePlaces.search({
		location	: SINGAPORE_LATLON,
		types			: type
	},callback);
}

PlacesController.prototype.constructor = PlacesController;

module.exports = PlacesController;