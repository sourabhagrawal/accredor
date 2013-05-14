$(function($){
	templateLoader.loadRemoteTemplate("experiments/ab-variation", "/templates/experiments/ab-variation.html", function(data){
		new Views.ABExperimentView();
	});
});
