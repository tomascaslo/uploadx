'use strict';

var ResponseHandler = function () {
	var theContentType = { 'Content-Type': 'application/json' };

	this.send = function (response, code, message, aContentType) {
		if ( typeof aContentType !== 'undefined' ) {
			aContentType = { 'Content-Type': aContentType };
			response.writeHead(code, aContentType);
		} else {
			response.writeHead(code, theContentType);
		}

		if ( typeof message === 'string' ) {
			message = { message : message };
		}

		response.write(JSON.stringify(message));
		response.end();

	};

};

module.exports = new ResponseHandler();
