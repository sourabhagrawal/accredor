var Experiment = Backbone.Model.extend({
	defaults : function(){
		return {
		};
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
	},
	
	error : function(model, error){
		if(error.status == 500){
			var data = $.parseJSON(error.responseText);
			console.log(data.message);
		}else{
			console.log(error.statusText);
		}
	},
	
	synced : function(model, error){
		
	}
});

var ExperimentList = Backbone.Collection.extend({
	model : Experiment,
	url : function(){
		return '/api/experiments/split_experiment/';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var experiments = new ExperimentList();

var ExperimentView = Views.BaseView.extend({
	tagName : "tr",
	
	events : {
		"click #primary-action" : "primaryAction",
		"click #edit" : "edit",
		"click #delete" : "destroy"
	},
	
	initialize : function(){
		this._super('initialize');
		this.loadTemplate('experiment-row');
		
		this.model.bind('sync', this.render, this);
		this.model.bind('destroy', this.remove, this);
	},
	
	init : function(){
		this._super('init');
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
	destroy : function(){
		if(confirm("Are you sure you want to delete this Experiment?"))
			this.model.destroy();
	},
	
	primaryAction : function(){
		var status = this.model.get('status');
		if(status == 'created')
			this.model.save('status', 'started');
		else if(status == 'started')
			this.model.save('status', 'stopped');
		else if(status == 'stopped')
			this.model.save('status', 'started');
	},
	
	edit : function(){
		Utils.openSplitExperimentForm(this.model.get('id'));
	}
});

Views.ExperimentsListView = Views.BaseView.extend({
	events : {
	},
	
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		this.loadTemplate('experiments-list');
		
//		experiments.bind('add', this.add, this);
		experiments.bind('reset', this.addAll, this);
//		experiments.bind('all', this.render, this);
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		var data = {};
		if(this.options.filter){
			var q = '';
			_.each(this.options.filter, function(value, key, list){
				if(q != '') q += '___';
				q += key + ":eq:" + value;
			});
			data.q = q;
		}
		
		if(!data.q) data.q = 'isDisabled:eq:0';
		else data.q += '___isDisabled:eq:0';
		
		experiments.fetch({
			data : data
		});
	},
	
	close : function(){
		this._super('close');
		
		experiments.off();
		delete experiments;
	},
	
	render : function(){
		this.$el.html(this.template());
	},
	
	add : function(experiment){
		var view = new ExperimentView({model : experiment});
		this.$('#experiments-table-body').append(view.render().el);
	},
	
	addAll : function(){
		if(experiments.length == 0)
			this.$el.html("<h3>No Experiments found. <a id='create-experiment-btn' href='#'>Click Here</a> to create one.</h3>");
		else
			experiments.each(this.add);
	}
	
});