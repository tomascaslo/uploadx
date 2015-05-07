'use strict';

var express = require('express'),
	multer = require('multer'),
	http = require('http'),
	responseHandler = require('./lib/responseHandler.js'),
	errorHandler = require('./lib/errorHandler.js');

var VALID_MIMETYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

var utils = require('./lib/utils.js')(VALID_MIMETYPES);

var DJANGO_KEY = '6dca3006ce0743bc8af17cfcecd8b870';

var TEMP_FILES_PATH = './uploads/temp/';
var MEDIA_FILES_PATH = './uploads/images/'

var uploadx = express();


utils.createFileIfNotExists('./uploads/');
utils.createFileIfNotExists(TEMP_FILES_PATH);
utils.createFileIfNotExists(MEDIA_FILES_PATH);

uploadx.use(express.static(__dirname + '/uploads/images'));
uploadx.use(multer({ // Multer configuration for handling of multipart/form-data requestuests
	dest: TEMP_FILES_PATH,

	rename: function (fieldname, filename) {
		return filename.replace(/\W+/g, '-').toLowerCase() + Date.now();
	},

	limits: {
		fileSize: 10485760,
	},

	onFileUploadComplete: function (file) {
		console.log(file.fieldname + ' uploaded to  ' + file.path);
	},

	onFileSizeLimit: function (file) {
		utils.deleteFile('./' + TEMP_FILES_PATH + file.path);
	}

}));

uploadx.post('/uploadx/full/', function(request, response){
	if(!utils.hasValidFileType(request)) {
		utils.error333(response);
	}

	var fileName = request.files.myFile.name;
	var fileRealName = request.files.myFile.originalname;
	var filePath = './' + request.files.myFile.path;

	var data = JSON.stringify({
		uuidx_token : request.body.token,
		django_key : DJANGO_KEY
	});

	var options = {
		host: 'localhost', // Api server host
		port: '8000', // Api server port
		path: '/api/foodtruckie/uploadx/validate_token/',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	};

	var validate = http.request(options, function (validationResponse) {
		validationResponse.setEncoding('utf8');
		validationResponse.on('data', function (data) { // { valid_token: true, folder_to_save_image: 'user8tomascaslo' }
			var responseData = JSON.parse(data); 
			if ( responseData.valid_token ) {
				utils.fileExists(MEDIA_FILES_PATH + responseData.folder_to_save_image, function (exists) { 
					var from, to;
					from = TEMP_FILES_PATH + fileName;
					to = MEDIA_FILES_PATH + responseData.folder_to_save_image + '/' + fileName;
					if ( exists ) {
						utils.saveFile(from, to);
					} else {
						utils.createDirectory(MEDIA_FILES_PATH + responseData.folder_to_save_image, function (err) {
							if ( err ) throw err;
							utils.saveFile(from, to);
						});
					}
					responseHandler.send(response, 200, responseData.folder_to_save_image + '/' + fileName); // Send url path of created image
				});
			} else {
				errorHandler.error401(response);			
			}
		});
	});

	validate.on('error', function (err) {
		utils.fileExists(filePath, function (exists) {
			if(exists){
				utils.deleteFile(filePath, function (err) {
					if ( err ) throw err;
					console.log("Deleted " + fileRealName + ": Error on upload.");
				});
			} 
			errorHandler.error500(response);

		});

	});

	validate.write(data);
	validate.end(data);

});

console.log("Running server on localhost port 8080...");

uploadx.listen(8080);