var comb = require('comb');
var patio = require("patio");
var logger = require('./log_factory').create("models");
var DB = require('./db_connection');
var emitter = require('./emitter');
var entities = require('./entities');

var ModelsFactory = comb.define(null,{
	instance : {
		constructor : function(){
            this._super(arguments);
            
            var pre = {
                "save":function(next){
                    this.createdAt = new Date();
                    next();
                },
                "update" : function(next){
                    this.updatedAt = new Date();
                    next();
                }
            };
            
            this.Experiments = patio.addModel("Experiments",{
            	pre:pre
            }).oneToMany("Variations",{key : "experiment_id"})
				.oneToMany("Links",{key : "experiment_id"})
				.manyToOne("Users",{key : "user_id"});
			
            this.Variations = patio.addModel("Variations",{
            	pre:pre
            }).manyToOne("Experiments",{key : "experiment_id"});
			
            this.Links = patio.addModel("Links",{
				plugins:[patio.plugins.ValidatorPlugin],
            	pre:pre
            }).manyToOne("Experiments",{key : "experiment_id"});
			this.Links.validate("url").isUrl();
			
			this.Goals = patio.addModel("Goals",{
            	pre:pre
            }).manyToOne("Users",{key : "user_id"});
			
			this.Users = patio.addModel("Users",{
				plugins:[patio.plugins.ValidatorPlugin],
				static : {
			        typecastOnLoad : false,
			        typecastOnAssignment : false
			    },
				pre:pre,
                post : {
                	load : function(next){
                		this.password = null;
                		next();
                	}
                }
            }).oneToMany("Experiments",{key : "experiment_id"});
			this.Users.validate("email").isEmail();
			
			this.States = patio.addModel("States",{
            	pre:pre
            });
			
			this.Transitions = patio.addModel("Transitions",{
            	pre:pre
            });
			
			this.Emails = patio.addModel("Emails",{
            	pre:pre
            });
			
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