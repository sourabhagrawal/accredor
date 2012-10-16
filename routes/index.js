var http = require('http');
var request = require('request');
var jsdom = require("jsdom");

exports.index = function(req, res){
   res.render('index');
};

var includeJs = function(url, window){
	var head = window.document.head;
	var script = window.document.createElement("script");
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
};

exports.fetch = function(req, res){
	var src = req.query.src;
	jsdom.env('http://' + src, function(errors, window){
		var head = window.document.head;
		
		var style = window.document.createElement("link");
		style.type = 'text/css';
		style.href = '/css/frame.css';
		style.rel = 'stylesheet';
		head.appendChild(style);
		
		var overlay = window.document.createElement("div");
		overlay.id = "selected";
		overlay.style = "position:absolute";
		window.document.body.appendChild(overlay);
		
		includeJs('/lib/jquery-ui/js/jquery-1.8.2.js', window);
		includeJs('/lib/jquery-ui/js/jquery-ui-1.9.0.custom.js', window);
		includeJs('/javascripts/stack.js', window);
		includeJs('/javascripts/movement.js', window);
		includeJs('/javascripts/frame.js', window);
		
		console.log(window.document.head.innerHTML);
		
		res.send(window.document.innerHTML);
	});
//	request('http://' + src, function (error, response, body) {
//		if (!error && response.statusCode == 200) {
//			jsdom.env('http://shreddedlamb.com', function(errors, window){
//				var head = window.document.head;
//				var script = window.document.createElement("script");
//				script.type = 'text/javascript';
//				script.src = '/javascripts/frame.js';
//				head.appendChild(script);
//				console.log(window.document.innerHTML);
//			}); 
//			jsdom.env(
//			  body,
//			  ["/javascripts/frame.js"],
//			  function(errors, window) {
//				console.log(window.HTMLHeadElement);
//			    console.log("contents of head", window.$("head").text());
//			  }
//			);
//			//body += "<script src='/javascripts/frame.js' />";
//			res.send(body);
//		}
//	});
};