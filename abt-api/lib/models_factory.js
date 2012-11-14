var comb = require('comb');
var patio = require("patio");
var logger = require('./log_factory').create("models");
var DB = require('./db_connection');
var emitter = require('./emitter');

var ModelsFactory = comb.define(null,{
	instance : {
		constructor : function(){
            this._super(arguments);
            
            this.Experiments = patio.addModel("Experiments",{
            	pre:{
                    "save":function(next){
                        this.createdAt = new Date();
                        next();
                    },
                    "update" : function(next){
                        this.updatedAt = new Date();
                        next();
                    }
                }
            }).oneToMany("Variations",{key : "experiment_id"})
				.oneToMany("Links",{key : "experiment_id"})
				.manyToOne("Users",{key : "user_id"});;
			
            this.Variations = patio.addModel("Variations",{
            	pre:{
                    "save":function(next){
                        this.createdAt = new Date();
                        next();
                    },
                    "update" : function(next){
                        this.updatedAt = new Date();
                        next();
                    }
                }
            }).manyToOne("Experiments",{key : "experiment_id"});
			
            this.Links = patio.addModel("Links",{
				plugins:[patio.plugins.ValidatorPlugin],
            	pre:{
                    "save":function(next){
                        this.createdAt = new Date();
                        next();
                    },
                    "update" : function(next){
                        this.updatedAt = new Date();
                        next();
                    }
                }
            }).manyToOne("Experiments",{key : "experiment_id"});
			this.Links.validate("url").isUrl();
			
			this.Users = patio.addModel("Users",{
				plugins:[patio.plugins.ValidatorPlugin],
				static : {
			        typecastOnLoad : false,
			        typecastOnAssignment : false
			    },
				pre:{
                    "save":function(next){
                        this.createdAt = new Date();
                        next();
                    },
                    "update" : function(next){
                        this.updatedAt = new Date();
                        next();
                    }
                },
                post : {
                	load : function(next){
                		this.password = null;
                		next();
                	}
                }
            }).oneToMany("Experiments",{key : "experiment_id"});
			this.Users.validate("email").isEmail();
			
            patio.syncModels().then(function(){
            	logger.debug("synced");
            	emitter.emit("modelsSynced");
            }, function(error){
            	logger.fatal(error);
            	emitter.emit("syncFailed");
            });
		}
	}
});

var factory = comb.singleton(ModelsFactory);

module.exports = new factory();