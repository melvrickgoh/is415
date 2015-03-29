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
pgDAO = require('./server/dao/index'),
serviceMaster = require('./services/ServiceMaster');

var dotenv = require('dotenv');
dotenv.load();

var daoMaster = require('./server/dao/DAOMaster');
var DAOMaster = new daoMaster();
var GoogleUsersDAO = DAOMaster.GoogleUsersDAO;
var S3FilesDAO = DAOMaster.S3FilesDAO;

var ServiceMaster = new serviceMaster();
var StaticSpatial = ServiceMaster.StaticSpatial;
var GoogleAPIs = ServiceMaster.GoogleAPIs;
var GooglePlacesAdapter = ServiceMaster.GooglePlacesAdapter;
var cache = ServiceMaster.IronCache;
var FoursquareVenuesAdapter = ServiceMaster.FoursquareVenuesAdapter;
var UUIDGenerator = ServiceMaster.UUIDGenerator;
var S3 = ServiceMaster.S3;
var SessionServices = ServiceMaster.SessionServices;

var CMaster = require('./server/controller/ControlMaster'),
ControlMaster = new CMaster({
	GoogleUsersDAO: 	GoogleUsersDAO,
	S3FilesDAO: 			S3FilesDAO,
	S3Services: 			S3,
	UUIDGenerator: 		UUIDGenerator,
	GoogleAPIs: 			GoogleAPIs,
	GooglePlacesAdapter: GooglePlacesAdapter,
	FoursquareVenuesAdapter: FoursquareVenuesAdapter
});
var uController = ControlMaster.UserController;
var geoUploadController = ControlMaster.GeoUploadController;
var PlacesController = ControlMaster.PlacesController;

var User = require('./server/entity/user'),
File = require('./server/entity/file');

var SQUARE_FOOT_KEY = process.env.SQUARE_FOOT_KEY;

//upload start
var multer      =    require('multer');
var app         =    express();
var bodyParser = require('body-parser');
var multer = require('multer');         
var fs = require("fs");

// these statements config express to use these modules, and only need to be run once
app.use(bodyParser.json());         
app.use(bodyParser.urlencoded({ extended: true }));          
app.use(multer());

// set up your routes                                    

app.post('/upload/geoJSON', function(req, res) {
	console.log(req.body);
    console.log(req.files.geojson);
	console.log(req.files.geojson.path);
	var geojsonType = req.body.mySelect;
	var tmp_path = req.files.geojson.path;
	// set where the file should actually exists - in this case it is in the "images" directory
	if (geojsonType == 'point'){
		//read data and display
		
	} else if (geojsonType == 'polygon'){
		//upload to google drive
		GeoUploadController.prototype.uploadToS3 = function(fileData,userGoogleID,callback)
		
	}
	
	/**
    var target_path = './public/uploads/' + req.files.geojson.name;
	// move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.geojson.size + ' bytes');
        });
	});
	**/
	
});                                     

app.listen(3000,function(){
    console.log("Working on port 3000");
});                     

module.exports = app;  

/**
var fileupload = require('fileupload').createFileUpload('/uploadDir').middleware


app.post('/upload/geoJSON',fileupload, function(req, res) {
    console.log(req.query);
	console.log(req.body);
	console.log(req.body.mySelect);
    console.log(req.files.geojson);
	
	 var tmp_path = req.files.geojson.path;
    
	// set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/uploads/' + req.files.geojson.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.geojson.size + ' bytes');
        });
	});
	
	backURL=req.header('Referer') || '/';
	//console.log(req.files.fileUploaded.name.split("."));
	var filename=req.files.fileUploaded.name.split(".");
	backURL.concat(filename[0]);
	console.log("backURL: "+backURL+", filename: "+filename[0]);
	
	
	var oldURL = backURL;
	var index = 0;
	var newURL = oldURL;
	index = oldURL.indexOf('?');
	if(index == -1){
		index = oldURL.indexOf('#');
	}
	if(index != -1){
		newURL = oldURL.substring(0, index);
	}
	
	res.redirect(newURL+'?userfilepresent=true&userfile='+filename[0]);
});

	**/
	
	//Unverified code
	
	/**
	
	GeoUploadController.prototype.uploadToS3();
	
	var StaticData = require('/public/uploads/'+filename[0]+'.js');
	console.log('LOOKING AT: /public/uploads/'+filename[0]+'.js');
	var StaticSpatialUploaded = new StaticData();
	
	main_router.route('/api/data/user_uploaded')
	.all(function(req,res){
		user_uploaded = StaticSpatial.filename();
		res.send(user_uploaded);
		});
	**/
	// end unverified code
 

