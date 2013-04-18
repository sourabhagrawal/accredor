var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("filters_impl");
var impl = require('./impl.js');
var filtersDao = require(DAOS_DIR + 'filters_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emitter = require(LIB_DIR + 'emitter');

var FiltersImpl = comb.define(impl,{
	instance : {
		displayName : "Filter",
		constructor : function(options){
			options = options || {};
			options.dao = filtersDao;
			options.auditableFields = ['name', 'value', 'type', 'isDisabled'];
			
            this._super([options]);
		},
		
		create : function(params, callback){
			var m = this._getSuper();
			
			// User ID should not be valid
			var userId = params['userId'];
			try{
				check(userId).notNull().notEmpty().isInt();
			}catch(e){
				callback(response.error(codes.error.VALID_USER_REQUIRED()));
				return;
			}
			
			// Type should not be blank
			try{
				check(params['type']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FILTER_TYPE_REQUIRED()));
				return;
			}
			
			// Name should not be blank
			try{
				check(params['name']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FILTER_NAME_REQUIRED()));
				return;
			}
			
			// Value should not be blank
			try{
				check(params['value']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.FILTER_VALUE_REQUIRED()));
				return;
			}
			
			m.call(this, params, callback);
			
			// Mark script old for the user
			emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
		},
		
		update : function(id, params, callback){
			var m = this._getSuper();
			
			// User ID should not be valid
			var userId = params['userId'];
			try{
				check(userId).notNull().notEmpty().isInt();
			}catch(e){
				callback(response.error(codes.error.VALID_USER_REQUIRED()));
				return;
			}
			
			if(params['value']){
				// Value should not be blank
				try{
					check(params['value']).notNull().notEmpty();
				}catch(e){
					callback(response.error(codes.error.FILTER_VALUE_REQUIRED()));
					return;
				}
			}
			
			m.call(this, id, params, callback);
			
			// Mark script old for the user
			emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
		}
	}
});

module.exports = new FiltersImpl();