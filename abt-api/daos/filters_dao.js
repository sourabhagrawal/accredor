var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("filters_dao");
var DAO = require('./dao.js');

var FiltersDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Filters";
            this._super([options]);
		}
	}
});

module.exports = new FiltersDAO();
