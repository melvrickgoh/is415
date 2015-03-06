var GoogleUsersDAO = require('../dao/GoogleUsersDAO');
var dao;

var User = require('../entity/user');

function UserController(options){
	if(options){
		dao = new GoogleUsersDAO({pgURL:options.pgURL});
	}
}

UserController.prototype.processGoogleLogin = function(user,callback){
	//If user exists, update the logtime, else insert new user into db
	console.log(user.id);
	console.log(user.ocrFolder);
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

module.exports = UserController;