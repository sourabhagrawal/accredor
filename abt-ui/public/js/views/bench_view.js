var Variation = Backbone.Model.extend({
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

var VariationList = Backbone.Collection.extend({
	model : Variation,
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

var variations = new VariationList();

var VariationView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click #delete" : "destroy",
		"click #undo" : "undo",
		"click #redo" : "redo",
		"click #save" : "save",
		"click #script-btn" : "toggleScript"
	},
	
	initialize : function(){
		this._super('initialize');
		this.loadTemplate('experiments/ab-variation');
		
		this.model.bind('destroy', this.remove, this);
//		this.model.bind('change', this.change, this);
		this.model.bind('error', this.error, this);
		this.model.bind('sync', this.onUpdate, this);
	},
	
	init : function(){
		this._super('init');
	},
	
	onUpdate : function(){
		
	},
	
	render : function(){
		var json = this.model.toJSON();
		this.$el.html(this.template(json));
		this.$el.addClass("tab-pane");
		
		if(json.isControl == 1)
			this.$el.addClass("active");
		
		var id = json.experimentId + "-" + json.id;
		this.$el.attr('id', id);
		
		this.editor = CodeMirror(this.$("#code-box")[0], {
			mode:  "javascript",
			lineNumbers: true,
			matchBrackets: true,
			lineWrapping : true,
			height:0
		});
		
		this.editor.setSize(null, 0);
		
		this.codeContainer = this.$(".code-container" );
		this.codeContainer.resizable();
		
		var ref = this;
		this.frame = this.$("#content-frame")[0];
		this.$("#content-frame").ready(function(){  
			ref.$("#content-frame").load(function () {                        
//				ref.frame.contentWindow.location.href = ref.frame.src; // Some hack for Mozilla. needs to be tested
				ref.frame.contentWindow.applyCode(json.script);
            });
		});
		return this;
	},
	
	undo : function(){
		this.frame.contentWindow.stack.undo();
	},
	
	redo : function(){
		this.frame.contentWindow.stack.redo();
	},
	
	toggleScript : function(){
		var script = this.frame.contentWindow.stack.toScript();
		this.editor.setValue(script);
		
		this.codeContainer.css('height', 100 );
		this.editor.setSize(null, 100);
	},
	
	destroy : function(){
		this.model.destroy();
	},
	
	change : function(){
		this.render();
	},
	
	disable : function(){
	},
	
	save : function(e){
		this.disable();
		
		var params = {script : this.frame.contentWindow.stack.toScript()};
	    this.model.save(params);
	},
	
	error : function(model, error){
		this.render();
	}
});

Views.ABExperimentView = Views.BaseView.extend({
	events : {
		"click .add" : 'create',
	},
	
	initialize : function(){
		this.$el = $("#ab-experiment-bench");
		this._super('initialize');
		
		this.loadTemplate('experiments/ab-experiment');
		
		this.id = $.urlParam("experiment_id");;
		
		_.bindAll(this, 'add', 'addAll');
		variations.bind('add', this.add, this);
		variations.bind('reset', this.addAll, this);
//		variations.bind('all', this.render, this);
	},
	
	init : function(){
		this._super('init');
		
		this.render();
	},
	
	render : function(){
		var experimentId = this.id;
		
		if(experimentId){
			var ref = this;
			$.ajax({
				url : '/api/experiments/' + experimentId,
				type : 'GET',
				success : function(data, textStatus, jqXHR){
					ref.experiment = data.data;
					if(ref.experiment['type'] == 'abtest'){
						ref.$el.html(ref.template(ref.experiment));
						
						variations.fetch({
							data : {
								q : 'experimentId:eq:' + experimentId + '___isDisabled:eq:0',
								sortBy : 'id',
								sortDir : 'ASC'
							}
						});
					}else{
						ref.$el.html("Invalid Experiment Id");
					}
				},
				error : function(res, textStatus, errorThrown){
					if(res.status == 500){
						var data = $.parseJSON(res.responseText);
						ref.$el.html(data.message);
					}
				}
			});
		}else{
			this.$el.html('No Experiment Id');
		}
	},
	
	showError : function(msg){
		this.enable();
	},
	
	disable : function(){
	},
	
	enable : function(){
	},
	
	create : function(){
		variations.create({type : 'script', script : "", experimentId : this.id});
	},
	
	add : function(variation){
		console.log(variation);
		var view = new VariationView({model : variation});
		var json = variation.toJSON();
		
		var id = json.experimentId + "-" + json.id;
		var klass = json.isControl == 1 ? "first-tab active" : '';
		this.$("ul").append("<li class='" + klass + "'><a href='#" + id + "' data-toggle='tab'>" + json.name + "</a></li>");
		
		this.$('#variations-tabs').append(view.render().el);
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