var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.PG_DB_URL});

var TABLENAME = 'amazonfiles',
	ID = 'id',
	GOOGLE_ID = "googleuserid",
	LAYER_TITLE = "uploadtitle",
	LAYER_FILE_NAME = "uploadfilename",
	LAYER_TYPE = "geotype",
	AMAZON_ID = "amazonid";

function S3FilesDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

/* File format
{
	layerTitle
	layerFileName
	id
	googleUserID
	amazonID
}
*/
S3FilesDAO.prototype.updateFileRecord = function(file,callback){
	var updateRecordDetails = {
		name:TABLENAME,
		values:[{
			name:LAYER_TITLE,
			type:'string',
			value:file.layerTitle
		},{
			name:LAYER_FILE_NAME,
			type:'string',
			value:file.layerFileName
		},{
			name:LAYER_TYPE,
			type:'string',
			value:file.layerType
		}],
		conditions:[AMAZON_ID + ' = \'' + file.amazonID + '\'']
	}
	dao.update(updateRecordDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

S3FilesDAO.prototype.insertNewFileRecord = function(file,callback){
	this.insertNewFileRecords([file],callback);
}

S3FilesDAO.prototype.insertNewFileRecords = function(files,callback){
	var fileExtracts = this.extractFileRecordsDetails(files);
	var newFilesDetails = {
		name:TABLENAME,
		attributes:[{name:GOOGLE_ID,type:'string'},{name:LAYER_TITLE,type:'string'},{name:LAYER_FILE_NAME,type:'string'},
		{name:LAYER_TYPE,type:'string'},{name:AMAZON_ID,type:'string'}],
		values:fileExtracts
	};
	dao.insert(newFilesDetails,function(isSuccess,result){
		callback(isSuccess,result);
	});
}

S3FilesDAO.prototype.extractFileRecordsDetails = function(files){
	var extract = [];
	for (var i in files){
		var file = files[i];
		extract.push({
			"googleuserid":file.googleUserID,
			"uploadtitle":file.layerTitle,
			"uploadfilename":file.layerFileName,
			"amazonid":file.amazonID,
			"geotype":file.layerType
		});
	}
	return extract;
}

S3FilesDAO.prototype.getAllFileRecords = function(callback){
	var selectRecordDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,GOOGLE_ID,LAYER_TITLE,LAYER_FILE_NAME,AMAZON_ID,LAYER_TYPE]
	};
	dao.select(selectRecordDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

S3FilesDAO.prototype.getUserFileRecords = function(googleUserID,callback){
	var selectUserDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,GOOGLE_ID,LAYER_TITLE,LAYER_FILE_NAME,AMAZON_ID,LAYER_TYPE],
		conditions:[GOOGLE_ID + ' = \''+ googleUserID +'\'']
	};
	dao.select(selectUserDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

module.exports = S3FilesDAO;