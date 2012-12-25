var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("script_details_dao");
var DAO = require('./dao.js');

var ScriptDetailsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "ScriptDetails";
            this._super([options]);
		}
	}
});

module.exports = new ScriptDetailsDAO();
