Views.DashboardHeaderView = Views.HeaderView.extend({
	initialize : function(){
		this._super('initialize', this);
		
		this.loadTemplate('dashboard-header');
	}
});