$(function($){
	
	new Views.DashboardHeaderView();
	
	templateLoader.loadRemoteTemplate("split-variation", "/templates/split-variation.html", function(data){
		new Views.SplitExperimentView();
	});
});