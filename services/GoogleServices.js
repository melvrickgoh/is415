PLACES_TYPES = ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo']
SERVICE_CERTIFICATE = process.env.SERVICE_CERTIFICATE;
SERVICE_KEY_FILE = process.env.GOOGLE_SERVICE_KEY_LOCALE;

SERVICE_CLIENT_KEY = process.env.GOOGLE_CLIENT_KEY;
SERVICE_ID = process.env.SERVICE_CLIENT_ID;
SERVICE_EMAIL = process.env.SERVICE_CLIENT_EMAIL;

var googleapis = require("googleapis"),
GoogleSpreadsheets = require("google-spreadsheets"),
EditSpreadsheet = require("edit-google-spreadsheet");
var OAuth2Client = googleapis.OAuth2Client;
var CLIENT_ID = process.env.GOOGLE_BROWSER_CLIENT_ID;
var CLIENT_SECRET = process.env.GOOGLE_BROWSER_CLIENT_SECRET;

//For Client Side logging in
var OAuth2 = googleapis.auth.OAuth2;

var REDIRECT_URL = _determineGoogleCallbackType();

var CLIENT_DEFAULT_TOOLKIT_FOLDER_NAME = "spatia/files"

function GoogleServices(options){}

GoogleServices.prototype.constructor = GoogleServices;

GoogleServices.prototype.login = function(response){
	// generates a url that allows offline access and asks permissions
	// for Google+ scope.
	var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	var scopes = [
		'https://www.googleapis.com/auth/plus.login',
	  'https://www.googleapis.com/auth/plus.me',
	  'https://www.googleapis.com/auth/plus.profile.emails.read',
	 	'https://www.googleapis.com/auth/calendar',
	 	'https://www.googleapis.com/auth/drive'
	];

	var url = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: scopes.join(" ") // space delimited string of scopes
	});

	googleapis.drive('v2');
	googleapis.plus('v1');
	googleapis.oauth2('v2');
	
	response.writeHead(302, {location: url});
  response.end();
}

GoogleServices.prototype.loginCallback = function(code,response){
	this.getAccessToken(code,function(tokens){
		response.send(JSON.stringify(tokens));
	});
}

GoogleServices.prototype.getAccessToken =function(code, callback) {
  // request access token
	var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	oauth2Client.getToken(code, function(err, tokens) {
    oauth2Client.setCredentials(tokens);
    callback(oauth2Client);
  });
}

GoogleServices.prototype.getUserProfile = function(code,callback){
  getAccessToken(code,function(oauth2Client,tokens){
  	_executeCommand(oauth2Client,function(client,oauth2Client){
  		_getUserProfile(client,oauth2Client,'me',function(err,results){callback('profile',err,results,tokens,oauth2Client);});
  	});
  });
}

GoogleServices.prototype.getDriveProfile = function(code,callback){
	getAccessToken(code,function(oauth2Client,tokens){
	  	_executeCommand(oauth2Client,function(client,oauth2Client){
	  		_getDriveProfile(client,oauth2Client,'me',function(err,results){callback('drive',err,results,tokens,oauth2Client);});
	  	});
	});
}

GoogleServices.prototype.getUserAndDriveProfile = function(code,callback){
	var self = this;
	getAccessToken(code,function(oauth2Client,tokens){
  	_executeCommand(oauth2Client,function(client,oauth2Client){
  		_getUserProfile(client,oauth2Client,'me',function(err,results){
  			callback('profile',err,results,tokens,oauth2Client,client);

  		});
  				
  		_getDriveProfile(client,oauth2Client,'me',function(err,results){callback('drive',err,results,tokens,oauth2Client)});
  		_getClientFolders(client,oauth2Client,'me',function(err,results){
  			_processAndCheckSpatialToolkitFolder(results,callback,client,oauth2Client,tokens);
  		});
		});
	});
}

GoogleServices.prototype.refreshDriveProfile = function(tokens,callback){
	var oauth2Client = _renewClientOAuth2(tokens);
	_executeCommand(oauth2Client,function(client,oauth2Client){			
		_getDriveProfile(client,oauth2Client,'me',function(err,results){callback('drive',err,results,tokens,oauth2Client)});
		_getClientFolders(client,oauth2Client,'me',function(err,results){
			_processAndCheckSpatialToolkitFolder(results,callback,client,oauth2Client,tokens);
		});
	});
}

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

