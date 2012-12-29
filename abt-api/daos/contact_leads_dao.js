var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("contact_leads_dao");
var DAO = require('./dao.js');

var ContactLeadsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "ContactLeads";
            this._super([options]);
		}
	}
});

module.exports = new ContactLeadsDAO();
