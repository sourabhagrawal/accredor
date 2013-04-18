var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("users_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var auditsDao = require(DAOS_DIR + 'audits_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var Bus = require(LIB_DIR + 'bus');

var AuditsImpl = comb.define(impl,{
	instance : {
		displayName : "Audit",
		constructor : function(options){
			options = options || {};
			options.dao = auditsDao;
			options.auditable = false;
			
            this._super([options]);
		},
		
		create : function(params, callback){
			var ref = this;
			var m = this._getSuper();
			
			// Entity Name should not be empty
			var entityName = params['entityName'];
			try{
				check(entityName).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FIELD_REQUIRED(['Entity Name'])));
				return;
			}
			
			// Action should not be empty
			var action = params['action'];
			try{
				check(action).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FIELD_REQUIRED(['Action'])));
				return;
			}
			
			// Entity Id should not be empty
			var entityId = params['entityId'];
			try{
				check(entityId).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FIELD_REQUIRED(['Entity Id'])));
				return;
			}
			
			// Field Name should not be empty
			var field = params['fieldName'];
			try{
				check(field).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FIELD_REQUIRED(['Field Name'])));
				return;
			}
			
			m.call(ref, params, function(err, data){
				if(err == undefined)
					callback(null, data);
				else
					callback(err);
			});
		}
	}
});

module.exports = new AuditsImpl();