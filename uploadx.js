var express = require('express'),
	multer = require('multer'),
	http = require('http'),
	fs = require('fs');

var DJANGO_KEY = '6dca3006ce0743bc8af17cfcecd8b870';

var TEMP_FILES_PATH = './uploads/temp/';
var MEDIA_FILES_PATH = './uploads/images/'
var VALID_MIMETYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

var uploadx = express();

uploadx.use(multer({ // Multer configuration for handling of multipart/form-data requests
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
		console.log('Failed: ', file.originalname)
		fs.unlink('./' + TEMP_FILES_PATH + file.path) // delete the partially written file
	}
}));

uploadx.post('/uploadx/full/', function(req, res){
	console.log(req.files);
	console.log(req.body);
	console.log(!(VALID_MIMETYPES.indexOf(req.files.myFile.mimetype) >= 0));
	if(!(VALID_MIMETYPES.indexOf(req.files.myFile.mimetype) >= 0)) {
		error_333_handle(res);
	}

	var file_name = req.files.myFile.name;
	var file_realname = req.files.myFile.originalname;
	var file_path = './' + req.files.myFile.path;

	var data = JSON.stringify({
		uuidx_token : req.body.token,
		django_key : DJANGO_KEY
	});

	console.log(data);

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

	var validate = http.request(options, function(vRes){ // vRes: validation response
		vRes.setEncoding('utf8');
		vRes.on('data', function(data){ // { valid_token: true, folder_to_save_image: 'user8tomascaslo' }
			console.log(data);
			var rData = JSON.parse(data); // rData: response data 
			if(rData.valid_token){
				fs.exists(MEDIA_FILES_PATH + rData.folder_to_save_image, function(exists){ 
					var from, to;
					from = TEMP_FILES_PATH + file_name;
					to = MEDIA_FILES_PATH + rData.folder_to_save_image + '/' + file_name;
					if(exists){
						persist_file(from, to);
					} else {
						fs.mkdir(MEDIA_FILES_PATH + rData.folder_to_save_image, function(err){
							if(err) throw err;
							// error_500_handle(res);
							persist_file(from, to);
						});
					}
					success_200_handle(res, rData.folder_to_save_image + '/' + file_name); // Send url path of created image
				});
			} else {
				error_401_handle(res);
			}
		});
	});

	validate.on('error', function(err){
		fs.exists(file_path, function(exists){
			if(exists){
				console.log("It exists!");
				fs.unlink(file_path, function(err){
					if(err) throw err;
					console.log("Deleted " + file_realname + ": Error on upload.")
				});
			} else {
				console.log("It doesn't exists!");
			}
			error_500_handle(res);
		});
	});

	validate.write(data);
	validate.end(data);
});

var persist_file = function(from, to){
	fs.rename(from, to, function(err){
		if(err) throw err;
		// error_500_handle();
	});
};

var success_200_handle = function(res, imagePath){
	res.writeHead(200, {'Content-Type': 'application/json' });
	if(imagePath){
		res.write(JSON.stringify({
			'imagePath' : imagePath
		}));
	}
	res.end();
};

var error_500_handle = function(res){
	res.write('500 Internal server error');
	res.end();
};

var error_401_handle = function(res){
	res.write('401 Unauthorized');
	res.end();
};

var error_333_handle = function(res){
	res.write('333 Format not allowed');
	res.end();
};

console.log("Running server on localhost port 8080...");

uploadx.listen(8080);