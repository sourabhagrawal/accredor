$(function($){
	Views.GlobalHeaderView = Views.BaseView.extend({
		el : $("#global-header"),
		
		isAuthenticated : function(){
			return $.cookie("isAuthenticated") == 1 ? true : false; 
		},
		
		render : function(){
			this.$el.html(this.template({auth : this.isAuthenticated()}));
			eventBus.trigger('global_header_rendered');
			return this;
		},
		
		initialize : function(){
			this._super('initialize', this);
			
			this.loadTemplate('global-header');
			
			var ref = this;
			eventBus.on('logged_in', function(){
				ref.render();
			});
		},
		
		init : function(){
			this.render();
		}
	});
	
	new Views.GlobalHeaderView();
});