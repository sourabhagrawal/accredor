var ExperimentReportList = Backbone.Collection.extend({
	model : Models.ExperimentReport,
	url : function(){
		return '/api/reports_data/cummulative';
	},
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return null;
	}
});

var reportsList = new ExperimentReportList();

Views.ExperimentReportView = Views.BaseView.extend({
	tagName : "div",
	
	initialize : function(){
		this._super('initialize');
		
		this.loadTemplate('reports/experiment-report');
		
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
		
		this.loadTemplate('reports/experiment-report-list');
		
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
		var view = new Views.ExperimentReportView({model : reportData});
		this.$('#experiment-report-list').append(view.render().el);
	},
	
	addAll : function(){
		if(reportsList.length == 0)
			this.$el.html("<h3>You do not have any active Experiments or Goals. " +
					"Create a new <a href='" + ACC.CREATE_EXPERIMENT_URL + "'>Experiment</a> " +
					"or <a href='" + ACC.CREATE_GOAL_URL + "'>Goal</a></h3>");
		else
			reportsList.each(this.add);
	},
	
	close : function(){
		this._super('close');
		
		reportsList.off();
		delete reportsList;
	}
});