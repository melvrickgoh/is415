PLACES_TYPES = ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo']
SERVICE_CERTIFICATE = process.env.SERVICE_CERTIFICATE || '27c9ad866018f539e4bd83b7bb39c8a0bdba862a';
SERVICE_KEY_FILE = 'googleapi-privatekey.pem';

SERVICE_CLIENT_KEY = process.env.GOOGLE_CLIENT_KEY || 'AIzaSyDnI-9gTqF4GRaAlM-hxFqG_LXfN7KUEs4';
SERVICE_ID = process.env.SERVICE_CLIENT_ID || '308636096652-mr4roq6qatbj71ego8r9pk6h0uu4gdfh.apps.googleusercontent.com';
SERVICE_EMAIL = process.env.SERVICE_CLIENT_EMAIL || '308636096652-mr4roq6qatbj71ego8r9pk6h0uu4gdfh@developer.gserviceaccount.com';

google = require('googleapis');

function GoogleServices(options){}

GoogleServices.prototype.constructor = GoogleServices;

GoogleServices.prototype.autosuggestPlaces = function(){
	return PLACES_TYPES;
}

GoogleServices.prototype.searchPlaces = function(searchType,locaiton,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    callback(err);
	    return;
	  }
	  // Make an authorized request to patch file title.
	  console.log(client);

	  /*client.places.files.patch({
	  	fileId:fileID,
	  },{
		title:title
	  }
	  ).withAuthClient(authClient).execute(function(err,response) {
	  		callback(err,response);
		});*/
	}
	_serviceAccountExecution(authClientCallback);
}

/*
* Service discovery and request execution
*/
function _serviceAccountExecution(authClientCallback){
	google
	  	.discover('drive', 'v2')
	  	.execute(function(err, client) {

		  var authClient = new google.auth.JWT(
		    SERVICE_EMAIL,
		    SERVICE_KEY_FILE,
		    // Contents of private_key.pem if you want to load the pem file yourself
		    // (do not use the path parameter above if using this param)
		    '',
		    ['https://www.googleapis.com/auth/places'],
		    // User to impersonate (leave empty if no impersonation needed)
		    '');

		  authClient.authorize(function(err,tokens){
		  	authClientCallback(err,tokens,client,authClient);
		  });

		});
}

module.exports = GoogleServices;