/* IMPORTANT - for Classing Spreadsheet Methods */
GoogleServices.prototype.Spreadsheets = {};

GoogleServices.prototype.Spreadsheets.load = function(sheetId,tokens,callback){
	GoogleSpreadsheets({
    key: sheetId,
    auth: _renewClientOAuth2(tokens)
  }, function(err, spreadsheets) {
	  if (err) { callback(false,err) }
	  else {
	  	_spreadsheetsAggregateData(spreadsheets,function(worksheetsResponse){
	  		callback(true,{
		  		title: spreadsheets.title,
		  		worksheets: worksheetsResponse
		  	});
	  	});
	  }
  });
}

GoogleServices.prototype.Spreadsheets.edit = function(sheetId,worksheetId,tokens,callback){
	console.log(tokens);
	console.log(sheetId);
	console.log(worksheetId);

	EditSpreadsheet.load({
		debug: true,
    spreadsheetId: sheetId,
    worksheetName: worksheetId,
    accessToken: {
      type: 'Bearer',
      token: tokens['access_token']
    }
	}, function sheetReady(err, spreadsheet) {
	  if(err) callback(false,err);
	  console.log(spreadsheet);
	  var worksheets = spreadsheet.raw['worksheets'];
	  for (var i in worksheets) {
	  	var w = worksheets[i];
	  }
	  spreadsheet.receive(function(err, rows, info) {
      if (err) {
        throw err;
      }
      console.dir(rows);
      console.dir(info);
    });
	});
}

GoogleServices.prototype.Spreadsheets.save = function(sheetId,worksheetName,data,tokens,callback){
	EditSpreadsheet.load({
		debug: true,
    spreadsheetId: sheetId,
    worksheetName: worksheetName,
    accessToken: {
      type: 'Bearer',
      token: tokens['access_token']
    }
	}, function sheetReady(err, spreadsheet) {
	  if(err) callback(false,err);

	  if (spreadsheet == null || spreadsheet == undefined) {
	  	callback(false,"Spreadsheet not found! Try entering the title again or create a fresh sheet.");
	  } else {
		  spreadsheet.receive(function(err, rows, info) {
	      if (err) {
	        throw err;
	      }
	      if (info.totalRows > 0) {
	      	callback(false,"This spreadsheet isn't empty. Please create another sheet and try again.");
	      }else{
	      	var savePackage = _generateSpreadsheetDataPackage(data);
	      	
	      	spreadsheet.add(savePackage);
	      	spreadsheet.send(function(err){
	      		if(err) throw err;
      			callback(true,"Spreadsheet successfully updated");
	      	});
	      	
	      }
	    });
	  }

	});
}

function _generateSpreadsheetDataPackage(data){
	var dataKeys = Object.keys(data),
	first = data[dataKeys[0]];

	var dataPackage = {
		1:_generateSpreadsheetHeader()
	};
	//generate file
	for (var i = 0; i<dataKeys.length; i++) {
		var key = dataKeys[i],
		payload = data[key];
		dataPackage[i+2] = _generateSpreadsheetPayload(payload);
	}

	return dataPackage;
}

function _generateSpreadsheetPayload(payload){
	var attrs = Object.keys(payload),
	packageS = {}
	headers = ['name','formatted_address','type','rating','checkinsCount','tipsCount','usersCount','icon','lat','lng','place_id','id','contact'];

	for (var i = 0; i<headers.length; i++) {
		var header = headers[i],
		payloadValue = payload[header];

		switch(header){
			case 'rating':
			case 'checkinsCount':
			case 'tipsCount':
			case 'usersCount':
				packageS[i+1] = payloadValue || 0;
				break;
			default:
				packageS[i+1] = payloadValue || '';
		}
	}
	return packageS;
}

function _generateSpreadsheetHeader(){
	var headers = ['name','formatted_address','type','rating','checkinsCount','tipsCount','usersCount','icon','lat','lng','place_id','id','contact'];
	var headerload = {};
	for (var i = 0; i<headers.length; i++) {
		headerload[i+1] = headers[i];
	}
	return headerload;
}

