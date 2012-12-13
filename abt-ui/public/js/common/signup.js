var SignUpView = BaseLoginView.extend({
	
	events : {
		"click #signup-form-submit-btn" : "submit",
		"click #login-link" : "openLogInBox"
	},
	
	initialize : function(){
		this.template = _.template($('#signup-box-template').html());
		this.$el = $("#login-box-container");
		
		this.constructor.__super__.initialize.apply(this);
		
		_.bindAll(this, 'signupSuccess', 'signupError');
		
		this.loginBox = $('#signup-box');
        this.alert = $('#signup-alert');
        this.retypePassword = $('#retype-password');
        this.terms = $('#terms');
        
        this.loginBox.modal().css({'width': '460px'});
	},
	
	openLogInBox : function(){
		this.loginBox.on('hidden', function () {
			new LoginBoxView();
		});
		this.loginBox.modal("hide");
		this.loginBox.off('hidden');
	},
	
	validate : function(){
		var email = this.email.val();
		var password = this.password.val();
		var retypePassword = this.retypePassword.val();
		var agreed = this.terms.is(':checked');
		
		if(!Utils.isEmail(email)){
			this.alert.addClass('alert-error').html("Not a valid email address");
			this.alert.show();
			return false;
		}
		
		if(password == null || password.trim() == ''){
			this.alert.addClass('alert-error').html("Password can't be empty or blank");
			this.alert.show();
			return false;
		}else if(password != retypePassword){
			this.alert.addClass('alert-error').html("Passwords do not match");
			this.alert.show();
			return false;
		}
		
		if(!agreed){
			this.alert.addClass('alert-error').html("You have to agree to the Terms of Service and Privacy Policy");
			this.alert.show();
			return false;
		}
		
		return true;
	},
	
	submit : function(){
		if(!this.validate()) return;
		
		var email = this.email.val();
		var password = this.password.val();
		
		var ref = this;
		$.ajax({
			url : '/api/users/signup',
			type : 'post',
			data : {
				username : email,
				password : password
			},
			success : function(data, textStatus, jqXHR){
				ref.signupSuccess();
			},
			error : function(res, textStatus, errorThrown){
				if(res.status == 500){
					var data = $.parseJSON(res.responseText);
					ref.signupError(data.message);
				}
			}
		});
	},
	
	signupSuccess: function() {
		this.undelegateEvents();
		
		this.$el.find('.p-modal-body').html(message_verification_email_sent);
		this.$el.find('.form-actions').html('<button class="btn pull-right" data-dismiss="modal" aria-hidden="true">OK</button>');
	},
	
	signupError: function(msg) {
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

$(function($){
	eventBus.on('global_header_rendered', function(view){
		console.log("event heard");
		$('#signup-btn').click(function(event){
			new SignUpView();
		});
	});
});