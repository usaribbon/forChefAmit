var express = require('express'),
app = express(),
util = require('util');

app.path = path = require('path');
app.jsHandler = jsHandler = '';

// Common app config
app.configure(function() {
	app.use(express.urlencoded({
		limit: '10mb'
	}));

	app.use(express.json());

	app.use(express.methodOverride());
	app.use(express.cookieParser('lbajobs'));

	app.use(express.static(__dirname + '/public', {
		maxAge: 86400000, // one day
		redirect: false
	}));

	app.get('/', function (req, res, nextRoute) {
		res.send('Now its your turn');
	});

	/*
		Starting app
	*/
	var server = app.listen(7000, function () {
		console.log('Server is running on  ' + server.address().address + ':' + server.address().port);
	});
});

