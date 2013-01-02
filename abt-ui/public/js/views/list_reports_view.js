var ExperimentReport = Backbone.Model.extend({
	defaults : function(){},
	
	initialize : function(){},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
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

var ExperimentReportList = Backbone.Collection.extend({
	model : ExperimentReport,
	url : function(){
		return '/api/reports_data';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var reportsList = new ExperimentReportList();

var ExperimentReportView = Views.BaseView.extend({
	tagName : "div",
	
	initialize : function(){
		this._super('initialize');
		
		this.loadTemplate('experiment-report');
		
		this.model.bind('sync', this.render, this);
	},
	
	render : function(){
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

Views.ListReportsView = Views.BaseView.extend({
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		
		this.loadTemplate('experiment-report-list');
		
		reportsList.bind('reset', this.addAll, this);
		
		eventBus.on( 'close_view', this.close, this );
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		reportsList.fetch();
	},
	
	render : function(){
		this.$el.html(this.template());
	},
	
	add : function(reportData){
		var view = new ExperimentReportView({model : reportData});
		this.$('#experiment-report-list').append(view.render().el);
	},
	
	addAll : function(){
		reportsList.each(this.add);
	},
	
	close : function(){
		this._super('close');
		
		reportsList.off();
		delete reportsList;
	}
});