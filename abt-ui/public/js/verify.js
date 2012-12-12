$(function($){
	var token = Utils.getQueryParameterByName('t');
	if(!token){
		$('#message').css('display', 'block');
		$('#message').addClass('alert-error').html(message_invalid_verification_url);
	}else{
		$.ajax({
			url : '/api/users/verify',
			type : 'get',
			data : {
				token : token
			},
			success : function(data, textStatus, jqXHR){
				$('#message').css('display', 'block');
				$('#message').addClass('alert-success').html(message_verification_successful);
			},
			error : function(res, textStatus, errorThrown){
				if(res.status == 500){
					var data = $.parseJSON(res.responseText);
					$('#message').css('display', 'block');
					$('#message').addClass('alert-error').html(data.message);
				}
			}
		});
	}
});