var _ = require('underscore');
var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("emails_dao");
var DAO = require('./dao.js');

var EmailsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Emails";
            this._super([options]);
		},
		
		lockUpdate : function(filter, params){
			return this._model.forUpdate().first(filter).chain(function(email){
				if(email)
					return email.update(params);
				return;
			});
		}
	}
});

module.exports = new EmailsDAO();
