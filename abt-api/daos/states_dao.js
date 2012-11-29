var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("states_dao");
var DAO = require('./dao.js');

var StatesDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "States";
            this._super([options]);
		}
	}
});

module.exports = new StatesDAO();
