var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("variations_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var variationsDao = require(DAOS_DIR + 'variations_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var Bus = require(LIB_DIR + 'bus');

var VariationsImpl = comb.define(impl,{
	instance : {
		displayName : "Variation",
		constructor : function(options){
			options = options || {};
			options.dao = variationsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			// Name should not be blank
			try{
				check(params['name']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.VARIATION_NAME_REQUIRED()));
				return;
			}
			
			// Type should not be blank
			try{
				check(params['type']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.VARIATION_TYPE_REQUIRED()));
				return;
			}
			
			bus.on('start', function(){
				ref.search(function(err,data){
					// If error occurred
					if(err){
						callback(err);
						return;
					}
					
					if(data && data.totalCount > 0){ // Records with same Experiment Id and Name can not exist 
						callback(response.error(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS()));
					}else{
						bus.fire('noDuplicates');
					}
				}, 'experimentId:eq:' + params.experimentId + '___name:eq:' + params.name + '___isDisabled:eq:0');
			});
			
			bus.on('noDuplicates', function(){
				if(params.isControl == 1){
					ref.search(function(err,data){
						// If error occurred
						if(err){
							callback(err);
							return;
						}
						
						if(data && data.totalCount > 0){ // Control already exists
							callback(response.error(codes.error.VARIATION_CONTROL_EXISTS()));
						}else{
							bus.fire('controlCheck');
						}
					}, 'experimentId:eq:' + params.experimentId + '___isControl:eq:1');
				}else{
					bus.fire('controlCheck');
				}
			});
			
			bus.on('controlCheck', function(){
				m.call(ref, params, callback);
			});
			
			bus.fire('start');
		},
		
		update : function(id, params, callback){
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				var bus = new Bus();
				
				var ref = this;
				var m = this._getSuper();
				
				bus.on('start', function(){
					ref.getById(id, function(err, data){
						if(err){
							callback(err);
						}else{
							bus.fire('modelFound', data.data);
						}
					});
				});
				
				bus.on('modelFound', function(model){
					if(params.experimentId && params.experimentId != model.experimentId){
						// Can't change the experiment id of a variation
						callback(response.error(codes.error.VARIATION_EXPERIMENT_ID_CANT_UPDATE()));
						return;
					}
					if(params.type && params.type != model.type){
						// Can't change the type of a variation
						callback(response.error(codes.error.VARIATION_TYPE_CANT_UPDATE()));
						return;
					}
					if(params.name && params.name != model.name){ //Name is getting updated
						var name = params.name;
						ref.search(function(err,data){
							// If error occurred
							if(err){
								callback(err);
								return;
							}
							
							if(data && data.totalCount > 0){ // Records with same User Id and Name can not exist 
								callback(response.error(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS()));
							}else{
								bus.fire('noDuplicates', model);
							}
						}, 'experimentId:eq:' + model.experimentId + '___name:eq:' + name + '___isDisabled:eq:0');
					}else{
						bus.fire('noDuplicates', model);
					}
				});
				
				bus.on('noDuplicates', function(model){
					if(params.isControl && params.isControl == 1 && model.isControl == 0){ //Setting a Non-Control variation Control
						ref.search(function(err,data){
							// If error occurred
							if(err){
								callback(err);
								return;
							}
							
							if(data && data.totalCount > 0){ // Control already exists
								callback(response.error(codes.error.VARIATION_CONTROL_EXISTS()));
							}else{
								bus.fire('controlCheck');
							}
						}, 'experimentId:eq:' + params.experimentId + '___isControl:eq:1');
					}else{
						bus.fire('controlCheck');
					}
				});
				
				bus.on('controlCheck', function(){
					m.call(ref, id, params, callback);
				});
				
				bus.fire('start');
			}
			
		}
	}
});

module.exports = new VariationsImpl();