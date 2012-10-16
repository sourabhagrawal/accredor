var jsdom = require("jsdom");
//
jsdom.env('http://shreddedlamb.com', function(errors, window){
	var head = window.document.head;
	var script = window.document.createElement("script");
	script.type = 'text/javascript';
	script.src = '/javascripts/frame.js';
	head.appendChild(script);
	console.log(window.document.innerHTML);
});     
