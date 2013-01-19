var http = require('http');
var request = require('request');
var jsdom = require("jsdom");

exports.index = function(req, res){
	res.render('bench');
};

var includeJs = function(url, window){
	var head = window.document.head;
	if(head == null)
		head = window.document.body;
	var script = window.document.createElement("script");
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
};

var includeCss = function(url, window){
	var head = window.document.head;
	if(head == null)
		head = window.document.body;
	
	var style = window.document.createElement("link");
	style.type = 'text/css';
	style.href = '/css/frame.css';
	style.rel = 'stylesheet';
	head.appendChild(style);
};

exports.fetch = function(req, res){
	var url = req.query.url;
	jsdom.env(url, function(errors, window){
		if(window != undefined){
			var overlay = window.document.createElement("div");
			overlay.id = "selected";
			window.document.body.appendChild(overlay);
			
			overlay = window.document.createElement("div");
			overlay.id = "over";
			window.document.body.appendChild(overlay);
			
			includeCss('/css/frame.css', window);
			
			includeJs('/lib/jquery-ui/js/jquery-1.8.2.js', window);
			includeJs('/lib/jquery-ui/js/jquery-ui-1.9.0.custom.js', window);
			includeJs('/js/bench/stack.js', window);
			includeJs('/js/bench/movement.js', window);
			includeJs('/js/bench/frame.js', window);
			
			//console.log(window.document.head.innerHTML);
			
			res.send(window.document.innerHTML);
		}else{
			/**
			 * Could not load the page
			 */
			res.send("Sorry! Can not proceed. Try to put http:// before the URL if you didn't do it earlier");
		}
	});
};