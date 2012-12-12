$(function($){
	$(".alert").alert();
	
	$.ajaxSetup({
		global : true,
		statusCode: {
			601: function(){
				// Open the Login Modal
				Utils.openLoginBox();
			}
		}
	});
	
	$(document).ajaxSuccess(function(evt, request, settings){
		try{
			var data = $.parseJSON(request.responseText);
			if(data.status && data.status.code == 1000){
//				settings.success(data);
				console.log(data.success.message);
			}else{
				var message = "An unknown error occurred";
				if(data.message)
					message = data.message;
				console.log(message);
//				if(settings.error)
//					settings.error(request, message, data);
			}
		}catch(e){
//			var message = "An unknown error occurred";
//			console.log(message);
//			if(settings.error)
//				settings.error(request, message, request.responseText);
		}
	});
	
	$(document).ajaxError(function(evt, request, settings){
		if(request.status == 500){
			try{
				var data = $.parseJSON(request.responseText);
				console.log(data.message);
			}catch(e){
				var message = "An unknown error occurred";
				console.log(message);
			}
		}
	});
	
	if(window.eventBus == undefined)
		window.eventBus = _.extend({}, Backbone.Events);
});