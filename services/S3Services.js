var S3 = require('s3');
const fs = require('fs');

var client = S3.createClient({
  s3Options: {
    accessKeyId: process.env.AWS_S3_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET
    // any other options are passed to new AWS.S3() 
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property 
  },
});

var bucket = process.env.AWS_S3_BUCKET_NAME;

function S3Services(){}

S3Services.prototype.constructor = S3Services;

S3Services.prototype.endpoint = process.env.AWS_S3_ENDPOINT;

//on err: callback(false,errorMessage, errorStack);
//on success: callback(true,publicURL); #publicURL is for AJAX calling of data;
S3Services.prototype.upload = function(uuid,filename,callback){
	var params = {
	  localFile: "uploads/"+filename,
	 
	  s3Params: {
	    Bucket: bucket,
	    Key: uuid+".json",
	    ACL: "public-read"
	    // other options supported by putObject, except Body and ContentLength. 
	    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property 
	  },
	};
	var uploader = client.uploadFile(params);
	uploader.on('error', function(err) {
	  //console.error("unable to upload:", err.stack);
	  callback(false,'unable to upload to S3',err);
	});
	uploader.on('progress', function() {
	  console.log("progress", uploader.progressMd5Amount,
	            uploader.progressAmount, uploader.progressTotal);
	});
	uploader.on('end', function() {

		//full filepath needed

	  //console.log("done uploading");
	//  fs.unlink(filePath, function (err) {
	//  if (err) { callback(false,err); }
	//	  callback(true,'File deleted successfully: ' + localFile);
	//	});
	  callback(true,"https://s3-ap-southeast-1.amazonaws.com/spatia/"+uuid+".json");
	});
}

S3Services.prototype.publicURL = function(key){
	return S3.getPublicUrlHttp(bucket, key);
}

function _publicURL(key){
	return S3.getPublicUrlHttp(bucket, key);
}

S3 = S3Services;

module.exports = S3Services;
