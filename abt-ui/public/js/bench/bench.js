$(function($){
	templateLoader.loadRemoteTemplate("ab-variation", "/templates/ab-variation.html", function(data){
		new Views.ABExperimentView();
	});
});
