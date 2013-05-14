Models.Experiment = Backbone.Model.extend({
	urlRoot : function(){ return '/api/experiments';},
	
	initialize : function(){},
	
	parse : function(response){
		if(response.status && response.status.code == 1000){
			return response.data;
		}else if(response.status && response.status != 1000){
			return response.message;
		}
		return response;
	}
});