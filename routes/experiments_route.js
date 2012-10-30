var comb = require('comb');
var routeUtils = require('./route_utils.js');
var logger = require('./../lib/log_factory').create("experiments_route");
var experimentsImpl = require('../impls/experiments_impl');

var ExperimentsRoute = comb.define(null,{
	instance : {
		constructor : function(options){
			options = options || {};
            this._super([options]);
		},
		
		getById : function(req, res){
			routeUtils.getById(req, res, experimentsImpl);
		},
		
		create : function(req, res){
			routeUtils.create(req, res, experimentsImpl);
		},
		
		update : function(req, res){
			routeUtils.update(req, res, experimentsImpl);
		},
			
		search : function(req, res){
			routeUtils.search(req, res, experimentsImpl);
		}
	}
});

module.exports = new ExperimentsRoute();