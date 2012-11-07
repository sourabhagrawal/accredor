var comb = require('comb');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("experiments_impl");
var impl = require('./impl.js');
var emitter = require('./../lib/emitter');
var experimentsDao = require('../daos/experiments_dao');
var codes = require('../lib/codes');
var response = require('../lib/response');

var ExperimentsImpl = comb.define(impl,{
	instance : {
		displayName : "Experiment",
		constructor : function(options){
			options = options || {};
			options.dao = experimentsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var ref = this;
			var origArgs = arguments;
			
			this.search(function(err,data){
				console.log(err);
				
				// If error occurred
				if(err){
					callback(err);
					return;
				}
				
				if(data && data.totalCount > 0){ // Records with same User Id and Name can not exist 
					callback(response.error(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS()));
				}else{
					ref._dao.create(params).then(function(model){
						callback(null,response.success(model.toJSON(), 1, codes.success.RECORD_CREATED([ref.displayName])));
					}, function(error){
						logger.error(error);
						callback(response.error(codes.error.CREATION_FAILED([ref.displayName])));
					});
				}
			}, 'userId:eq:' + params.userId + '___name:eq:' + params.name);
		}
	}
});

module.exports = new ExperimentsImpl();

//emitter.on('modelsSynced', function(event){
//	logger.debug("on Synced");
//	var instance = new ExperimentsImpl();
//	instance.getById(10, function(error, ex){
//		console.log(error);
//		console.log(ex);
//	});
//});

//emitter.on('modelsSynced', function(event){
//	logger.debug("on Synced");
//	var instance = new ExperimentsImpl();
//	instance.search("id:in:3,4___id:gt:2").then(function(ex){
//		_.each(ex, function(model){
//			console.log(model.toJSON());
//		});
//	});
//});