var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("variations_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var variationsDao = require(DAOS_DIR + 'variations_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');

var VariationsImpl = comb.define(impl,{
	instance : {
		displayName : "Variation",
		constructor : function(options){
			options = options || {};
			options.dao = variationsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var ref = this;
			var m = this._getSuper();
			this.search(function(err,data){
				// If error occurred
				if(err){
					callback(err);
					return;
				}
				
				if(data && data.totalCount > 0){ // Records with same Experiment Id and Name can not exist 
					callback(response.error(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS()));
				}else{
					m.call(ref, params, callback);
				}
			}, 'experimentId:eq:' + params.experimentId + '___name:eq:' + params.name);
		},
		
		update : function(id, params, callback){
			var ref = this;
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				var m = this._getSuper();
				
				this._dao.getById(id).then(function(model){
					if(model == undefined){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
					}else{
						ref.search(function(err,data){
							// If error occurred
							if(err){
								callback(err);
								return;
							}
							
							if(data && data.totalCount > 0){ // Records with same User Id and Name can not exist 
								callback(response.error(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS()));
							}else{
								m.call(ref, id, params, callback);
							}
						}, 'experimentId:eq:' + (params.experimentId || model.experimentId) + '___name:eq:' + (params.name || model.name));
					}
				}, function(error){
					callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
				});
			}
			
		}
	}
});

module.exports = new VariationsImpl();