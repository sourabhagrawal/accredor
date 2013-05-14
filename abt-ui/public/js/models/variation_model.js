Models.Variation = Backbone.Model.extend({
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
		this.bind('error', this.error, this);
		this.bind('sync', this.synced, this);
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

Lists.VariationList = Backbone.Collection.extend({
	model : Models.Variation,
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