var SplitVariation = Backbone.Model.extend({
	defaults : function(){
		var order = variations.length;
		var name = 'Variation #' + order;
		if(order == 0)
			name = "Control";
		return {
			isControl : order == 0 ? 1 : 0,
			order : order,
			name : name,
			percent : 0
		};
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
	
	isControl : function(){
		return this.get('isControl');
	},
	
	validate: function(attrs) {
		if(!attrs.name || attrs.name.trim() == ''){
			return 'Variation Name can not be blank';
		}
		if(!attrs.script || attrs.script.trim() == ''){
			return 'Variation URL can not be blank';
		}
		if(isNaN(attrs.percent)){
			return 'Enter a valid percent value. e.g. 50.0';
			return;
		}
		if(parseFloat(attrs.percent) + variations.percent(attrs.id) > 100){
			return 'Variations percent allocation exceeding 100%';
		}
	},
	
	error : function(model, error){
		if(error.status == 500){
			var data = $.parseJSON(error.responseText);
			this.set('status', {isError : true, message : data.message}, {silent : true});
		}else if(error.statusText != undefined){
			this.set('status', {isError : true, message : error.statusText}, {silent : true});
		}else{
			this.set('status', {isError : true, message : error}, {silent : true});
		}
	},
	
	synced : function(model, error){
		this.set('status', {isError : false});
	}
});

var SplitVariationList = Backbone.Collection.extend({
	model : SplitVariation,
	url : function(){
		return '/api/variations';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	},
	control : function(){
		return this.filter(function(variation){
			return variation.get('isControl');
		});
	},
	notControl : function(){
		return this.filter(function(variation){
			return !variation.get('isControl');
		});
	},
	percent : function(excludeId){
		var percent = 0.0;
		if(this.length > 0){
			this.each(function(model){
				if(model.id != excludeId)
					percent += parseFloat(model.get('percent'));
			});
		}
		return percent;
	}
});

var variations = new SplitVariationList();

Views.SplitVariationView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click .delete" : "destroy",
		"blur #name" : "save",
		"blur #script" : "save",
		"blur #percent" : "save"
	},
	
	initialize : function(){
		this._super('initialize');
		this.loadTemplate('experiments/split-variation');
		
		this.model.bind('destroy', this.remove, this);
//		this.model.bind('change', this.change, this);
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.render, this);
	},
	
	init : function(){
		this._super('init');
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
		if(this.model.isControl()){
			this.$el.find("#script").prop('disabled', true);
		}
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
		this.$el.find('a').prop('disabled' , true);
	},
	
	save : function(e){
		this.disable();
		
		var attr = e.target.id;
		var value = $(e.target).val();
		var params = {};
		params[attr] = value;
	    this.model.save(params);
	},
	
	error : function(model, error){
		this.render();
	}
});


Views.SplitVariationListView = Views.BaseView.extend({
	events : {
		"click #delete-all" : "deleteAll",
		"click .add" : 'create',
	},
	
	initialize : function(){
		this.$el = $("#variations-container");
		this._super('initialize');
		
		this.loadTemplate('experiments/variations-list');
		
		variations.off();
		variations.reset();
		
		variations.bind('add', this.add, this);
		variations.bind('reset', this.addAll, this);
//		variations.bind('all', this.render, this);
		
		eventBus.on('close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		if(this.options.experiment){
			this.experiment = this.options.experiment;
			
			var ref = this;
			if(this.options.create === true){
				this.create(function(model){
					ref.render();
				});
			}else{
				this.render();
			}
		}
	},
	
	render : function(){
		this.$el.html(this.template());
		
		this.name = this.$('#name');
		this.url = this.$('#url');
		
		if(this.experiment){
			variations.fetch({
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
		
		variations.off();
		variations.reset();
	},
	
	updateExperiment : function(experiment){
		this.experiment = experiment;
		
		this.updateControl();
	},
	
	updateControl : function(){
		var url = this.experiment.links[0].url;
		var control = variations.control();
		if(control.length > 0)
			control[0].save({script : url});
	},
	
	create : function(callback){
		if(this.experiment){
			var url = this.experiment.links[0].url;
			
			var options = {};
			if(callback && typeof callback == 'function') options.success = callback;
			variations.create({type : 'url', script : url, experimentId : this.experiment.id}, options);
		}
	},
	
	add : function(variation){
		var view = new Views.SplitVariationView({model : variation});
		this.$('#variations-list').append(view.render().el);
	},
	
	addAll : function(){
		variations.each(this.add);
	},
	
	deleteAll : function(){
		if(confirm("Are you sure you want to delete all variations?")){
			_.each(variations.notControl(), function(variation){
				variation.destroy();
			});
		}
	}
});