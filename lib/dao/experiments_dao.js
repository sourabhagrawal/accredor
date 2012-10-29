var comb = require('comb');
var patio = require("patio");
var _ = require('underscore');
var logger = require('./../log_factory').create("experiments_dao");
var DAO = require('./dao.js');
var emitter = require('./../emitter');

var ExperimentsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Experiments";
            this._super([options]);
		}
	}
});

module.exports = new ExperimentsDAO();

//emitter.on('modelsSynced', function(event){
//	logger.debug("on Synced");
//	var instance = new ExperimentsDAO();
//	instance.getById(1).then(function(ex){
//		console.log(ex);
//	});
//});

emitter.on('modelsSynced', function(event){
	logger.debug("on Synced");
	var instance = new ExperimentsDAO();
	instance.search([{field : 'id', op : 'in', value : [2,3]}, {field : 'id', op : 'gt', value : 2}]).then(function(ex){
		_.each(ex, function(model){
			console.log(model.toJSON());
		});
	});
});

