var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("transitions_dao");
var DAO = require('./dao.js');

var TransitionsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Transitions";
            this._super([options]);
		}
	}
});

module.exports = new TransitionsDAO();
