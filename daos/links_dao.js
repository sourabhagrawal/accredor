var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("links_dao");
var DAO = require('./dao.js');

var LinksDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Links";
            this._super([options]);
		}
	}
});

module.exports = new LinksDAO();
