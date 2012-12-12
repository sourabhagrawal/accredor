$(function($){
	var GlobalHeaderView = Backbone.View.extend({
		el : $("#global-header"),
		
		template : _.template($('#global-header-template').html()),
		
		events : {
		},
		
		isAuthenticated : function(){
			return $.cookie("isAuthenticated") == 1 ? true : false; 
		},
		
		render : function(){
			this.$el.html(this.template({auth : this.isAuthenticated()}));
//			this.$el.find('.btn-toolbar').append('<a class="btn btn-primary", id="login-btn">LOGIN</a>');
//			this.$el.find('.btn-toolbar').append('<a class="btn btn-success", id="signup-btn">SIGNUP</a>');
			eventBus.trigger('global_header_rendered');
			return this;
		},
		
		initialize : function(){
			this.render();
			
			var ref = this;
			eventBus.on('logged_in', function(){
				console.log("event heard");
				ref.render();
			});
		}
	});
	
	new GlobalHeaderView();
});