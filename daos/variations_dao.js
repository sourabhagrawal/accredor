var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("variations_dao");
var DAO = require('./dao.js');

var VariationsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Variations";
            this._super([options]);
		}
	}
});

module.exports = new VariationsDAO();
