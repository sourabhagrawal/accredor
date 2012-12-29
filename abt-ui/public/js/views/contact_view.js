var Contact = Backbone.Model.extend({
	urlRoot : function(){ return '/api/contact_leads/';},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
	},
	
	validate: function(attrs) {}
});

Views.ContactView = Views.BaseView.extend({
	events : {
		"click #submit-btn" : "onSubmit",
		"click #reset-btn" : "render",
	},
	
	initialize : function(){
		this.$el = $("#contact-form-container");
		this.model = new Contact();
		
		this._super('initialize');
		this.loadTemplate('contact');
		
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.synced, this);
		
		eventBus.on('close_view', this.close, this );
	},
	
	init : function(){
		this.render();
		
		this.name = this.$('#name');
		this.email = this.$('#email');
		this.message = this.$('#message');
		this.alert = this.$('#contact-alert');
		this.submitBtn = this.$('#submit-btn');
		this.resetBtn = this.$('#reset-btn');
	},
	
	render : function(){
		this.$el.html(this.template());
	},
	
	close : function(){
		this._super('close');
	},
	
	error : function(model, error){
		if(error.status == 500){
			var data = $.parseJSON(error.responseText);
			this.showError(data.message);
		}else if(error.statusText != undefined){
			this.showError(error.statusText);
		}else{
			this.showError(error);
		}
	},
	
	synced : function(model, response){
		this.showSuccess("Your message has been registered. We will revert back at the earliest");
		
		this.$('form').hide();
	},
	
	showError : function(msg){
		this.enable();
		this.alert.find('.alert').removeClass('alert-success');
		this.alert.find('.alert').addClass('alert-error');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	},
	
	showSuccess : function(msg){
		this.enable();
		
		this.alert.find('.alert').removeClass('alert-error');
		this.alert.find('.alert').addClass('alert-success');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	},
	
	disable : function(){
		this.$el.find('input').prop('disabled' , true);
		this.$el.find('textarea').prop('disabled' , true);
		this.$el.find('a').prop('disabled' , true);
	},
	
	enable : function(){
		this.$el.find('input').prop('disabled' , false);
		this.$el.find('textarea').prop('disabled' , false);
		this.$el.find('a').prop('disabled' , false);
	},
	
	onSubmit : function(){
		this.disable();
		
		this.model.set('name', this.name.val(), {silent : true});
		this.model.set('email', this.email.val(), {silent : true});
		this.model.set('message', this.message.val(), {silent : true});
		this.model.save();
	},
});