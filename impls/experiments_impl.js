var comb = require('comb');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("experiments_impl");
var impl = require('./impl.js');
var emitter = require('./../lib/emitter');
var experimentsDao = require('../daos/experiments_dao');

var ExperimentsImpl = comb.define(impl,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.dao = experimentsDao;
            this._super([options]);
		}
	}
});

module.exports = new ExperimentsImpl();

//emitter.on('modelsSynced', function(event){
//	logger.debug("on Synced");
//	var instance = new ExperimentsImpl();
//	instance.getById(1).then(function(ex){
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