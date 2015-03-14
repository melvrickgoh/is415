var dotenv = require('dotenv');
dotenv.load();

var StaticData = require('../server/static_data');
var StaticSpatial = new StaticData();

var GoogleServices = require('./GoogleServices');
var GoogleAPIs = new GoogleServices();

var Google_Places_Interface = require('./GooglePlaces');
var GooglePlacesAdapter = new Google_Places_Interface();

var IronCache = require('./IronCache');
var cache = new IronCache();

var Foursquare_Venues_Interface = require('./FoursquareVenues');
var FoursquareVenuesAdapter = new Foursquare_Venues_Interface();

var UUIDGeneratorService = require('./UUIDGenerator');
var UUIDGenerator = new UUIDGeneratorService();

var S3Services = require('./S3Services');
var S3 = new S3Services();

function ServiceMaster(){}

ServiceMaster.prototype.constructor = ServiceMaster;

ServiceMaster.prototype.S3 = S3;
ServiceMaster.prototype.UUIDGenerator = UUIDGenerator;
ServiceMaster.prototype.FoursquareVenuesAdapter = FoursquareVenuesAdapter;
ServiceMaster.prototype.IronCache = cache;
ServiceMaster.prototype.GooglePlacesAdapter = GooglePlacesAdapter;
ServiceMaster.prototype.GoogleAPIs = GoogleAPIs;
ServiceMaster.prototype.StaticSpatial = StaticSpatial;

module.exports = ServiceMaster;
