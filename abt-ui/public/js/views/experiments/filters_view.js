var Filter = Backbone.Model.extend({
	defaults : function(){
	},
	
	initialize : function(){
		this.bind('error', this.error, this);
		this.bind('sync', this.synced, this);
	},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
	},
	
	validate: function(attrs) {
		if(!attrs.type || attrs.type.trim() == ''){
			return 'Filter Type can not be blank';
		}
		if(!attrs.name || attrs.name.trim() == ''){
			return 'Filter Name can not be blank';
		}
		if(!attrs.value || attrs.value.trim() == ''){
			return 'Filter Value can not be blank';
		}
	},
	
	error : function(model, error){
	},
	
	synced : function(model, error){
	}
});

var FilterList = Backbone.Collection.extend({
	model : Filter,
	url : function(){
		return '/api/filters';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var filters = new FilterList();

Views.FilterView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click #delete" : "destroy",
		"click #save" : "save",
		"blur select" : "save",
		"blur input" : "save",
	},
	
	initialize : function(){
		this._super('initialize');
		
		this.loadTemplate('experiments/filter');
		
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change', this.change, this);
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.render, this);
		
		this.alert = $('#filter-alert');
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
		
		this.name = this.$('#name');
		this.type = this.$('#type');
		this.value = this.$('#value');
		
		return this;
	},
	
	destroy : function(){
		this.model.destroy();
	},
	
	change : function(){
		this.render();
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
	
	save : function(e){
		if(this.model.id){
			this.disable();
			
			var attr = e.target.id;
			var value = $(e.target).val();
			var params = {};
			params[attr] = value;
		    this.model.save(params);
		}else{
			var params = {
				name : this.name.val(),
				type : this.type.val(),
				value : this.value.val()
			};
			this.model.save(params);
		}
	},
	
	error : function(model, response){
		var resObj = JSON.parse(response.responseText);
		var msg = resObj.message;
		
		this.enable();
		
		this.alert.find('.alert').addClass('alert-error');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	}
});

Views.FilterListView = Views.BaseView.extend({
	events : {
		"click #add-url-btn" : 'create',
	},
	
	initialize : function(){
		this.$el = $("#filters-container");
		this._super('initialize');
		
		this.experiment = this.options.experiment;
		
		this.loadTemplate('experiments/filter-list');
		
		filters.off();
		filters.reset();
		
		filters.bind('add', this.add, this);
		filters.bind('reset', this.addAll, this);
		
		eventBus.on('close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		this.render();
	},
	
	
	render : function(){
		this.$el.html(this.template());
		
		this.url = this.$('#url');
		this.type = this.$('#type');
		
		if(this.experiment){
			filters.fetch({
				data : {
					q : 'experimentId:eq:' + this.experiment.id + '___isDisabled:eq:0',
					sortBy : 'id',
					sortDir : 'ASC'
				}
			});
		}
	},
	
	close : function(){
		this._super('close');
		
		filters.off();
		filters.reset();
	},
	
	create : function(callback){
		if(this.experiment){
			var filter = new Filter({experimentId : this.experiment.id}, {collection : filters});
			this.add(filter);
//			var options = {};
//			filters.create({type : 'simple', url : url, experimentId : this.experiment.id}, options);
		}
	},
	
	add : function(filter){
		var view = new Views.FilterView({model : filter});
		$("#filter-list-container").append(view.render().el);
	},
	
	addAll : function(){
		filters.each(this.add);
	},
	
	deleteAll : function(){
		if(confirm("Are you sure you want to delete all filters?")){
			_.each(filters, function(filter){
				filter.destroy();
			});
		}
	}
});