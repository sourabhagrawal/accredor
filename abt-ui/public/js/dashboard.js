$(function($){
	
	/**
	 * Highlight the right list item
	 */
	$('#dashboard-nav li').click(function(e){
		$('#dashboard-nav li.active i').removeClass('icon-white');
		$('#dashboard-nav li.active').removeClass('active');
		$(this).addClass('active');
		$(this).children('i').addClass('icon-white');
	});
	
	$('#dashboard-nav li ul li').click(function(e){
		$('#dashboard-nav li.active i').removeClass('icon-white');
		$('#dashboard-nav .active').removeClass('active');
		$(this).addClass('active');
		$(this).children('i').addClass('icon-white');
		e.stopPropagation();
	});
	
	// Create Experiment
	Utils.openReports = function(){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("experiment-report", "/templates/experiment-report.html", function(data){
			new Views.ListReportsView();
		});
	};
	
	$('#reports').click(function(){
		Utils.openReports();
	});
	
	Utils.openReports();
	
	// Create Experiment
	Utils.openSplitExperimentForm = function(id){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("split-variation", "/templates/split-variation.html", function(data){
			new Views.SplitExperimentView({id : id});
		});
	};
	
	$('#create-experiment').click(function(){
		Utils.openSplitExperimentForm();
	});
	
	$('#dashboard-content').on('click', '#create-experiment-btn', function(){
		$('#create-experiment').click();
	});
	
	// Create Goal
	Utils.openGoalForm = function(id){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("goal-create", "/templates/goal-create.html", function(data){
			new Views.CreateGoalView();
		});
	};
	
	$('#create-goal').click(function(){
		Utils.openGoalForm();
	});
	
	$('#dashboard-content').on('click', '#create-goal-btn', function(){
		$('#create-goal').click();
	});
	
	// List experiments
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
	
	// List Goals
	Utils.openGoalsListView = function(filter){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("goal-row", "/templates/goal-row.html", function(data){
			new Views.GoalsListView({filter : filter});
		});
	};
	
	$('#nav-goals').click(function(){
		Utils.openGoalsListView();
	});
	
	$('#nav-active-goals').click(function(){
		Utils.openGoalsListView({status : 'created'});
	});
	
	$('#nav-disabled-goals').click(function(){
		Utils.openGoalsListView({status : 'stopped'});
	});
});