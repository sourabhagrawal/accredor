var http = require('http');
var request = require('request');
var jsdom = require("jsdom");

exports.index = function(req, res){
	req.session.url = req.query['url'];
	res.render('bench', {url : req.query['url']});
};

var includeJs = function(url, window){
	var head = window.document.head;
	var script = window.document.createElement("script");
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
};

var includeCss = function(url, window){
	var head = window.document.head;
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
			includeCss('/css/frame.css', window);
			
			var overlay = window.document.createElement("div");
			overlay.id = "selected";
			overlay.style = "position:absolute";
			window.document.body.appendChild(overlay);
			
			includeJs('/lib/jquery-ui/js/jquery-1.8.2.js', window);
			includeJs('/lib/jquery-ui/js/jquery-ui-1.9.0.custom.js', window);
			includeJs('/javascripts/stack.js', window);
			includeJs('/javascripts/movement.js', window);
			includeJs('/javascripts/frame.js', window);
			
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