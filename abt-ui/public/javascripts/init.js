$(function($){
	$.ajaxSetup({
		statusCode: {
			601: function(){
				// Open the Login Modal
				Utils.openLoginBox();
			}
		}
	});
	
	
	$('#login-form-submit-btn').click(function(event){
		var email = $('#email-field').val();
		var password = $('#password-field').val();
		
		$.ajax({
			url : '/login',
			type : 'post',
			data : {
				username : email,
				password : password
			},
			success : function(data, textStatus, jqXHR){
				$('#loginBox').modal("hide");
			},
			error : function(jqXHR, textStatus, errorThrown){
				console.log(errorThrown);
			}
		});
	});
});