var comb = require('comb');
var _ = require('underscore');
var crypto = require('crypto');
var logger = require(LIB_DIR + 'log_factory').create("users_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var usersDao = require(DAOS_DIR + 'users_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emails_impl = require('./emails_impl');

var UsersImpl = comb.define(impl,{
	instance : {
		displayName : "User",
		constructor : function(options){
			options = options || {};
			options.dao = usersDao;
            this._super([options]);
		},
		create : function(params, callback){
			var ref = this;
			var m = this._getSuper();
			
			this.search(function(err, data){
				// If error occurred
				if(err){
					callback(err);
					return;
				}
				
				if(data && data.totalCount > 0){ // User with same email exists 
					callback(response.error(codes.error.USER_EMAIL_EXISTS()));
				}else{
					/**
					 * Prefill
					 */
					var password = params.password;
					if(password == undefined){
						callback(response.error(codes.error.FIELD_REQUIRED(['Password'])));
					}else{
						var md5sum = crypto.createHash('md5');
						var hash = md5sum.update(password).digest("hex");
						params.password = hash;
						params.isVerified = false;
						params.isDisabled = false;
						
						m.call(ref, params, function(err, data){
							/**
							 * TODO : Send a verification mail to the email address
							 */
							
							
							callback(err, data);
						});
					}
				}
			}, 'email:eq:' + params.email);
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
						if(params.email == undefined || model.email == params.email){
							var password = params.password;
							if(password != undefined){
								var md5sum = crypto.createHash('md5');
								var hash = md5sum.update(password).digest("hex");
								params.password = hash;
							}
							
							m.call(ref, id, params, callback);
						}else{
							callback(response.error(codes.error.USER_EMAIL_CANT_BE_CHANGED()));
						}
					}
				}, function(error){
					callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
				});
			}
		},
		
		authenticate : function(email, password, callback){
			if(email == null || password == null){
				callback(response.error(codes.error.EMAIL_OR_PASSWORD_NULL()));
			}else{
				var md5sum = crypto.createHash('md5');
				var hash = md5sum.update(password).digest("hex");
				this.search(function(err, data){
					// If error occurred
					if(err){
						callback(err);
						return;
					}
					
					if(data && data.totalCount == 1){ // User found
						callback(null,response.success(data.data[0], 1, codes.success.USER_EMAIL_EXISTS()));
					}else{
						callback(response.error(codes.error.EMAIL_OR_PASSWORD_INCORRECT()));
					}
				}, 'email:eq:' + email + '___password:eq:' + hash + '___isVerified:eq:1', 0, 1);
			}
		},
		
		signup : function(email, password, callback){
			this.create({email : email, password : password}, callback);
		},
		
		forgot : function(email, callback){
			if(email == null){
				callback(response.error(codes.error.EMAIL_NULL()));
			}else{
				this.search(function(err, data){
					// If error occurred
					if(err){
						callback(err);
						return;
					}
					
					if(data && data.totalCount == 1){ // User found
						var algorithm = 'aes256';
						var key = 'sutta';
						var text = email + "|" + (new Date());
						var cipher = crypto.createCipher(algorithm, key);  
						var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
						logger.debug("encrypted token : " + encrypted);
						
						/**
						 * TODO : Send a recovery email
						 */
						callback(null,response.success(data.data[0], 1, codes.success.USER_EMAIL_EXISTS()));
					}else{
						callback(response.error(codes.error.EMAIL_DOES_NOT_EXISTS()));
					}
				}, 'email:eq:' + email + '___isVerified:eq:1', 0, 1);
			}
		}
	}
});

module.exports = new UsersImpl();