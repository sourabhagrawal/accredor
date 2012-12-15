$(function($){
	eventBus.on('global_header_rendered', function(view){
		console.log("event heard");
		$('#signup-btn').click(function(event){
			new Views.SignUpView();
		});
	});
});