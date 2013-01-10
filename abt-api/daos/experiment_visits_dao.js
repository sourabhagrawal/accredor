var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("experiment_visits_dao");
var DAO = require('./dao.js');

var ExperimentVisitsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "ExperimentVisits";
            this._super([options]);
		}
	}
});

module.exports = new ExperimentVisitsDAO();