/*
* aggregate point data content
*/
function _spreadsheetsAggregateData(spreadsheet,callback){
	var worksheets = spreadsheet.worksheets,
	worksheetsResponse = {};
	
	for (var i in worksheets){
		var worksheet = worksheets[i];
		console.log(worksheet);
		worksheetsResponse[worksheet.id] = {
			id: worksheet.id,
			title: worksheet.title
		}
		worksheet.cells({},function(err,cells){
			worksheetsResponse[worksheet.id]['cells'] = _parsePointData(cells['cells']);

			if (i == worksheets.length-1){
				callback(worksheetsResponse);
			}
		});
	}
}
/*
*	parse cell info into coordinates + title & other attributes
*/
function _parsePointData(cells){
	var pointDataResponse = [],
	attributes = {},
	latKey = undefined,
	lonKey = undefined;

	var getTitles = function(row1){
		var keys = Object.keys(row1);
		for (var i in keys) {
			var rowValues = row1[keys[i]],
			rowContent = rowValues['value'].trim().toLowerCase();

			attributes[rowValues['col']] = rowValues['value'];
			if ( rowContent == 'latitude' || rowContent == 'lat' ) {
				latKey = rowValues['col'];
			}else if (rowContent == 'longitude' || rowContent == 'lon' ) {
				lonKey = rowValues['col'];
			}
		}
	}

	getTitles(cells['1']);

	var rows = Object.keys(cells);
	for (var i = 2; i<=rows.length; i++) {
		var row = cells[i+''],
		columnKeys = Object.keys(row),
		packageResult = {};

		for (var j in columnKeys) {
			var cellValue = row[columnKeys[j]];

			if (cellValue['col'] == latKey) {
				packageResult['lat'] = parseFloat(cellValue['value']);
			}else if (cellValue['col'] == lonKey) {
				packageResult['lon'] = parseFloat(cellValue['value']);
			}else{
				packageResult[attributes[cellValue['col']]] = cellValue['value'];
			}
		}
		pointDataResponse.push(packageResult);
	}

	return pointDataResponse;
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

function _processAndCheckSpatialToolkitFolder(results,callback,client,oauth2Client,tokens){
	var folderObjs = results.items;
	var folder;
	for (var i in folderObjs) {
		folder = folderObjs[i];

		if (folder.mimeType == 'application/vnd.google-apps.folder' && folder.title == CLIENT_DEFAULT_TOOLKIT_FOLDER_NAME){
			callback('folder',undefined,folder,tokens,oauth2Client);
			return;
		}
	}
	_createClientSpatialToolkitFolder(client,oauth2Client,'me',function(err,results){
		callback('folder',err,results,tokens,oauth2Client);
	});
}

function _processSpatialToolkitSpreadsheets(results,callback,client,oauth2Client,tokens){

}

function _getSpatialToolkitSpreadsheets(client, authClient, userId, callback){
	
}

function _createClientSpatialToolkitFolder(client, authClient, userId, callback){
	client.drive.files.insert({
		resource:{
			"mimeType":"application/vnd.google-apps.folder",
			"title":CLIENT_DEFAULT_TOOLKIT_FOLDER_NAME
		},
		media:{
			"writersCanShare":true
		},
		auth: authClient
	}, callback);
}

function _getUserProfile(client, authClient, userId, callback){
    client.plus.people.get({ userId: userId, auth: authClient }, callback);
}

function _getDriveProfile(client, authClient, userId, callback){
	client.drive.files.list({ auth: authClient }, callback);
}

function _renewClientOAuth2(tokens){
	var OAuth2 = googleapis.auth.OAuth2;
	oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	oauth2Client.setCredentials(tokens);
	return oauth2Client;
}

function _getClientFolders(client, authClient, userId, callback){
	client.drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder'",
    auth: authClient
  },callback);
}

function _executeCommand(oauth2Client,callback){
	callback({
		drive: 	googleapis.drive('v2'),
		plus: 	googleapis.plus('v1'),
		oauth: 	googleapis.oauth2('v2')
	},oauth2Client);
}

function getAccessToken(code, callback) {
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    // request access token
  	oauth2Client.getToken(code, function(err, tokens) {
  		if (err) {
	      console.log('An error occured', err);
	      return;
		}
  	    // set tokens to the client
   	 	// TODO: tokens should be set by OAuth2 client.
   	 	oauth2Client.setCredentials(tokens);

   		callback(oauth2Client,tokens);
 	});
}

function _determineGoogleCallbackType(){
	switch (process.env.DEPLOYMENT_TYPE) {
		case "staging":
			return "http://geospatial-melvrick.herokuapp.com/oauth2callback";
		case "production":
			return "http://spatia.herokuapp.com/oauth2callback";
		default:
			return "http://localhost:5000/oauth2callback"
	}
}

module.exports = GoogleServices;
