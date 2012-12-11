$(function($){
	var LoginModel = Backbone.Model.extend({
	    defaults: {},
	    login : function(email, password){
	    	var ref = this;
	    	$.ajax({
				url : '/' + this.get('mode'),
				type : 'post',
				data : {
					username : email,
					password : password
				},
				success : function(data, textStatus, jqXHR){
					ref.trigger('loginSuccess');
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 401){
						ref.trigger('loginError', "Incorrect email or password");
					}else if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						console.log(data.message);
						ref.trigger('loginError', data.message);
					}
				}
			});
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
			this.render({mode : this.model.get('mode')});
			
			_.bindAll(this, 'submit', 'loginSuccess', 'loginError');
	        this.model.bind('loginSuccess', this.loginSuccess);
	        this.model.bind('loginError', this.loginError);
	        
	        this.loginBox = $('#login-box');
	        this.alert = $('#login-alert');
			this.email = $('#email-field');
			this.password = $('#password-field');
			
			this.loginBox.modal().css({'width': '360px'});
		},
		
		submit : function(){
			var email = this.email.val();
			var password = this.password.val();
			
			this.model.login(email, password);
		},
		
		loginSuccess: function() {
			this.loginBox.modal("hide");
			this.undelegateEvents();
			
			eventBus.trigger('logged_in');
		},
		
		loginError: function(msg) {
			this.alert.html(msg);
			this.alert.css('display', 'block');
		}
	});
	
	eventBus.on('global_header_rendered', function(view){
		console.log("event heard");
		$('#login-btn').click(function(event){
			new LoginBoxView({model : new LoginModel({mode : 'login'})});
		});
		
		$('#signup-btn').click(function(event){
			new LoginBoxView({model : new LoginModel({mode : 'signup'})});
		});
	});
});