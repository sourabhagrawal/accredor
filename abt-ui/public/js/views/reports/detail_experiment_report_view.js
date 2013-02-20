Views.DetailExperimentReportView = Views.BaseView.extend({
	initialize : function(){
		this.$el = $("#dashboard-content");
		this._super('initialize');
		
		this.loadTemplate('reports/detail-experiment-report');
		
		this.experimentId = this.options.experimentId;
		
		this.tableModel = new Models.ExperimentReport({id : this.experimentId});
		
		this.tableModel.bind('error', this.error, this);
		this.tableModel.bind('change', this.addTable, this);

		this.chartModel = new Models.ExperimentReportChart({id : this.experimentId});
		
		this.chartModel.bind('error', this.error, this);
		this.chartModel.bind('change', this.addChart, this);
	},
	
	init : function(){
		this._super('init');
		
		this.render();
		
		if(this.experimentId){
			this.tableModel.fetch();
			this.chartModel.fetch();
		}
	},
	
	render : function(reportData){
		this.$el.html(this.template());
		
		return this;
	},
	
	error : function(){
		console.log("Error");
	},
	
	addTable : function(reportData){
		var view = new Views.ExperimentReportView({model : reportData});
		this.$('#experiment-report-table').append(view.render().el);
	},
	
	addChart : function(reportData){
		console.log(reportData.toJSON());
		
		var data = reportData.toJSON();
		_.each(data.goals, function(goal){
			var goalId = goal.id;
			var goalName = goal.name;
			
			var pointsData = [];
			_.each(data.variations, function(variation){
				var variationId = variation.id;
				var varationName = variation.name;
				
				var points = variation.goals[goalId];
				pointsData.push({label : varationName,data : points});
			});
			
			$('<h4> Hits - ' + goalName + '</h4>').appendTo("#experiment-report-chart");
			var div = $('<div style="height:200px;"></div>').appendTo("#experiment-report-chart");
			
			var plot = $.plot(div, pointsData, {
			    series: {
			        lines: { show: true },
			        points: { show: true }
			    },
			    
			    xaxis : {
			    	label : 'Time',
			    	mode : 'time',
			    	timezone : 'browser'
			    }
			});
		});
	}
});