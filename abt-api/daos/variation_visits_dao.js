var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("variation_visits_dao");
var DAO = require('./dao.js');

var VariationVisitsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "VariationVisits";
            this._super([options]);
		}
	}
});

module.exports = new VariationVisitsDAO();
