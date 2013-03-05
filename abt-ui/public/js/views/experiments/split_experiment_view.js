var SplitExperiment = Backbone.Model.extend({
	defaults : function(){},
	
	urlRoot : function(){ return '/api/experiments/split_experiment';},
	
	initialize : function(){},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}else if(response.status && response.status != 1000){
			return response.message;
		}
		return response;
	}
});

Views.SplitExperimentView = Views.BaseView.extend({
	events : {
		"click #ok-btn" : "createOrUpdateExperiment",
		"click #primary-action" : "primaryAction",
		"click #delete-experiment-btn" : "deleteExperiment"
	},
	
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		
		if(this.options.id){
			this.id = this.options.id;
		}
		
		this.model = new SplitExperiment({id : this.id});
		
		this.model.bind('error', this.showError, this);
		this.model.bind('fetched', this.onFetch, this);
		this.model.bind('created', this.onCreate, this);
		this.model.bind('updated', this.onUpdate, this);
		this.model.bind('sync', this.onSync, this);
		
		this.loadTemplate('experiments/split-experiment');
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		if(this.id){
			this.model.fetch({
				success: function(model) {
					model.trigger('fetched');
				}
			});
		}else{
			this.render();
		}
	},
	
	onFetch : function(){
		this.render();
	},
	
	onCreate : function(){
		this.id = this.model.get('id');
		this.render(true);
	},
	
	onUpdate : function(){
		if(this.model.get('isDisabled') == 1){
			Comp.router.navigate(Utils.replaceUrlParams(ACC.LIST_EXPERIMENT_URL), {trigger: true});
			return;
		}else{
			this.variationsView.updateExperiment(this.model.toJSON());
		}
	},
	
	onSync : function(){
		this.id = this.model.get('id');
		this.render();
	},
	
	render : function(create){
		if(this.id)
			this.$el.html(this.template(this.model.toJSON()));
		else
			this.$el.html(this.template());
		
		
		this.name = this.$('#name');
		this.url = this.$('#url');
		this.alert = this.$('#split-variation-alert');
		this.okBtn = this.$('#ok-btn');
		
		if(this.id){
			this.variationsView = new Views.SplitVariationListView({experiment : this.model.toJSON(), create : create});
		}
	},
	
	close : function(){
		this._super('close');
	},
	
	showError : function(model, response){
		var resObj = JSON.parse(response.responseText);
		var msg = resObj.message;
		
		this.enable();
		
		this.alert.find('.alert').addClass('alert-error');
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
	
	primaryAction : function(){
		var status = this.model.get('status');
		var data = {};
		if(status == 'created')
			data.status = 'started';
		else if(status == 'started')
			data.status = 'stopped';
		else if(status == 'stopped')
			data.status = 'started';
		
		this.model.save(data);
	},
	
	deleteExperiment : function(){
		if(confirm("Are you sure you want to delete this Experiment?")){
			this.model.save({isDisabled : 1}, {
				success: function(model) {
					model.trigger('updated');
				}
			});
		}
	},
	
	createOrUpdateExperiment : function(){
		var data = {
			name : this.name.val(),
			type : 'splitter',
			links : [{
				url : this.url.val(),
				type : 'simple'
			}],
		};
		if(this.id){
			this.model.save(data, {
				success: function(model) {
					model.trigger('updated');
				}
			});
		}else{
			this.model.save(data, {
				success: function(model) {
					model.trigger('created');
				}
			});
		}
	}
});