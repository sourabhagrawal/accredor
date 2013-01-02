Views.HeaderView = Views.BaseView.extend({
	isAuthenticated : function(){
		return $.cookie("isAuthenticated") == 1 ? true : false; 
	},
	
	render : function(){
		this.$el.html(this.template({
			auth : this.isAuthenticated(),
			filename : parseInt($.cookie("uid")) + 7615327
		}));
		eventBus.trigger('header_rendered');
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

eventBus.on('header_rendered', function(view){
	$('#login-btn').click(function(event){
		new Views.LoginBoxView();
	});
	
	$('#signup-btn').click(function(event){
		new Views.SignUpView();
	});
});

eventBus.on('open_login_box', function(){
	new Views.LoginBoxView();
});