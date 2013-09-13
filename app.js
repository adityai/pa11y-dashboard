'use strict';

var async = require('async');
var createClient = require('pa11y-webservice-client-node');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var hbs = require('express-hbs');
var http = require('http');

module.exports = initApp;

// Initialise the application
function initApp (config, callback) {

	var app = new EventEmitter();
	app.address = null;
	app.express = express();
	app.server = http.createServer(app.express);
	app.webservice = createClient(config.webservice);

	// View engine
	app.express.set('views', __dirname + '/view');
	app.express.engine('html', hbs.express3({
		extname: '.html',
		contentHelperName: 'content',
		layoutsDir: __dirname + '/view/layout',
		partialsDir: __dirname + '/view/partial',
		defaultLayout: __dirname + '/view/layout/default',
	}));
	app.express.set('view engine', 'html');

	// Load routes
	require('./route/index')(app);
	require('./route/new')(app);
	require('./route/task')(app);

	// Error handling
	app.express.use(function (err, req, res, next) {
		app.emit('route-error', err);
		res.send('Error');
	});

	app.server.listen(config.port, function (err) {
		var address = app.server.address();
		app.address = 'http://' + address.address + ':' + address.port;
		callback(err, app);
	});

}
