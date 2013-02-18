$(function($){
	
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
		var historyToken = Backbone.history.fragment;
		
		// Default page will be reports
		if(historyToken == 'dashboard'){
			historyToken = 'dashboard/reports';
		}
		
		var link = $('#dashboard-nav li a[data-href="' + historyToken + '"]');
		$('#dashboard-nav li.active i').removeClass('icon-white');
		$('#dashboard-nav .active').removeClass('active');
		link.parent('li').addClass('active');
		link.parent('li').children('i').addClass('icon-white');
//		e.stopPropagation();
	};
	
	var DashboardRouter = Backbone.Router.extend({
		
		initialize : function(options){
			/**
			 * (\/)? to ignore trailing slash
			 */
			
			// Reports 
			this.route(/^dashboard(\/)?$/, "openReports");
			this.route(/^dashboard\/reports(\/)?$/, "openReports");
			this.route(/^dashboard\/reports\/([0-9]+)(\/)?$/, "openExperimentReport");
			
			// Experiments
			this.route(/^dashboard\/experiments(\/)?$/, "listExperiments");
			this.route(/^dashboard\/experiments\/([a-z]+)(\/)?$/, "listFilteredExperiments");
			this.route(/^dashboard\/experiments\/create(\/)?$/, "openSplitExperimentForm");
			this.route(/^dashboard\/experiments\/([0-9]+)\/edit(\/)?$/, "openSplitExperimentForm");
			
			// Goals
			this.route(/^dashboard\/goals(\/)?$/, "listGoals");
			this.route(/^dashboard\/goals\/([a-z]+)(\/)?$/, "listFilteredGoals");
			this.route(/^dashboard\/goals\/create(\/)?$/, "openGoalForm");
		},
		
		openSplitExperimentForm: function(experimentId) {
			markLinks();
			Utils.openSplitExperimentForm(experimentId);
		},

		listExperiments: function() {
			markLinks();
			Utils.openExperimentsListView();
		},
		
		listFilteredExperiments: function(status) {
			markLinks();
			Utils.openExperimentsListView({status : status});
		},
		
		openGoalForm: function() {
			markLinks();
			Utils.openGoalForm();
		},

		listGoals: function() {
			markLinks();
			Utils.openGoalsListView();
		},
		
		listFilteredGoals: function(status) {
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