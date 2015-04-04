var s3DAO, s3Services, uuidGenerator;

function GeoUploadController(options){
	if(options){
		s3DAO = options.S3FilesDAO,
		s3Services = options.S3Services,
		uuidGenerator = options.UUIDGenerator;
	}
}

//POLYLINE_CONTROLLER.add('mrt_network','MRT Network',mrt_layer);

GeoUploadController.prototype.uploadToS3 = function(fileData,userGoogleID,callback){
	var fileUUID = uuidGenerator.generate();
	s3Services.upload(fileUUID,fileData.layerFileName,function(success,publicEndpoint,errStack){
		if (!success) {
			callback(false,{
				error: true,
				err: errStack,
				rawContent: fileData
			});
		}else{
			callback(success,{
				success: true,
				url: publicEndpoint,
				layerTitle: fileData.layerTitle,
				layerType: fileData.layerType,
				rawContent: fileData
			});
			
			s3DAO.insertNewFileRecord({
				googleUserID: userGoogleID,
				layerTitle: fileData.layerTitle,
				layerFileName: fileData.layerFileName,
				amazonID: fileUUID,
				layerType: fileData.layerType
			},function(isSuccess,results){
				console.log('log file to S3 database'+isSuccess);
			});
		}
	});
}

module.exports = GeoUploadController;