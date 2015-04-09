var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.PG_DB_URL});

var TABLENAME = 'rprocess',
	ID = 'id',
	USERID = "userid",
	UUID = "uuid",
	RESPONSE = "response",
	STATUS = "status",
	LAT = "lat",
	LNG = "lng",
	WEIGHT = "weight";

function RDAO(options){
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
RDAO.prototype.initPayload = function(userid,data,callback){
	var locationData = data.data,
	locationFileID = data.id;

	this.checkIfRProcessTypeExists(locationFileID,userid,function(isExists,isExistsResults){
		if (isExists) {
			console.log("Data payload already exists");
			callback(isExists,{message:"Data payload already exists",payload:data,userid:userid,uuid:locationFileID});
		}else{
			var dataArray = _rdataframe(locationFileID,userid,'checkinsCount',locationData);
			_insertNewRProcesses(dataArray,userid,locationFileID,callback);
		}
	});
}

function _rdataframe(fileid,userid,weightCode,payload){
	var payloadKeys = Object.keys(payload),
	rPayload = [];
	for (var i in payloadKeys){
		var key = payloadKeys[i],
		payloadInfo = payload[key];
		if (payloadInfo.lat && payloadInfo.lng) {
			rPayload.push({
				'lat': payloadInfo.lat,
				'lng': payloadInfo.lng,
				'uuid': fileid,
				'userid': userid,
				'weight': payloadInfo[weightCode]
			});
		}
		
	}
	return rPayload;
}

RDAO.prototype.checkIfRProcessTypeExists = function(uuid,userid,callback){
	var selectUserDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,UUID,USERID,RESPONSE,STATUS,LAT,LNG,WEIGHT],
		conditions:[UUID + ' = \''+ uuid +'\'',USERID + " = '" + userid + "'"]
	};
	dao.select(selectUserDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

RDAO.prototype.updateRProcess = function(rprocess,callback){
	var updateRecordDetails = {
		name:TABLENAME,
		values:[{
			name:LAT,
			type:'float',
			value:rprocess.lat
		}],
		conditions:[UUID + ' = \'' + rprocess.uuid + '\'']
	}
	dao.update(updateRecordDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

function _insertNewRProcesses(rprocesses,userid,uuid,callback){
	var rExtracts = extractRProcessesDetails(rprocesses);
	var newRProcDetails = {
		name:TABLENAME,
		attributes:[{name:USERID,type:'string'},{name:UUID,type:'string'},{name:STATUS,type:'string'},
			{name:LAT,type:'float'},{name:LNG,type:'float'},{name:WEIGHT,type:'float'}],
		values:rExtracts
	};
	dao.insert(newRProcDetails,function(isSuccess,result){
		callback(isSuccess,{message:"New data payload inserted", payload:result, userid:userid, uuid:uuid});
	});
}

RDAO.prototype.insertNewRProcesses = function(rprocesses,userid,uuid,callback){
	var rExtracts = this.extractRProcessesDetails(rprocesses);
	var newRProcDetails = {
		name:TABLENAME,
		attributes:[{name:USERID,type:'string'},{name:UUID,type:'string'},{name:STATUS,type:'string'},
			{name:LAT,type:'float'},{name:LNG,type:'float'},{name:WEIGHT,type:'float'}],
		values:rExtracts
	};
	dao.insert(newRProcDetails,function(isSuccess,result){
		callback(isSuccess,{message:"New data payload inserted", payload:result, userid:userid, uuid:uuid});
	});
}

function extractRProcessesDetails(rprocesses){
	var extract = [];
	for (var i in rprocesses){
		var rprocess = rprocesses[i];
		extract.push({
			"uuid":rprocess.uuid,
			"userid":rprocess.userid,
			"lat":rprocess.lat,
			"lng":rprocess.lng,
			"weight":rprocess.weight,
			"status":"init"
		});
	}
	return extract;
}

RDAO.prototype.extractRProcessesDetails = function(rprocesses){
	var extract = [];
	for (var i in rprocesses){
		var rprocess = rprocesses[i];
		extract.push({
			"uuid":rprocess.uuid,
			"userid":rprocess.userid,
			"lat":rprocess.lat,
			"lng":rprocess.lng,
			"weight":rprocess.weight,
			"status":"init"
		});
	}
	return extract;
}

RDAO.prototype.getAllRProcesses = function(callback){
	var selectRecordDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,UUID,USERID,RESPONSE,STATUS,LAT,LNG,WEIGHT]
	};
	dao.select(selectRecordDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

RDAO.prototype.getRProc = function(uuid,callback){
	var selectUserDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,UUID,USERID,RESPONSE,STATUS,LAT,LNG,WEIGHT],
		conditions:[UUID + ' = \''+ uuid +'\'']
	};
	dao.select(selectUserDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

module.exports = RDAO;