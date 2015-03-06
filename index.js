var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var methodOverride = require('method-override'),
cookie = require('cookie'),
cookieParser = require('cookie-parser'),
pg = require('pg.js'),
session = require('express-session'),
flash = require('connect-flash'),//allowing the flashing 
errorHandler = require('errorhandler'),
pgDAO = require('./server/dao/index');

var dotenv = require('dotenv');
dotenv.load();

var StaticData = require('./server/static_data');
var StaticSpatial = new StaticData();

var GoogleServices = require('./services/GoogleServices');
var GoogleAPIs = new GoogleServices();

var Google_Places_Interface = require('./services/GooglePlaces');
var GooglePlacesAdapter = new Google_Places_Interface();

var IronCache = require('./services/IronCache');
var cache = new IronCache();

var Foursquare_Venues_Interface = require('./services/FoursquareVenues');
var FoursquareVenuesAdapter = new Foursquare_Venues_Interface();

var UserController = require('./server/controller/UserController'),
uController = new UserController({pgURL:process.env.PG_DB_URL});
User = require('./server/entity/user'),
File = require('./server/entity/file');

//Controllers
var places_controller = require('./server/places_controller');
var PlacesController = new places_controller(GoogleAPIs,GooglePlacesAdapter,FoursquareVenuesAdapter);

var SQUARE_FOOT_KEY = process.env.SQUARE_FOOT_KEY;

app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser()); 
app.use(cookieParser());
app.use(session({
	secret:process.env.EXPRESS_SESSION_SECRET
}));
app.use(express.static(__dirname + '/public'));
app.use(flash());

main_router = express.Router();

main_router.route('/')
	.all(function(req,res){
		res.render('front', { message: 'Congrats, you just set up your app!' });
	});

main_router.route('/secure_map')
	.all(function(req,res){
		_restrict(req,res,function(user){
			res.render('map',{
				user : req.session.user
			});
		},'secure_map');
	});

main_router.route('/login')
	.all(function(req,res){
		GoogleAPIs.login(res);
	});

main_router.route('/oauth2callback')
	.all(function(req,res){
		var code = req.query.code;

		var returnCounter = 0;
		var loggedInUser = new User({}),
		files = [];

		GoogleAPIs.getUserAndDriveProfile(code,function(resultType,err,results,tokens,oauth2Client,client) {

	      if (err) {
	        console.log('An error occured', err);
	        return;
	      }else{
	      	switch(resultType){
	      		case 'profile':
	      			loggedInUser.id = results.id,
			      	loggedInUser.etag = results.etag,
			      	loggedInUser.gender = results.gender,
			      	loggedInUser.googleURL = results.url,
			      	loggedInUser.displayName = results.displayName,
			      	loggedInUser.name = results.name,
			      	loggedInUser.image = results.image,
			      	loggedInUser.email = results.emails[0].value? results.emails[0].value : 'no email',
			      	loggedInUser.emailUsername = _extractEmailUsername(results.emails[0].value),
			      	loggedInUser.lastVisit = new Date();

			      	tokens.access_token? 		loggedInUser.refreshToken = tokens.access_token : '';
	    				oauth2Client? 					loggedInUser.authClient = oauth2Client : '';
	    				client? 								loggedInUser.client = client : '';

	      			break;
	      		case 'folder':
	      			loggedInUser.ocrFolder = results;
	      			break;
	      		case 'drive':
	      			var filesObj = results.items;
	      			for (var i in filesObj){
	      				var fileObj = filesObj[i];
	      				files.push(new File({
	      					type : fileObj.kind,
									id : fileObj.id,
									etag : fileObj.etag,
									selfLink : fileObj.selfLink,
									alternateLink : fileObj.alternateLink,
									embedLink : fileObj.embedLink,
									iconLink : fileObj.iconLink,
									title : fileObj.title,
									mimeType : fileObj.mimeType,
									createdDate : fileObj.createdDate,
									modifiedDate : fileObj.modifiedDate,
									modifiedByMeDate : fileObj.modifiedByMeDate,
									lastViewedByMeDate : fileObj.lastViewedByMeDate,
									parents : fileObj.parents,
									exportLinks : fileObj.exportLinks,
									userPermission : fileObj.userPermission,
									ownerNames : fileObj.ownerNames,
									owners : fileObj.owners,
									lastModifyingUserName : fileObj.lastModifyingUserName,
									lastModifyingUser : fileObj.lastModifyingUser,
									editable : fileObj.editable,
									copyable : fileObj.copyable,
									shared : fileObj.shared
	      				}));
	      			}
	      			break;
	      		default:
	      			break;
	      	}
	      	returnCounter++;

	      	if (returnCounter == 3){//assign to the user the files at the end of the second callback
	      		loggedInUser.files = files;
	      		req.session.user = loggedInUser; //set the session to that of this user
	      		req.flash('user',loggedInUser);

	      		var authorization = req.session.authorization;
					  if (!authorization) {
					    authorization = req.session.authorization = {}
					  }
					  req.session.authorization['tokens'] = tokens;
					  req.session.authorization['authClient'] = oauth2Client;
					  req.session.authorization['client'] = loggedInUser.client;

	      		var targetRedirect = req.flash('target_locale')[0];//use only the first element as the result

	      		//update user database on user details
	      		uController.processGoogleLogin(loggedInUser,function(action,isSuccess,result){
	      			//action performed
	      			switch(action){
	      				case 'Update User':
	      					console.log(result);
	      					break;
	      				case 'Insert User':
	      					console.log(result);
	      					break;
	      				default:
	      			}
	      		});

	      		switch(targetRedirect){
	      			case 'secure_map':
	      				req.flash('target_locale',undefined);//reset given that you've logged in already
	      				res.redirect('/secure_map');
	      				break;
	      			default:
	      				res.redirect('/');
	      		}
	      	}
	      }
	      
	    });
	});

