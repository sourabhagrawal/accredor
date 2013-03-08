var Link = Backbone.Model.extend({
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
		if(!attrs.url || attrs.url.trim() == ''){
			return 'Link URL can not be blank';
		}
		if(!attrs.type || attrs.type.trim() == ''){
			return 'Link Type can not be blank';
		}
	},
	
	error : function(model, error){
	},
	
	synced : function(model, error){
	}
});

var LinkList = Backbone.Collection.extend({
	model : Link,
	url : function(){
		return '/api/links';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var links = new LinkList();

Views.LinkView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click #delete" : "destroy",
		"blur #url" : "save",
		"blur #type" : "save",
	},
	
	initialize : function(){
		this._super('initialize');
		
		this.loadTemplate('experiments/link');
		
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change', this.change, this);
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.render, this);
		
		this.alert = $('#link-alert');
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
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
		this.disable();
		
		var attr = e.target.id;
		var value = $(e.target).val();
		var params = {};
		params[attr] = value;
	    this.model.save(params);
	},
	
	error : function(model, response){
		var resObj = JSON.parse(response.responseText);
		console.log(resObj);
		var msg = resObj.message;
		
		this.enable();
		
		this.alert.find('.alert').addClass('alert-error');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	}
});

Views.LinkListView = Views.BaseView.extend({
	events : {
		"click #add-url-btn" : 'create',
	},
	
	initialize : function(){
		this.$el = $("#links-container");
		this._super('initialize');
		
		this.experiment = this.options.experiment;
		
		this.loadTemplate('experiments/link-list');
		
		links.off();
		links.reset();
		
		links.bind('add', this.add, this);
		links.bind('reset', this.addAll, this);
		
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
			links.fetch({
				data : {
					q : 'experimentId:eq:' + this.experiment.id + '___isDisabled:eq:0',
					sortBy : 'id',
					sortDir : 'ASC',
					start : 1
				}
			});
		}
	},
	
	close : function(){
		this._super('close');
		
		links.off();
		links.reset();
	},
	
	create : function(callback){
		console.log('create');
		if(this.experiment){
			var url = this.experiment.links[0].url;
			
			var options = {};
			links.create({type : 'simple', url : url, experimentId : this.experiment.id}, options);
		}
	},
	
	add : function(link){
		var view = new Views.LinkView({model : link});
		$("#link-list-container").append(view.render().el);
	},
	
	addAll : function(){
		links.each(this.add);
	},
	
	deleteAll : function(){
		if(confirm("Are you sure you want to delete all links?")){
			_.each(links, function(link){
				link.destroy();
			});
		}
	}
});