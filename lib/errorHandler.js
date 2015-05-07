'use strict';

var responseHandler = require('./responseHandler.js');

var ErrorHandler = function () {
	var message = { error : '' };

	this.error333 = function (response) {
		message.error = 'Format not allowed';
		responseHandler.send(response, 333, message);
	};

	this.error401 = function (response) {
		message.error = 'Format not allowed';
		responseHandler.send(response, 401, message);
	};

	this.error500 = function (response) {
		message.error = 'Format not allowed';
		responseHandler.send(response, 500, message);
	};

};

module.exports = new ErrorHandler();