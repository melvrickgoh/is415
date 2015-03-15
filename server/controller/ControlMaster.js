const dotenv = require('dotenv');
dotenv.load();

var UserController = require('./UserController'),
GeoUpController = require('./GeoUploadController'),
places_controller = require('./places_controller');

function ControlMaster(options){
	if(options){
		this.UserController = new UserController({ GoogleUsersDAO: options.GoogleUsersDAO });
		this.GeoUploadController = new GeoUpController({ 
			S3FilesDAO: options.S3FilesDAO,
			S3Services: options.S3Services,
			UUIDGenerator: options.UUIDGenerator
		});
		this.PlacesController = new places_controller(
			options.GoogleAPIs,
			options.GooglePlacesAdapter,
			options.FoursquareVenuesAdapter
		);
	}
}

ControlMaster.prototype.constructor = ControlMaster;

ControlMaster.prototype.UserController = undefined;

ControlMaster.prototype.GeoUploadController = undefined;

ControlMaster.prototype.PlacesController = undefined;

module.exports = ControlMaster;