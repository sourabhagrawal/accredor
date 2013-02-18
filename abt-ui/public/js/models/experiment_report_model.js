Models.ExperimentReport = Backbone.Model.extend({
	defaults : function(){},
	
	urlRoot : function(){ return '/api/reports_data/cummulative';},
	
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