var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var StaticData = require('./server/static_data');
var StaticSpatial = new StaticData();

var GoogleServices = require('./services/GoogleServices');
var GoogleAPIs = new GoogleServices();

var Google_Places_Interface = require('./services/GooglePlaces');
var GooglePlacesAdapter = new Google_Places_Interface();

var IronCache = require('./services/IronCache');
var cache = new IronCache();

//Controllers
var places_controller = require('./server/places_controller');
var PlacesController = new places_controller(GoogleAPIs,GooglePlacesAdapter);

var SQUARE_FOOT_KEY = process.env.SQUARE_FOOT_KEY || '0qhambsf43d7ouwx6c95jezlitk1r2vn';

app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser()); 
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/squarefoot', function(req, res) {
	res.render('squarefoot', { message: 'Congrats, you just set up your app!' });
});

app.get('/maps',function(req,res){
	res.render('map', { message: 'Congrats, you just set up your app!' });
});

app.get('/autosuggest/places',function(req,res){
	res.send(GoogleAPIs.autosuggestPlaces());
});

app.get('/api/places_search',function(req,res){
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

app.get('/api/data/sg_area_topo',function(req,res){
	sg_area_topo = StaticSpatial.sg_region_topo();
	console.log(sg_area_topo.objects.type);
	console.log(sg_area_topo.objects.MP14_REGION_WEB_PL.geometries.length);
	res.send(sg_area_topo);
});

app.get('/api/data/planning_regions',function(req,res){
	planning_regions_geojson = StaticSpatial.planning_regions();
	res.send(planning_regions_geojson);
});

app.get('/api/data/mrt',function(req,res){
	mrt_geojson = StaticSpatial.sg_mrt_geo();
	res.send(mrt_geojson);
});

app.get('/api/iron/get',function(req,res){
	cache.get(req.query.key,function(err,response){
		if (err) {
			res.send({"error":err});
		}else{
			res.send(response);
		}
	});
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
