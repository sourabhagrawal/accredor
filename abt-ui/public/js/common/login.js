$(function($){
	eventBus.on('global_header_rendered', function(view){
		$('#login-btn').click(function(event){
			new Views.LoginBoxView();
		});
	});
	
	eventBus.on('open_login_box', function(){
		new Views.LoginBoxView();
	});
});