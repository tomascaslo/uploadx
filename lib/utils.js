'use strict';

var fs = require('fs');

var Utils = function (validFileTypesList) {
	var validFileTypesList = validFileTypesList ? validFileTypesList : 
							['image/jpg', 'image/jpeg', 'image/png'];


	this.hasValidFileType = function (request) {
		return validFileTypesList.indexOf(request.files.file.mimetype) >= 0;
	};

	this.fileExists = function (path, callback) {
		fs.exists(path, callback);
	};

	this.createDirectory = function (path, callback) {
		fs.mkdir(path, callback);
	};

	this.createFileIfNotExists = function (path) {
		if( !fs.existsSync(path) ) {
			fs.mkdirSync(path);
		}
	};

	this.saveFile = function (from, to) {
		fs.rename(from, to, function(err){
			if ( err ) throw err;
		});
	};

	this.deleteFile = function (path) {
		fs.unlink(path);
	};

	this.loadEnvVariable = function (key, defaultsTo) {
		if ( process.env[key] ) {
			return process.env[key];
		} else if ( typeof defaultsTo !== 'undefined' ) {
			return defaultsTo;
		}

		throw new Error('No variable ' + key + ' in env.');
	};

};

module.exports = function (validFileTypesList) {
	return new Utils(validFileTypesList);
};