var comb = require('comb');
var _ = require('underscore');
var check = require('validator');
var logger = require(LIB_DIR + 'log_factory').create("contact_leads_impl");
var impl = require('./impl.js');
var contactLeadsDao = require(DAOS_DIR + 'contact_leads_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emails_impl = require('./emails_impl');

var ContactLeadsImpl = comb.define(impl,{
	instance : {
		displayName : "Contact Lead",
		constructor : function(options){
			options = options || {};
			options.dao = contactLeadsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var ref = this;
			var m = this._getSuper();
			
			// Type should not be blank
			if(check.isNull(params['email']) && !check.isEmail(params['email'])){
				callback(response.error(codes.error.NOT_VALID_EMAIL()));
				return;	
			}
			
			m.call(ref, params, function(err, data){
				if(err){
					callback(err);
				}else{
					var email = params['email'];
					var name = params['name'] || '<NOT_PROVIDED>';
					var message = params['message'] || '<NOT_PROVIDED>';
					
					var leadData = data;
					
					emails_impl.sendFromTemplate('support_lead_email.jade', 
							{
								email : email, 
								name : name,
								message : message
							}, 
							{
								to : DOMAIN_SUPPORT_ID,
								from : DOMAIN_SUPPORT_ID,
								subject : 'Contact lead from ' + email
							}, 
							function(err, data){
								if(err){
									logger.error(err);
								}else{
									callback(null, leadData);
								}
							});
				}
			});
		}
	}
});

module.exports = new ContactLeadsImpl();