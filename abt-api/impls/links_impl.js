var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("links_impl");
var impl = require('./impl.js');
var linksDao = require(DAOS_DIR + 'links_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emitter = require(LIB_DIR + 'emitter');

var LinksImpl = comb.define(impl,{
	instance : {
		displayName : "Link",
		constructor : function(options){
			options = options || {};
			options.dao = linksDao;
            this._super([options]);
		},
		
		create : function(params, callback){
			var m = this._getSuper();
			
			// User ID should not be valid
			var userId = params['userId'];
			try{
				check(userId).notNull().notEmpty().isInt();
			}catch(e){
				callback(response.error(codes.error.VALID_USER_REQUIRED()));
				return;
			}
			
			// URL should not be blank
			try{
				check(params['url']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.LINK_URL_REQUIRED()));
				return;
			}
			
			// URL should not be blank
			try{
				check(params['type']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.LINK_TYPE_REQUIRED()));
				return;
			}
			
			if(params['type'] == LINK.types.SIMPLE){
				// URL should be valid
				try{
					check(params['url']).isUrl();
				}catch(e){
					callback(response.error(codes.error.INVALID_LINK_URL()));
					return;
				}
			}
			
			m.call(this, params, callback);
			
			// Mark script old for the user
			emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
		},
		
		update : function(id, params, callback){
			var m = this._getSuper();
			
			// User ID should not be valid
			var userId = params['userId'];
			try{
				check(userId).notNull().notEmpty().isInt();
			}catch(e){
				callback(response.error(codes.error.VALID_USER_REQUIRED()));
				return;
			}
			
			if(params['type'] && params['url'] && params['type'] == LINK.types.SIMPLE){
				// URL should be valid
				try{
					check(params['url']).isUrl();
				}catch(e){
					callback(response.error(codes.error.INVALID_LINK_URL()));
					return;
				}
			}
			
			m.call(this, id, params, callback);
			
			// Mark script old for the user
			emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
		}
	}
});

module.exports = new LinksImpl();