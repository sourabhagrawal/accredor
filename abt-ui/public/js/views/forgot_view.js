Views.ForgotView = Views.BaseView.extend({
	events : {
		"click #forgot-submit-btn" : "submit"
	},
	
	render : function(){
		this.$el.html(this.template());
		return this;
	},
	
	initialize : function(){
		this._super('initialize');
		this.$el = $("#forgot-box-container");
		this.loadTemplate('forgot-box');
		_.bindAll(this, 'submit', 'success', 'error');
	},
	
	init : function(){
		this.render();
		
		this._super('init');
		
		this.forgotBox = $('#forgot-box');
        this.alert = $('#forgot-alert');
		this.email = $('#forgot-email-field');
        
		this.forgotBox.modal().css({'width': '360px'});
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
				ref.success();
			},
			error : function(res, textStatus, errorThrown){
				var data = $.parseJSON(res.responseText);
				ref.error(data.message);
			}
		});
	},
	
	success: function() {
		this.undelegateEvents();
		this.$el.find('.p-modal-body').html("<p class='text-success'>A password recovery mail has been sent to your email id. Please follow the link in the email to generate a new password.</p>");
		this.$el.find('.form-actions').html('<a class="btn pull-right" data-dismiss="modal" aria-hidden="true">OK</a>');
	},
	
	error: function(msg) {
		this.alert.html(msg);
		this.alert.css('display', 'block');
	}
});