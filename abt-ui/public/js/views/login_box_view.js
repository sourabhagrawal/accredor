Views.LoginBoxView = Views.BaseLoginView.extend({
	events : {
		"click #login-form-submit-btn" : "submit",
		"click #forgot-link" : "openForgotBox",
		"click #signup-link" : "openSignUpBox"
	},
	
	initialize : function(){
		this._super('initialize');
		this.$el = $("#login-box-container");
		this.loadTemplate('login-box');
		
		_.bindAll(this, 'loginSuccess', 'loginError', 'openForgotBox');
	},
	
	init : function(){
		this.render();
		
		this._super('init');
		
		this.loginBox = $('#login-box');
        this.alert = $('#login-alert');
        
		this.loginBox.modal().css({'width': '360px'});
	},
	
	openForgotBox : function(){
		this.loginBox.on('hidden', function () {
			new Views.ForgotView();
		});
		this.loginBox.modal("hide");
		this.loginBox.off('hidden');
	},
	
	openSignUpBox : function(){
		this.loginBox.on('hidden', function () {
			new Views.SignUpView ();
		});
		this.loginBox.modal("hide");
		this.loginBox.off('hidden');
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