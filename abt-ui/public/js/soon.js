$(function($){
	$('#subscribe-btn').click(function(event){
		var email = $('#subscribe-email').val();
		if(!Utils.isEmail(email)){
			alert('Please put a valid email address');
			return false;
		}
		$.ajax({
			url : '/subscribe',
			type : 'post',
			data : {
				email : email
			},
			success : function(data, textStatus, jqXHR){
				$('#subscribe-box').html("<h1>Thank You!<h1>");
			},
			error : function(res, textStatus, errorThrown){
				alert('Something went wrong. Please try again!');
			}
		});
	});
});