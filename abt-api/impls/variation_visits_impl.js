var comb = require('comb');
var _ = require('underscore');
var check = require('validator');
var logger = require(LIB_DIR + 'log_factory').create("variation_visits_impl");
var impl = require('./impl.js');
var dao = require(DAOS_DIR + 'variation_visits_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');

var VariationVisitsImpl = comb.define(impl, {
	instance : {
		displayName : "Variation Visit",
		constructor : function(options){
			options = options || {};
			options.dao = dao;
            this._super([options]);
		},
	},
	
	create : function(params, callback){
		var m = this._getSuper();
		
		// Variation Id should not be blank
		if(check.isNull(params['variationId']) || !check.isInt(params['variationId'])){
			callback(response.error(codes.error.VARIATION_ID_NULL()));
			return;	
		}
		
		// Visits should not be blank
		if(check.isNull(params['visits']) || !check.isInt(params['visits'])){
			callback(response.error(codes.error.VISITS_NULL()));
			return;
		}
		
		m.call(this, params, callback);
	}
});
module.exports = new VariationVisitsImpl();