main_router.route('/squarefoot')
	.all(function(req, res) {
		res.render('squarefoot', { message: 'Congrats, you just set up your app!' });
	});

main_router.route('/autosuggest/places')
	.all(function(req,res){
		res.send(GoogleAPIs.autosuggestPlaces());
	});

main_router.route('/api/venues_search')
	.all(function(req,res){
		var venue_id = req.query.id,
		searchURL = req.originalUrl;
		//check cache for results
		cache.cacheRequest(searchURL,function(isCached,result){
			if (isCached) {		//is cached: use cache result
				console.log(result)
				console.log(result.value);
				res.send(result);
			}else{						//not cached so find more
				PlacesController.searchVenues(venue_id,function(err,response){
					console.log(err);
					console.log(response);
					if (err) {
						res.send({"error":true});
					}else{
						res.send(response);
					}
				});
			}
		});
	});

main_router.route('/api/places_search')
	.all(function(req,res){
		var place_category = req.query.place,
		searchURL = req.originalUrl;
		//check cache for results
		cache.cacheRequest(searchURL,function(isCached,result){
			if (isCached) {		//is cached: use cache result
				console.log(result);
				console.log(result.value);
				res.send(result);
			}else{						//not cached so find more
				PlacesController.searchPlaces(place_category,function(err,response){
					console.log(err);
					console.log(response);
					res.send('places google search');
				});
			}
		});
	});

main_router.route('/api/places_text_search')
	.all(function(req,res){
		var text_query = req.query.text,
		searchURL = req.originalUrl;

		cache.cacheRequest(searchURL,function(isCached,result){

		});
	});

main_router.route('/api/foursquare/categories')
	.all(function(req,res){
		FoursquareVenuesAdapter.categories(function(err,results){
			if (err) {
				res.send({"error":true});
			}else{
				res.send(results);
			}
		});
	});

main_router.route('/api/foursquare/custom_categories')
	.all(function(req,res){
		FoursquareVenuesAdapter.custom_categories(function(err,results){
			if (err) {
				res.send({"error":true});
			}else{
				res.send(results);
			}
		});
	});

main_router.route('/api/data/sg_area_topo')
	.all(function(req,res){
		sg_area_topo = StaticSpatial.sg_region_topo();
		res.send(sg_area_topo);
	});

main_router.route('/api/data/planning_regions')
	.all(function(req,res){
		planning_regions_geojson = StaticSpatial.planning_regions();
		res.send(planning_regions_geojson);
	});

main_router.route('/api/data/mrt')
	.all(function(req,res){
		mrt_geojson = StaticSpatial.sg_mrt_geo();
		res.send(mrt_geojson);
	});

main_router.route('/api/iron/get')
	.all(function(req,res){
		cache.get(req.query.key,function(err,response){
			if (err) {
				res.send({"error":err});
			}else{
				res.send(response);
			}
		});
	});

//main_router.route()
//.all(); 

app.use('/', main_router);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

function _restrict(req, res, next, targetLocale) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  if (req.session.user) {
    next(req.session.user);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    req.session.error = 'Access denied!';
    req.flash('target_locale',targetLocale);
    res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
}

function _extractEmailUsername(str){
	var nameMatch = str.match(/^([^@]*)@/),
	name = nameMatch ? nameMatch[1] : null;
	if (str.indexOf('@gtempaccount.com')!=-1){
		var tempUsername = name.split('@gtempaccount.com')[0];
		var subTempUsername = tempUsername.split('%')[0];
		return subTempUsername;
	}
	return name;
}