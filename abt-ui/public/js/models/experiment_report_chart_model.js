Models.ExperimentReportChart = Backbone.Model.extend({
	defaults : function(){},
	
	urlRoot : function(){ return '/api/reports_data/time_series';},
	
	initialize : function(){},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}
		return response;
	}
});