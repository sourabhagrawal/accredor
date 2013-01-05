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
//		this.bind('error', this.error, this);
//		this.bind('sync', this.synced, this);
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

Views.SplitExperimentView = Views.BaseView.extend({
	events : {
		"click #delete-all" : "deleteAll",
		"click #ok-btn" : "createOrUpdateExperiment",
		"click .add" : 'create',
		"click #primary-action" : "primaryAction",
		"click #delete-experiment-btn" : "deleteExperiment"
	},
	
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		this.loadTemplate('split-experiment');
		
		this.experimentUrl = '/api/experiments/split_experiment/';
		
		variations.bind('add', this.add, this);
		variations.bind('reset', this.addAll, this);
//		variations.bind('all', this.render, this);
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		if(this.options.id){
			this.id = this.options.id;
		}
		
		var ref = this;
		if(this.id){
			$.ajax({
				url : '/api/experiments/split_experiment/' + this.id,
				type : 'GET',
				success : function(data, textStatus, jqXHR){
					ref.experiment = data.data;
					ref.onGet();
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						ref.showError(data.message);
					}
				}
			});
		}else{
			this.onGet();
		}
	},
	
	onGet : function(){
		this.render();
	},
	
	render : function(){
		this.$el.html(this.template(this.experiment));
		
		this.name = this.$('#name');
		this.url = this.$('#url');
		this.alert = this.$('#split-variation-alert');
		this.okBtn = this.$('#ok-btn');
		
		if(this.id){
			this.$('#variations-container').show();
			
			variations.fetch({
				data : {
					q : 'experimentId:eq:' + this.id + '___isDisabled:eq:0',
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
	
	showError : function(msg){
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
		var status = this.experiment['status'];
		var data = {};
		if(status == 'created')
			data.status = 'started';
		else if(status == 'started')
			data.status = 'stopped';
		else if(status == 'stopped')
			data.status = 'started';
		
		this.persistExperiment(this.experimentUrl + this.id, 'put', data, true);
	},
	
	deleteExperiment : function(){
		if(confirm("Are you sure you want to delete this Experiment?")){
			this.persistExperiment(this.experimentUrl + this.id, 'put', {isDisabled : 1}, true);
		}
	},
	
	createOrUpdateExperiment : function(){
		var data = {
			name : this.name.val(),
			url : this.url.val(),
			type : 'splitter'
		};
		if(this.id){
			this.persistExperiment(this.experimentUrl + this.id, 'put', data, true);
		}else{
			this.persistExperiment(this.experimentUrl, 'post', data, false);
		}
		
	},
	
	persistExperiment : function(url, method, data, isUpdate){
		this.disable();
		
		var ref = this;
		$.ajax({
			url : url,
			type : method,
			data : data,
			success : function(data, textStatus, jqXHR){
				ref.id = data.data.id;
				ref.experiment = data.data;
				
				if(!isUpdate)
					ref.create();
				else{
					if(ref.experiment['isDisabled'] == 1){
						$('#nav-experiments').click();
						return;
					}else
						ref.updateControl();
				}
				
				ref.render();
			},
			error : function(res, textStatus, errorThrown){
				if(res.status == 500){
					var data = $.parseJSON(res.responseText);
					ref.showError(data.message);
				}
			}
		});
	},
	
	updateControl : function(){
		var url = this.url.val();
		var control = variations.control();
		if(control.length > 0)
			control[0].set({script : url});
	},
	
	create : function(){
		if(this.id){
			var url = this.url.val();
			variations.create({type : 'url', script : url, experimentId : this.id});
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