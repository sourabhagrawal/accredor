var Utils = Utils || {};

$(function($){
	Utils.openLoginBox = function(){
		eventBus.trigger('open_login_box');
	};
	
	Utils.getQueryParameterByName = function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};
});