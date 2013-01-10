var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("goal_visits_dao");
var DAO = require('./dao.js');

var GoalVisitsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "GoalVisits";
            this._super([options]);
		}
	}
});

module.exports = new GoalVisitsDAO();
