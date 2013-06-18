var variations = new Lists.VariationList();

var VariationView = Views.BaseView.extend({
	tagName : "div",
	
	events : {
		"click #delete" : "destroy",
		"click #undo" : "undo",
		"click #redo" : "redo",
		"click #reset" : "reset",
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
				if(ref.frame.contentWindow){
//					ref.frame.contentWindow.location.href = ref.frame.src; // Some hack for Mozilla. needs to be tested
					ref.frame.contentWindow.applyCode(json.script);
				}
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
	
	reset : function(){
		this.frame.contentWindow.stack.reset();
	},
	
	toggleScript : function(){
		var script = JSON.parse(this.frame.contentWindow.stack.toScript())['fn'].join('\n');
		this.editor.setValue(script);
		
		this.codeContainer.css('display', 'block' );
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

var VariationsView = Views.BaseView.extend({
	events : {
		"click .add" : 'create'
	},
	
	initialize : function(){
		this.$el = $("#variations-tabs");
		this._super('initialize');
		
		this.loadTemplate('experiments/ab-variations');
		
		if(this.options.id){
			this.id = this.options.id;
			this.experimentUrl = this.options.experimentUrl;
		}
		
		_.bindAll(this, 'add', 'addAll');
		variations.bind('add', this.add, this);
		variations.bind('reset', this.addAll, this);
//		variations.bind('all', this.render, this);
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		if(this.id){
			variations.fetch({
				data : {
					q : 'experimentId:eq:' + this.id + '___isDisabled:eq:0',
					sortBy : 'id',
					sortDir : 'ASC'
				}
			});
		}
	},
	
	render : function(){
		this.$el.html(this.template());
	},
	
	create : function(){
		variations.create({type : 'script', script : "", experimentId : this.id});
	},
	
	add : function(variation){
		if(this.experimentUrl){
			variation.set('experimentUrl', this.experimentUrl);

			var view = new VariationView({model : variation});
			var json = variation.toJSON();
			
			var id = json.experimentId + "-" + json.id;
			var klass = json.isControl == 1 ? "first-tab active" : '';
			this.$("ul").append("<li class='" + klass + "'><a href='#" + id + "' data-toggle='tab'>" + json.name + "</a></li>");
			
			this.$('#variations-tabs').append(view.render().el);
		}
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

Views.ABExperimentView = Views.BaseView.extend({
	events : {
		"click #experiment-name-edit" : 'editName',
		"click #experiment-name-controls > button" : 'updateName'
	},
	
	initialize : function(){
		this.$el = $("#experiment-header");
		this._super('initialize');
		
		this.loadTemplate('experiments/ab-experiment');
		
		this.id = $.urlParam("experiment_id");
		
		this.model = new Models.Experiment({id : this.id});
		this.model.bind('fetched', this.onFetch, this);
		this.model.bind('sync', this.onSync, this);
	},
	
	init : function(){
		this._super('init');
		
		this.model.fetch({
			success: function(model) {
				model.trigger('fetched');
			}
		});
	},
	
	onFetch : function(){
		this.render();
		
		if(this.id){
			new VariationsView({id : this.id, experimentUrl : this.experimentUrl});
		}
	},
	
	onSync : function(){
		this.render();
	},
	
	render : function(){
		var json = this.model.toJSON();
		this.$el.html(this.template(json));
		
		this.experimentUrl = json['links'][0]['url'];
		this.experimentNameLabel = this.$('#experiment-name-label');
		this.experimentNameControls = this.$('#experiment-name-controls');
		this.experimentNameTextBox = this.$('#experiment-name-text');
	},
	
	disable : function(){
	},
	
	enable : function(){
	},
	
	editName : function(){
		this.experimentNameLabel.hide();
		
		this.experimentNameTextBox.val(this.model.get('name'));
		this.experimentNameControls.show();
	},
	
	updateName : function(){
		this.model.save({name : this.experimentNameTextBox.val()});
	}
});