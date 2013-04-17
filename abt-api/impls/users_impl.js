var comb = require('comb');
var _ = require('underscore');
var crypto = require('crypto');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("users_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var usersDao = require(DAOS_DIR + 'users_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emails_impl = require('./emails_impl');
var scriptDetailsImpl = require('./script_details_impl');
var Bus = require(LIB_DIR + 'bus');

var algorithm = 'aes256';
var key = 'sutta';

var UsersImpl = comb.define(impl,{
	instance : {
		displayName : "User",
		constructor : function(options){
			options = options || {};
			options.dao = usersDao;
			options.auditableFields = ['email', 'password', 'isVerified', 'isDisabled'];
			
            this._super([options]);
		},
		
		create : function(params, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			// Email should be a valid email
			var email = params['email'];
			try{
				check(email).notNull().notEmpty().isEmail();
			}catch(e){
				callback(response.error(codes.error.NOT_VALID_EMAIL()));
				return;
			}
			
			// Password should be atleast 6 characters long
			var password = params['password'];
			try{
				check(password).notNull().notEmpty().len(6);
			}catch(e){
				callback(response.error(codes.error.PASSWORD_TOO_SHORT([6])));
				return;
			}
			
			bus.on(this, 'start', function(){
				ref.search(function(err, data){
					// If error occurred
					if(err){
						callback(err);
						return;
					}
					
					if(data && data.totalCount > 0){ // User with same email exists 
						callback(response.error(codes.error.USER_EMAIL_EXISTS()));
					}else{
						bus.fire('noDuplicates');
					}
				}, 'email:eq:' + params.email);
			});
			
			bus.on('noDuplicates', function(){
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
						if(err == undefined)
							bus.fire('created', data);
						else
							callback(err);
					});
				}
			});
			
			bus.on('created', function(data){
				var user = data.data;
				var userId = user['id'];
				scriptDetailsImpl.create({userId : userId}, function(err, scriptDetailsResp){
					if(err != undefined){
						callback(err);
					}else{
						bus.fire('script_created', user);
						callback(null, data);
					}
				});
			});
			
			bus.on('script_created', function(user){
				var email = user['email'];
				
				ref.sendVerificationEmail(email, function(err, data){
					if(err != undefined){
						logger.error(err);
					}else{
						logger.debug(data);
					}
				});
			});
			
			bus.fire('start');
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
								// Password should be atleast 6 characters long
								try{
									check(password).notNull().notEmpty().len(6);
								}catch(e){
									callback(response.error(codes.error.PASSWORD_TOO_SHORT([6])));
									return;
								}
								
								var md5sum = crypto.createHash('md5');
								var hash = md5sum.update(password).digest("hex");
								params.password = hash;
							}
							console.log(params);
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
						var user = data.data[0];
						if(user['isVerified'] == 0 || user['isVerified'] == false){
							callback(response.error(codes.error.EMAIL_NOT_VERIFIED()));
						}else
							callback(null,response.success(data.data[0], 1, codes.success.USER_EMAIL_EXISTS()));
					}else{
						callback(response.error(codes.error.EMAIL_OR_PASSWORD_INCORRECT()));
					}
				}, 'email:eq:' + email + '___password:eq:' + hash, 0, 1);
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
						var text = email + "|" + Date.now();
						logger.info('encrypting : ' + text);
						
						var cipher = crypto.createCipher(algorithm, key);  
						var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
						logger.debug("encrypted token : " + encrypted);
						
						var url = 'http://' + DOMAIN_HOST + '/recover?t=' + encrypted;
						
						emails_impl.sendFromTemplate(
								'recovery_email.jade', 
								{
									url : url, 
									domain_name : DOMAIN_NAME
								}, 
								{
									to : email,
									from : DOMAIN_SUPPORT_ID,
									subject : 'Regenerate password for your ' + DOMAIN_NAME + ' account'
								}, 
								callback);
					}else{
						callback(response.error(codes.error.EMAIL_DOES_NOT_EXISTS()));
					}
				}, 'email:eq:' + email, 0, 1);
			}
		},
		
		sendVerificationEmail : function(email, callback){
			var text = email + "|" + Date.now();
			logger.info('encrypting : ' + text);
			
			var cipher = crypto.createCipher(algorithm, key);  
			var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
			logger.debug("encrypted token : " + encrypted);
			
			var url = 'http://' + DOMAIN_HOST + '/verify?t=' + encrypted;
			
			emails_impl.sendFromTemplate('verification_email.jade', 
					{
						url : url, 
						domain_name : DOMAIN_NAME
					}, 
					{
						to : email,
						from : DOMAIN_SUPPORT_ID,
						subject : 'Verify your ' + DOMAIN_NAME + ' account'
					}, 
					callback);
		},
		
		validateToken : function(token, callback){
			try{
				var decipher = crypto.createDecipher(algorithm, key);
				var decrypted = decipher.update(token, 'hex', 'utf8') + decipher.final('utf8');
				
				logger.info("Decrypted token  : " + decrypted);
				var tokens = decrypted.split('|');
				if(tokens.length != 2){
					callback(response.error(codes.error.TOKEN_INVALID()));
				}else{
					try{
						var email = tokens[0];
						var date = tokens[1];
						var elapsed = Date.now() - date;
						
						logger.info(elapsed + " millisecs elapsed");
						if(elapsed < 30 * 24 * 60 * 60 * 1000){ // 30 days
							callback(null,response.success(email, 1, codes.success.TOKEN_VALID()));
						}else{
							callback(response.error(codes.error.TOKEN_EXPIRED()));
						}
					}catch(e){
						logger.error(e);
						callback(response.error(codes.error.TOKEN_INVALID()));
					}
				}
			}catch(e){
				logger.error(e);
				callback(response.error(codes.error.TOKEN_INVALID()));
			}
			
		},
		
		verify : function(token, callback){
			var ref = this;
			this.validateToken(token, function(err, data){
				if(err != undefined){
					callback(err, null);
				}else{
					var email = data.data;
					ref.search(function(err, data){
						// If error occurred
						if(err){
							callback(err);
							return;
						}
						
						if(data && data.totalCount == 1){ // User found
							ref.update(data.data[0].id, {isVerified : 1}, callback);
						}else{
							callback(response.error(codes.error.EMAIL_DOES_NOT_EXISTS()));
						}
					}, 'email:eq:' + email, 0, 1);
				}
			});
		},
		
		updatePassword : function(email, password, callback){
			// Password should be atleast 6 characters long
			try{
				check(password).notNull().notEmpty().len(6);
			}catch(e){
				callback(response.error(codes.error.PASSWORD_TOO_SHORT([6])));
				return;
			}
			
			var ref = this;
			this.search(function(err, data){
				// If error occurred
				if(err){
					callback(err);
					return;
				}
				
				if(data && data.totalCount == 1){ // User found
					// Mark verified also because user came here through his email.
					ref.update(data.data[0].id, {email : email, password : password, isVerified : 1}, callback);
				}else{
					callback(response.error(codes.error.EMAIL_DOES_NOT_EXISTS()));
				}
			}, 'email:eq:' + email, 0, 1);
		}
	}
});

module.exports = new UsersImpl();