//upload end




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
		files = [],
		data_spreadsheets = [];

		GoogleAPIs.getUserAndDriveProfile(code,function(resultType,err,results,tokens,oauth2Client,client) {
      if (err) {
        console.log('An error occured', err);
        return;
      }else{
      	switch(resultType){
      		case 'profile':
      			SessionServices.loadUser(results,loggedInUser,tokens,oauth2Client,client);
      			break;
      		case 'folder':
      			loggedInUser.spreadsheetsFolder = results;
      			break;
      		case 'drive':
      			SessionServices.loadFiles(files,results.items);
      			break;
      		default:
      			break;
      	}
      	returnCounter++;

      	if (returnCounter == 3){//assign to the user the files at the end of the second callback
      		loggedInUser.files = files;

      		SessionServices.loadSpreadsheets(files,data_spreadsheets,loggedInUser.spreadsheetsFolder.id);

      		loggedInUser.data_spreadsheets = data_spreadsheets;
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
      					break;
      				case 'Insert User':
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

main_router.route('/api/user/spreadsheets_meta')
	.all(function(req,res){
		_restrict(req,res,function(user){
			res.json(req.session.user.data_spreadsheets);
		},'/api/user/spreadsheets_meta');
	});

main_router.route('/api/user/refresh_drive_profile')
	.all(function(req,res){
		_restrict(req,res,function(user){
			var returnCounter = 0,
				loggedInUser = req.session.user,
				files = [],
				data_spreadsheets = [];

			GoogleAPIs.refreshDriveProfile(req.session.authorization['tokens'],function(resultType,err,results,tokens,oauth2Client,client){
				//reacquiring user files and spreadsheets info

				if (err) {
	        console.log('An error occured', err);
	        return;
	      }else{
	      	switch(resultType){
	      		case 'folder':
	      			loggedInUser.spreadsheetsFolder = results;
	      			break;
	      		case 'drive':
	      			SessionServices.loadFiles(files,results.items);
	      			break;
	      		default:
	      			break;
	      	}
	      	returnCounter++;

	      	if (returnCounter == 2){//assign to the user the files at the end of the second callback
	      		loggedInUser.files = files;

	      		SessionServices.loadSpreadsheets(files,data_spreadsheets,loggedInUser.spreadsheetsFolder.id);

	      		loggedInUser.data_spreadsheets = data_spreadsheets;
	      		req.session.user = loggedInUser; //set the session to that of this user
	      		req.flash('user',loggedInUser);

	      		var authorization = req.session.authorization;
					  if (!authorization) {
					    authorization = req.session.authorization = {}
					  }
					  req.session.authorization['tokens'] = tokens;
					  req.session.authorization['authClient'] = oauth2Client;
					  req.session.authorization['client'] = loggedInUser.client;

	      		res.json(loggedInUser); //return user json data
	      	}
	      }
			});
		},'/api/user/refresh_drive_profile');
	});

main_router.route('/autosuggest/places')
	.all(function(req,res){
		res.send(GoogleAPIs.autosuggestPlaces());
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

main_router.route('/api/foursquare/venues_search')
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

main_router.route('/api/foursquare/text_search')
	.all(function(req,res){
		var venue_term = req.query.search,
		searchURL = req.originalUrl;
		//check cache for results
		cache.cacheRequest(searchURL,function(isCached,result){
			if (isCached) {		//is cached: use cache result
				console.log(result)
				console.log(result.value);
				res.send(result);
			}else{						//not cached so find more
				PlacesController.textSearchVenues(venue_term,function(err,response){
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

main_router.route('/api/spreadsheet/load')
	.all(function(req,res){
		var sheetId = req.query.id,
		userTokens = req.session.authorization['tokens'];
		
		GoogleAPIs.Spreadsheets.load(sheetId,userTokens,function(isSuccess,spreadsheet){
			if (isSuccess) {
				res.json(spreadsheet);
			}else{
				res.json({
					error: true,
					err: spreadsheet
				});
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
/**
main_router.route('/api/data/mrt')
	.all(function(req,res){
		mrt_geojson = StaticSpatial.sg_mrt_geo();
		res.send(mrt_geojson);
	});
**/
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