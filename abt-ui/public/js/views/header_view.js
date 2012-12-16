Views.HeaderView = Views.BaseView.extend({
	isAuthenticated : function(){
		return $.cookie("isAuthenticated") == 1 ? true : false; 
	},
	
	render : function(){
		this.$el.html(this.template({auth : this.isAuthenticated()}));
		eventBus.trigger('global_header_rendered');
		return this;
	},
	
	initialize : function(){
		this.$el = $("#global-header"),
		this._super('initialize', this);
	},
	
	init : function(){
		this.render();
	}
});