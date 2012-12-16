Views.GlobalHeaderView = Views.HeaderView.extend({
	initialize : function(){
		this._super('initialize', this);
		
		this.loadTemplate('global-header');
	}
});