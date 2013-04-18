var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("experiment_visits_impl");
var impl = require('./impl.js');
var dao = require(DAOS_DIR + 'experiment_visits_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');

var ExperimentVisitsImpl = comb.define(impl, {
	instance : {
		displayName : "Experiment Visit",
		constructor : function(options){
			options = options || {};
			options.dao = dao;
			options.auditable = false;
			
            this._super([options]);
		},
	},
	
	create : function(params, callback){
		var m = this._getSuper();
		
		// Experiment Id should not be blank
		try{
			check(params['experimentId']).notNull().isInt();
		}catch(e){
			callback(response.error(codes.error.EXPERIMENT_ID_NULL()));
			return;
		}
		
		// Visits should not be blank
		try{
			check(params['visits']).notNull().isInt();
		}catch(e){
			callback(response.error(codes.error.VISITS_NULL()));
			return;
		}
		
		m.call(this, params, callback);
	}
});
module.exports = new ExperimentVisitsImpl();
