$(function($){
	$.ajaxSetup({
		statusCode: {
			401: function(){
				// Open the Login Modal
				$('#loginBox').modal({
					
				});
			}
		}
	});
});