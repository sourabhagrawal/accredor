var Utils = Utils || {};

$(function($){
	Utils.openLoginBox = function(){
		eventBus.trigger('open_login_box');
	};
	
	Utils.getQueryParameterByName = function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	};
	
	Utils.isEmail = function(email) {
		var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		return regex.test(email);
	};
});