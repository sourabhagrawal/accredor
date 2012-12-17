var SplitVariation = Backbone.Model.extend({
	defaults : function(){
		var order = variations.nextOrder();
		var name = 'Variation #' + (order - 1);
		if(order == 1)
			name = "Control";
		return {
			isControl : 0,
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
		return null;
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
		if(parseFloat(attrs.percent) + variations.percent() > 100){
			return 'Variations percent allocation exceeding 100%';
		}
	},
	
	error : function(model, error){
		console.log(error);
		if(error.status == 500){
			var data = $.parseJSON(error.responseText);
			this.set('status', {isError : true, message : data.message});
		}else{
			this.set('status', {isError : true, message : error.statusText});
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
	nextOrder : function(){
		if(this.length == 0) return 1;
		return this.last().get('order') + 1;
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
	percent : function(){
		var percent = 0.0;
		if(this.length > 0){
			this.each(function(model){
				percent += parseFloat(model.get('percent'));
			});
		}
		return percent;
	}
});

var variations = new SplitVariationList();

var SplitVariationView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click .delete" : "destroy",
		"blur #name" : "save",
		"blur #script" : "save",
		"blur #percent" : "save"
	},
	
	initialize : function(){
		this._super('initialize');
		this.loadTemplate('split-variation');
		
		this.model.bind('destroy', this.remove, this);
//			this.model.bind('change', this.change, this);
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
	
	save : function(e){
		var attr = e.target.id;
		var value = $(e.target).val();
		var params = {};
		params[attr] = value;
	    this.model.save(params);
	},
	
	error : function(model, error){
		console.log(error);
		this.render();
	}
});

Views.SplitExperimentView = Views.BaseView.extend({
	events : {
		"click #delete-all" : "deleteAll",
		"click #ok-btn" : "createOrUpdateExperiment",
		"click .add" : 'create'
	},
	
	initialize : function(){
		this.$el = $("#split-experiment");
		this._super('initialize');
		this.loadTemplate('split-experiment');
		
		variations.bind('add', this.add, this);
//			variations.bind('reset', this.addAll, this);
//			variations.bind('all', this.render, this);
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		this.okBtn = this.$('#ok-btn');
		
		this.name = this.$('#name');
		this.url = this.$('#ex_url');
		this.alert = this.$('#split-variation-alert');
	},
	
	render : function(){
		this.$el.html(this.template(this.experiment));
		
		if(this.id)
			this.$('#variations-container').show();
	},
	
	showError : function(msg){
		this.alert.find('.alert').addClass('alert-error');
		this.alert.find('.alert').html(msg);
		this.alert.show();
	},
	
	createOrUpdateExperiment : function(){
		var url = '/api/experiments/';
		var data = {
			name : this.name.val(),
			url : this.url.val()
		};
		if(this.id){
			this.persistExperiment(url + this.id, 'put', data, true);
		}else{
			this.persistExperiment(url, 'post', data, false);
		}
		
	},
	
	persistExperiment : function(url, method, data, isUpdate){
		var ref = this;
		$.ajax({
			url : url,
			type : method,
			data : data,
			success : function(data, textStatus, jqXHR){
				ref.id = data.data.id;
				ref.experiment = data.data;
				ref.render();
				ref.createControl(isUpdate);
			},
			error : function(res, textStatus, errorThrown){
				if(res.status == 500){
					var data = $.parseJSON(res.responseText);
					ref.showError(data.message);
				}
			}
		});
	},
	
	createControl : function(isUpdate){
		if(!isUpdate){
			var url = this.url.val();
			var control = variations.control();
			if(control.length == 0)
				variations.create({isControl : 1, type : 'URL', script : url, experimentId : this.id});
			else{
				control[0].set({script : url});
			}
		}
	},
	
	create : function(){
		if(this.id){
			var url = this.url.val();
			variations.create({script : url, type : 'URL', experimentId : this.id});
		}
	},
	
	add : function(variation){
		var view = new SplitVariationView({model : variation});
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