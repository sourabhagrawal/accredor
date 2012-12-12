$(function($){
	var ForgotView = Backbone.View.extend({
		el : $("#login-box-container"),
		
		template : _.template($('#forgot-box-template').html()),
		
		events : {
			"click #forgot-submit-btn" : "submit"
		},
		
		render : function(args){
			this.$el.html(this.template(args));
			return this;
		},
		
		initialize : function(){
			this.render();
			
			_.bindAll(this, 'submit', 'loginSuccess', 'loginError');
	        
	        this.loginBox = $('#login-box');
	        this.alert = $('#login-alert');
			this.email = $('#email-field');
			
			this.loginBox.modal().css({'width': '360px'});
		},
		
		submit : function(){
			var email = this.email.val();
			
			var ref = this;
			$.ajax({
				url : '/api/users/forgot',
				type : 'post',
				data : {
					username : email,
				},
				success : function(data, textStatus, jqXHR){
					ref.loginSuccess();
				},
				error : function(res, textStatus, errorThrown){
					var data = $.parseJSON(res.responseText);
					ref.loginError(data.message);
				}
			});
		},
		
		loginSuccess: function() {
			this.undelegateEvents();
			this.$el.find('.modal-body').html("<p class='text-success'>A password recovery mail has been sent to your email id. Please follow the link in the email to generate a new password.</p>");
			this.$el.find('.modal-footer').html('<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>');
		},
		
		loginError: function(msg) {
			this.alert.html(msg);
			this.alert.css('display', 'block');
		}
	});
	
	var LoginBoxView = Backbone.View.extend({
		el : $("#login-box-container"),
		
		template : _.template($('#login-box-template').html()),
		
		events : {
			"click #login-form-submit-btn" : "submit"
		},
		
		render : function(args){
			this.$el.html(this.template(args));
			return this;
		},
		
		initialize : function(){
			this.render({mode : this.options.mode});
			
			_.bindAll(this, 'submit', 'loginSuccess', 'loginError', 'sendVerificationMail', 'emailSent');
	        
	        this.loginBox = $('#login-box');
	        this.alert = $('#login-alert');
			this.email = $('#email-field');
			this.password = $('#password-field');
			
			this.loginBox.modal().css({'width': '360px'});
		},
		
		sendVerificationMail : function(){
			var email = this.email.val();
			
			var ref = this;
			$.ajax({
				url : '/api/users/send_verification',
				type : 'post',
				data : {
					username : email
				},
				success : function(data, textStatus, jqXHR){
					ref.emailSent();
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						ref.loginError(data.message);
					}
				}
			});
		},
		
		emailSent : function(){
			this.undelegateEvents();
			
			this.$el.find('.modal-body').html(message_verification_email_sent);
			this.$el.find('.modal-footer').html('<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>');
		},
		
		submit : function(){
			var email = this.email.val();
			var password = this.password.val();
			
			var ref = this;
			$.ajax({
				url : '/' + (this.options.mode == 'login' ? 'login' : 'api/users/signup'),
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
			
			if(this.options.mode == 'login'){
				this.loginBox.modal("hide");
				eventBus.trigger('logged_in');
			}else{
				this.$el.find('.modal-body').html(message_verification_email_sent);
				this.$el.find('.modal-footer').html('<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>');
			}
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
			new LoginBoxView({mode : 'login'});
		});
		
		$('#signup-btn').click(function(event){
			new LoginBoxView({mode : 'signup'});
		});
		
		$('#forgot-btn').click(function(event){
			new ForgotView();
		});
	});
	
	eventBus.on('open_login_box', function(){
		new LoginBoxView({mode : 'login'});
	});
});