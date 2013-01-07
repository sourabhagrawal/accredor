$(function($){
	Utils.openLoginBox = function(){
		new Views.LoginBoxView();
	};

	$('#login-btn').click(function(event){
		Utils.openLoginBox();
	});
	
	Utils.openSignupBox = function(){
		new Views.SignUpView();
	};
	
	$('#signup-btn').click(function(event){
		Utils.openSignupBox();
	});
	
	eventBus.on('open_login_box', function(){
		new Views.LoginBoxView();
	});
});