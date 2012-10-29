var comb = require('comb');
var logger = require('./../lib/log_factory').create("experiments_dao");
var DAO = require('./dao.js');

var ExperimentsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Experiments";
            this._super([options]);
		}
	}
});

module.exports = new ExperimentsDAO();
