var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("goal_visits_impl");
var impl = require('./impl.js');
var dao = require(DAOS_DIR + 'goal_visits_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');

var GoalVisitsImpl = comb.define(impl, {
	instance : {
		displayName : "Goal Visit",
		constructor : function(options){
			options = options || {};
			options.dao = dao;
            this._super([options]);
		},
	},
	
	create : function(params, callback){
		var m = this._getSuper();
		
		// Goal Id should not be blank
		try{
			check(params['goalId']).notNull().isInt();
		}catch(e){
			callback(response.error(codes.error.GOAL_ID_NULL()));
			return;
		}
		
		// Visits should not be blank
		try{
			check(params['visits']).notNull().isInt();
		}catch(e){
			callback(response.error(codes.error.VISITS_NULL()));
			return;
		}
		
		// Visits should not be blank
		try{
			check(params['hits']).notNull().isInt();
		}catch(e){
			callback(response.error(codes.error.HITS_NULL()));
			return;
		}
		
		m.call(this, params, callback);
	}
});
module.exports = new GoalVisitsImpl();
