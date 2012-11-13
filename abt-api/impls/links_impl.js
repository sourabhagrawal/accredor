var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("links_impl");
var impl = require('./impl.js');
var linksDao = require(DAOS_DIR + 'links_dao');

var LinksImpl = comb.define(impl,{
	instance : {
		displayName : "Link",
		constructor : function(options){
			options = options || {};
			options.dao = linksDao;
            this._super([options]);
		}
	}
});

module.exports = new LinksImpl();