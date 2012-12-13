var BaseLoginView = Backbone.View.extend({
	events : {
		"click #login-form-submit-btn" : "submit"
	},
	
	render : function(){
		console.log(this.$el);
		this.$el.html(this.template());
		return this;
	},
	
	initialize : function(){
		this.render();
		
		_.bindAll(this, 'submit', 'sendVerificationMail', 'emailSent');
        
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
					ref.signupError(data.message);
				}
			}
		});
	},
	
	emailSent : function(){
		this.undelegateEvents();
		
		this.$el.find('.p-modal-body').html(message_verification_email_sent);
		this.$el.find('.form-actions').html('<button class="btn pull-right" data-dismiss="modal" aria-hidden="true">OK</button>');
	}
});