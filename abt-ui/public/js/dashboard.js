$(function($){
	
	new Views.DashboardHeaderView();
	
	$('#dashboard-nav li').click(function(e){
		$('#dashboard-nav li.active').removeClass('active');
		$(this).addClass('active');
	});
	
	$('#dashboard-nav li ul li').click(function(e){
		$('#dashboard-nav .active').removeClass('active');
		$(this).addClass('active');
		e.stopPropagation();
	});
	
	Utils.openSplitExperimentForm = function(id){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("split-variation", "/templates/split-variation.html", function(data){
			new Views.SplitExperimentView({id : id});
		});
	};
	
	Utils.openSplitExperimentForm();
	
	$('#create-experiment').click(function(){
		Utils.openSplitExperimentForm();
	});
	
	Utils.openExperimentsListView = function(filter){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("experiment-row", "/templates/experiment-row.html", function(data){
			new Views.ExperimentsListView({filter : filter});
		});
	};
	
	
	$('#nav-experiments').click(function(){
		Utils.openExperimentsListView();
	});
	
	$('#nav-ready-experiments').click(function(){
		Utils.openExperimentsListView({status : 'created'});
	});
	
	$('#nav-running-experiments').click(function(){
		Utils.openExperimentsListView({status : 'started'});
	});
	
	$('#nav-stopped-experiments').click(function(){
		Utils.openExperimentsListView({status : 'stopped'});
	});
});