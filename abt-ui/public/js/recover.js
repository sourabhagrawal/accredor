$(function($){
	var RecoverBoxView = Backbone.View.extend({
		el : $("#recover-box"),
		
		template : _.template($('#recover-box-template').html()),
		
		events : {
			"click #recover-submit-btn" : "submit"
		},
		
		render : function(){
			console.log(this.$el);
			this.$el.html(this.template());
			return this;
		},
		
		initialize : function(){
			this.render();
			
			_.bindAll(this, 'submit', 'success', 'error');
	        
			this.alert = $('#recover-alert');
			this.email = $('#email-field');
			this.password = $('#new-password');
			this.retypePassword = $('#retype-password');
			
			this.email.val(this.options.email);
		},
		
		validate : function(){
			var password = this.password.val();
			var retypePassword = this.retypePassword.val();
			if(password == null || password.trim() == ''){
				this.alert.addClass('alert-error').html("Password can't be empty or blank");
				this.alert.show();
				return false;
			}else if(password != retypePassword){
				this.alert.addClass('alert-error').html("Passwords do not match");
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
				url : '/api/users/update_password',
				type : 'put',
				data : {
					email : email,
					password : password
				},
				success : function(data, textStatus, jqXHR){
					ref.success();
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						ref.error(data.message);
					}
				}
			});
		},
		
		success: function() {
			this.$el.find('.p-modal-body').html(message_password_changed);
			this.$el.find('.form-actions').hide();
		},
		
		error: function(msg) {
			this.alert.html(msg);
			this.alert.show();
		}
	});
	
	
	var token = Utils.getQueryParameterByName('t');
	if(!token){
		$('#message').addClass('alert-error').html(message_invalid_verification_url);
		$('#message').show();
	}else{
		$.ajax({
			url : '/api/users/validate_token',
			type : 'get',
			data : {
				token : token
			},
			success : function(data, textStatus, jqXHR){
				// TODO : Open up a form to generate a new password
				new RecoverBoxView({email : data.data});
			},
			error : function(res, textStatus, errorThrown){
				if(res.status == 500){
					var data = $.parseJSON(res.responseText);
					$('#message').addClass('alert-error').html(data.message);
					$('#message').show();
				}
			}
		});
	}
});