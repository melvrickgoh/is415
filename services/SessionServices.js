var File = require('../server/entity/file');

function SessionServices(){}

SessionServices.prototype.constructor = SessionServices;

SessionServices.prototype.loadUser = function(results,loggedInUser,tokens,oauth2Client,client){
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

	return loggedInUser;
}

SessionServices.prototype.loadSpreadsheets = function(files,spreadsheets,dataFolderId){
	for (var i in files) {
		file = files[i];
		if (file.parents && file.parents[0]  && file.parents[0]['id'] == dataFolderId){
			spreadsheets.push(file);
		}
	}
	return spreadsheets;
}

SessionServices.prototype.loadFiles = function(files,results){
	for (var i in results){
		var fileObj = results[i];
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
	return files;
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

module.exports = SessionServices;