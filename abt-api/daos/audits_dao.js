var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("audits_dao");
var DAO = require('./dao.js');

var AuditsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Audits";
            this._super([options]);
		}
	}
});

module.exports = new AuditsDAO();
