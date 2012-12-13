$(function($){
	var LoginBoxView = BaseLoginView.extend({
		el : $("#login-box-container"),
		
		template : _.template($('#login-box-template').html()),
		
		initialize : function(){
			this.constructor.__super__.initialize.apply(this);
			
			_.bindAll(this, 'loginSuccess', 'loginError');
		},
		
		submit : function(){
			var email = this.email.val();
			var password = this.password.val();
			
			var ref = this;
			$.ajax({
				url : '/login',
				type : 'post',
				data : {
					username : email,
					password : password
				},
				success : function(data, textStatus, jqXHR){
					ref.loginSuccess();
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 401){
						ref.loginError("Incorrect email or password");
					}else if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						ref.loginError(data.message);
					}
				}
			});
		},
		
		loginSuccess: function() {
			this.undelegateEvents();
			
			this.loginBox.modal("hide");
			eventBus.trigger('logged_in');
		},
		
		loginError: function(msg) {
			this.alert.html(msg);
			this.alert.css('display', 'block');
			
			var ref = this;
			if($('#send-verification-btn')){
				$('#send-verification-btn').click(function(event){
					ref.sendVerificationMail();
				});
			}
		}
	});
	
	eventBus.on('global_header_rendered', function(view){
		console.log("event heard");
		$('#login-btn').click(function(event){
			new LoginBoxView();
		});
	});
	
	eventBus.on('open_login_box', function(){
		new LoginBoxView();
	});
});