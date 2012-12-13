$(function($){
	var SignUpView = BaseLoginView.extend({
		el : $("#login-box-container"),
		
		template : _.template($('#signup-box-template').html()),
		
		initialize : function(){
			this.constructor.__super__.initialize.apply(this);
			
			_.bindAll(this, 'signupSuccess', 'signupError');
		},
		
		submit : function(){
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
	
	eventBus.on('global_header_rendered', function(view){
		console.log("event heard");
		$('#signup-btn').click(function(event){
			new SignUpView();
		});
	});
});