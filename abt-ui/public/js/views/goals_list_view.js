var Goal = Backbone.Model.extend({
	defaults : function(){
		return {};
	},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
	},
	
	initialize : function(){
		this.bind('error', this.error, this);
		this.bind('sync', this.synced, this);
	}
});

var GoalList = Backbone.Collection.extend({
	model : Goal,
	url : function(){
		return '/api/goals';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var goals = new GoalList();

var GoalView = Views.BaseView.extend({
	tagName : "tr",
	
	events : {
		"click #primary-action" : "primaryAction",
		"click #delete" : "destroy",
		"blur #name" : "save",
		"blur #url" : "save",
		"blur #type" : "save"
	},
	
	initialize : function(){
		this._super('initialize');
		this.loadTemplate('goals/goal-row');
		
		this.model.bind('sync', this.render, this);
		this.model.bind('error', this.markError, this);
		this.model.bind('destroy', this.remove, this);
	},
	
	init : function(){
		this._super('init');
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.removeClass('error');
		return this;
	},
	
	destroy : function(){
		if(confirm("Are you sure you want to delete this Goal?"))
			this.model.destroy();
	},
	
	primaryAction : function(){
		this.disable();
		
		var status = this.model.get('status');
		if(status == 'created')
			this.model.save('status', 'stopped');
		else if(status == 'stopped')
			this.model.save('status', 'created');
	},
	
	save : function(e){
		this.disable();
		
		var attr = e.target.id;
		var value = $(e.target).val();
		var params = {};
		params[attr] = value;
	    this.model.save(params);
	},
	
	disable : function(){
		this.$el.find('input').prop('disabled' , true);
		this.$el.find('select').prop('disabled' , true);
		this.$el.find('a').prop('disabled' , true);
	},
	
	enable : function(){
		this.$el.find('input').prop('disabled' , false);
		this.$el.find('select').prop('disabled' , false);
		this.$el.find('a').prop('disabled' , false);
	},
	
	markError : function(){
		this.enable();
		
		this.$el.addClass('error');
	}
});

Views.GoalsListView = Views.BaseView.extend({
	events : {
	},
	
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		this.loadTemplate('goals/goals-list');
		
//		goals.bind('add', this.add, this);
		goals.bind('reset', this.addAll, this);
		goals.bind('error', this.showError, this);
		goals.bind('sync', this.hideError, this);
//		goals.bind('all', this.render, this);
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		var data = {};
		if(this.options.filter){
			var q = '';
			_.each(this.options.filter, function(value, key, list){
				if(value != null){
					if(q != '') q += '___';
					q += key + ":eq:" + value;
				}
			});
			data.q = q;
		}
		
		if(!data.q) data.q = 'isDisabled:eq:0';
		else data.q += '___isDisabled:eq:0';
		
		goals.fetch({
			data : data
		});
	},
	
	close : function(){
		this._super('close');
		
		goals.off();
		delete goals;
	},
	
	render : function(){
		this.$el.html(this.template());
		
		this.alert = this.$('#goal-alert');
	},
	
	add : function(goal){
		var view = new GoalView({model : goal});
		this.$('#goals-table-body').append(view.render().el);
	},
	
	addAll : function(){
		if(goals.length == 0)
			this.$el.html("<h3>No Goals found. <a href='" + ACC.CREATE_GOAL_URL + "'>Click Here</a> to create one.</h3>");
		else
			goals.each(this.add);
	},
	
	showError : function(model, error){
		var msg = '';
		if(error.status == 500){
			var data = $.parseJSON(error.responseText);
			msg = data.message;
		}else{
			msg = error.statusText;
		}
		this.alert.find('.alert').addClass('alert-error');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	},
	
	hideError : function(){
		this.alert.hide();
	}
	
});