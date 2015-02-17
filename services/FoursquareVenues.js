var FOURSQUARE_ID = process.env.FOURSQUARE_CLIENT_ID || '0PMGH2MV0NBOF2SIX4KTEFSF5QHXR1BHIDTHBUO1G2BMIEWQ',
FOURSQUARE_SECRET = process.env.FOURSQUARE_CLIENT_SECRET || 'OIMIXN0V0S3UQYEH314J0XJ4T2MUHOCCXY4QAVHEV20B4DYB',
foursquare = require('node-foursquare-venues')(FOURSQUARE_ID, FOURSQUARE_SECRET);

function FoursquareVenues () {}

FoursquareVenues.prototype.constructor = FoursquareVenues;

FoursquareVenues.prototype.search = function(id,callback){
	foursquare.venues.search({ll:"1.3520830,103.819836",radius:25000,categoryId:id},callback);
}

FoursquareVenues.prototype.categories = function(callback){
	foursquare.venues.categories(function(err,res){
		if (err) { callback(true); return; }

		var name_array = [],
		name_hash = {};

		levelCategories(res.response.categories,name_hash,name_array);

		callback(false,{"array":name_array,"hash":name_hash})
	});
}

FoursquareVenues.prototype.custom_categories = function(callback){
	foursquare.venues.categories(function(err,res){
		if (err) { callback(true); return; }

		var name_array = [],
		name_hash = {};

		customCategories(res.response.categories,name_hash,name_array);

		callback(false,{"array":name_array,"hash":name_hash})
	});
}

function customCategories(input,name_hash,name_array){
	for (var i in input) {
		var payload = input[i],
		parent_name = payload.name;

		name_hash[payload.name] = {
			id: payload.id,
			name: payload.name,
			pluralName: payload.pluralName,
			shortName: payload.shortName,
			icon: payload.icon
		}
		name_array.push(payload.name);

		if (payload.categories) {
			var child_categories = payload.categories;
			for (var k in child_categories) {
				var child_category = child_categories[k],
				child_name = parent_name + ": " + child_category.name;

				name_hash[child_name] = {
					id: child_category.id,
					name: child_category.name,
					pluralName: child_category.pluralName,
					shortName: child_category.shortName,
					icon: child_category.icon
				}
				name_array.push(child_name);
			}
		}
	}
}

function levelCategories(input,name_hash,name_array){
	for (var i in input) {
		var payload = input[i];
		name_hash[payload.name] = {
			id: payload.id,
			name: payload.name,
			pluralName: payload.pluralName,
			shortName: payload.shortName,
			icon: payload.icon
		}
		name_array.push(payload.name);

		if (payload.categories) {
			levelCategories(payload.categories,name_hash,name_array);
		}
	}
}

module.exports = FoursquareVenues;