var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("users_dao");
var DAO = require('./dao.js');

var UsersDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Users";
            this._super([options]);
		}
	}
});

module.exports = new UsersDAO();
