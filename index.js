var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var StaticData = require('./server/static_data');
var StaticSpatial = new StaticData();

app.set('views', 'views');  // Specify the folder to find templates
app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser()); 
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/squarefoot', function(request, response) {
	console.log(process.env.SQUARE_FOOT_KEY)
  response.send(process.env.SQUARE_FOOT_KEY);
});

app.get('/maps',function(req,res){
	res.render('map', { message: 'Congrats, you just set up your app!' });
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

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
