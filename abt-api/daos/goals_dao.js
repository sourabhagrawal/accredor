var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("goals_dao");
var DAO = require('./dao.js');

var GoalsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Goals";
            this._super([options]);
		}
	}
});

module.exports = new GoalsDAO();
