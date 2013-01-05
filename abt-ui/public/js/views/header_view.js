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
	Utils.openLoginBox = function(){
		new Views.LoginBoxView();
	};
	
	$('#login-btn').click(function(event){
		Utils.openLoginBox();
	});
	
	Utils.openSignupBox = function(){
		new Views.SignUpView();
	};
	
	$('#signup-btn').click(function(event){
		Utils.openSignupBox();
	});
});

eventBus.on('open_login_box', function(){
	new Views.LoginBoxView();
});