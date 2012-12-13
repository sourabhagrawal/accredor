var TaskView = Backbone.View.extend({
	tagName : "li",
	
	taskTemplate : _.template($('#task-template').html()),
	
	events : {
		"click .close" : "destroy",
		"click .toggle" : "toggleTask",
		"dblclick .checkbox" : "edit",
		"blur .edit" : "revert",
		"keypress .edit" : "save"
	},
	
	initialize : function(){
		this.model.bind('destroy', this.remove, this);
		this.model.bind('change', this.change, this);
	},
	
	render : function(){
		this.$el.html(this.taskTemplate(this.model.toJSON()));
		this.$el.toggleClass('done', this.model.get('done'));
		return this;
	},
	
	destroy : function(){
		this.model.clear();
	},
	
	change : function(){
		this.$el.html(this.taskTemplate(this.model.toJSON()));
		this.$el.toggleClass('done', this.model.get('done'));
	},
	
	edit : function(){
		this.$el.addClass("editing");
		this.$('.edit').focus();
	},
	
	revert : function(){
		this.$el.removeClass("editing");
	}
});