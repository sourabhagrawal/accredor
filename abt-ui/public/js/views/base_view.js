Views.BaseView = Backbone.View.extend({
	render : function(params){
		this.$el.html(this.template(params));
		return this;
	},
	
	loadTemplate : function(name, callback){
		var ref = this;
		templateLoader.loadRemoteTemplate(name, "/templates/" + name + ".html", function(data) {
			ref.template =  _.template(data);
			ref.trigger('template_loaded');
		});
	},
	
	init : function(){
//		console.log('template_loaded');
	},
	
	initialize : function(){
		this.bind('template_loaded', this.init, this);
	},
	
	close: function() {
        // Unregister for event to stop memory leak
        eventBus.off( 'close_view', this.close, this );
//        this.remove();
        this.undelegateEvents();
//        this.views = [];   // Clear the view array
    }
});