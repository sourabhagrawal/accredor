$(function($){
	
	templateLoader.loadRemoteTemplate("reports/experiment-report", "/templates/reports/experiment-report.html");
	
	// Create Experiment
	Utils.openReports = function(){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("reports/experiment-report", "/templates/reports/experiment-report.html", function(data){
			new Views.ListReportsView();
		});
	};
	
	Utils.openExperimentReport = function(experimentId){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("reports/experiment-report", "/templates/reports/experiment-report.html", function(data){
			new Views.DetailExperimentReportView({experimentId : experimentId});
		});
	};
	
	// Create Experiment
	Utils.openSplitExperimentForm = function(id){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("experiments/split-variation", "/templates/experiments/split-variation.html", function(data){
			new Views.SplitExperimentView({id : id});
		});
	};
	
	// Create Goal
	Utils.openGoalForm = function(id){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("goals/goal-create", "/templates/goals/goal-create.html", function(data){
			new Views.CreateGoalView();
		});
	};
	
	// List experiments
	Utils.openExperimentsListView = function(filter){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("experiments/experiment-row", "/templates/experiments/experiment-row.html", function(data){
			new Views.ExperimentsListView({filter : filter});
		});
	};
	
	// List Goals
	Utils.openGoalsListView = function(filter){
		eventBus.trigger('close_view');
		templateLoader.loadRemoteTemplate("goals/goal-row", "/templates/goals/goal-row.html", function(data){
			new Views.GoalsListView({filter : filter});
		});
	};
	
	var markLinks = function(){
		var link = $('#dashboard-nav li a[data-href="' + Backbone.history.fragment + '"]');
		$('#dashboard-nav li.active i').removeClass('icon-white');
		$('#dashboard-nav .active').removeClass('active');
		link.parent('li').addClass('active');
		link.parent('li').children('i').addClass('icon-white');
//		e.stopPropagation();
	};
	
	var DashboardRouter = Backbone.Router.extend({
		routes: {
			"dashboard/experiments/create" : "openSplitExperimentForm",
			"dashboard/experiments" : "openExperimentsListView",
			"dashboard/experiments/:status" : "openExperimentsListView",
			"dashboard/goals/create" : "openGoalForm",
			"dashboard/goals" : "openGoalsListView",
			"dashboard/goals/:status" : "openGoalsListView",
			"dashboard/reports" : "openReports",
			"dashboard/reports/:experimentId" : "openExperimentReport"
		},

		openSplitExperimentForm: function() {
			markLinks();
			Utils.openSplitExperimentForm();
		},

		openExperimentsListView: function(status) {
			markLinks();
			Utils.openExperimentsListView({status : status});
		},
		
		openGoalForm: function() {
			markLinks();
			Utils.openGoalForm();
		},

		openGoalsListView: function(status) {
			markLinks();
			Utils.openGoalsListView({status : status});
		},
		
		openReports : function(){
			markLinks();
			Utils.openReports();
		},
		
		openExperimentReport : function(experimentId){
			markLinks();
			Utils.openExperimentReport(experimentId);
		}

	});
	
	var router = new DashboardRouter();
	
	Backbone.history.start({pushState: true});
	
	$('#dashboard-nav li a').click(function(e){
		e.stopPropagation();
		
		var href = $(this).data('href');
		router.navigate(href);
	});
});