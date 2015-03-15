var dao, S3FilesDAO, S3Services;

var User = require('../entity/user');

function UserController(options){
	if(options){
		dao = options.GoogleUsersDAO;
	}
}

UserController.prototype.processGoogleLogin = function(user,callback){
	//If user exists, update the logtime, else insert new user into db
	dao.checkUserExists(user,function(exists){
		console.log('user exists > ' + exists);
		if (exists){
			dao.updateUser(user,function(updated,result){
				callback('Update User',updated,result);//to be updated on the dao being updated
			});
			return;
		}else{
			dao.insertNewUser(user,function(isSuccess,result){
				callback('Insert User',isSuccess,result);//to be updated on the dao being updated
			});
			return;
		}
	});
}

UserController.prototype.retrieveAWSGeoData = function(user,callback){
	var endpoint = S3Services.endpoint;
	S3FilesDAO.getUserFileRecords(user.id,function(isSuccess,results){
		if (isSuccess) {
			callback(true,results);
		}else{
			callback(false);
		}
	});
}

module.exports = UserController;