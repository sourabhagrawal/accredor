var Utils = Utils || {};

$(function($){
	Utils.openLoginBox = function(){
		eventBus.trigger('open_login_box');
	};
});