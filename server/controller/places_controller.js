var GoogleAPIs, 
GooglePlaces,
FoursquareVenues,
SINGAPORE_LATLON = [1.3520830,103.819836];

function PlacesController (googleapis,googleplaces,foursquarevenues) {
	GoogleAPIs = googleapis;
	GooglePlaces = googleplaces;
	FoursquareVenues = foursquarevenues;
}

PlacesController.prototype.searchPlaces = function(type,callback){
	GooglePlaces.search({
		location	: SINGAPORE_LATLON,
		types			: type,
		radius 		: 25000.
	},callback);
}

PlacesController.prototype.textSearchPlaces = function(query,callback){
	GooglePlaces.textSearch({
		query 		: query,
		location	: SINGAPORE_LATLON,
		radius 		: 25000
	},callback);
}

PlacesController.prototype.searchVenues = function(id,callback){
	FoursquareVenues.search(id,callback);
}

PlacesController.prototype.constructor = PlacesController;

module.exports = PlacesController;