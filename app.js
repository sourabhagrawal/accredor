
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');

/**
 * Routes
 */
var routes = require('./routes/index');

/**
 * Initialize App
 */
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
//  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

//app.configure('development', function(){
//  app.use(express.errorHandler());
//});

app.get('/', routes.index);

app.get('/fetch', routes.fetch);

app.use(function(req, res, next){
	request('http://shreddedlamb.com' + req.url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			  var type = require('mime').lookup('http://shreddedlamb.com' + req.url);
			  console.log(req.url + " : " + type);
			  res.header("Content-Type", type);
//			  if(req.accepts("css"))
//				  res.header("Content-Type", "text/css");
//			  if(req.accepts("html"))
//				  res.header("Content-Type", "text/html");
			  res.send(body);
		  }else{
			  console.log(error);
			  console.log(response.statusCode);
			  next();
		  }
		});
});

/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
