var CreateGoal = Backbone.Model.extend({
	urlRoot : function(){ return '/api/goals/';},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
	},
	
	validate: function(attrs) {
		if(!attrs.name || attrs.name.trim() == ''){
			return 'Goal Name can not be blank';
		}
		if(!attrs.url || attrs.url.trim() == ''){
			return 'Goal URL can not be blank';
		}
	}
});

Views.CreateGoalView = Views.BaseView.extend({
	events : {
		"click #submit-btn" : "createGoal",
		"click #reset-btn" : "render",
	},
	
	initialize : function(){
		this.$el = $("#dashboard-content");
		this.model = new CreateGoal();
		
		this._super('initialize');
		this.loadTemplate('goal-create');
		
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.synced, this);
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this.render();
		
		this.name = this.$('#name');
		this.type = this.$('#type');
		this.url = this.$('#url');
		this.alert = this.$('#goal-alert');
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
		this.showSuccess(response.status.message);
		this.$('form').each(function(){
			  this.reset();
		});
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
		this.$el.find('a').prop('disabled' , true);
	},
	
	enable : function(){
		this.$el.find('input').prop('disabled' , false);
		this.$el.find('a').prop('disabled' , false);
	},
	
	createGoal : function(){
		this.disable();
		
		this.model.set('name', this.name.val(), {silent : true});
		this.model.set('type', this.type.val(), {silent : true});
		this.model.set('url', this.url.val(), {silent : true});
		this.model.save();
	},
});