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
            
            var staticConf = {
            	typecastEmptyStringToNull : false
            };
            
            this.ScriptDetails = patio.addModel("ScriptDetails",{
            	pre:pre,
            	"static" : staticConf
            });
            
            this.Experiments = patio.addModel("Experiments",{
            	pre:pre,
            	"static" : staticConf
            }).oneToMany("Variations",{key : "experiment_id"})
				.oneToMany("Links",{key : "experiment_id"})
				.manyToOne("Users",{key : "user_id"});
			
            this.Variations = patio.addModel("Variations",{
            	pre:pre,
            	"static" : staticConf
            }).manyToOne("Experiments",{key : "experiment_id"});
			
            this.Links = patio.addModel("Links",{
				plugins:[patio.plugins.ValidatorPlugin],
            	pre:pre,
            	"static" : staticConf
            }).manyToOne("Experiments",{key : "experiment_id"});
//			this.Links.validate("url").isUrl();
			
			this.Goals = patio.addModel("Goals",{
            	pre:pre,
            	"static" : staticConf
            }).manyToOne("Users",{key : "user_id"});
			
			this.Users = patio.addModel("Users",{
				plugins:[patio.plugins.ValidatorPlugin],
				static : {
			        typecastOnLoad : false,
			        typecastOnAssignment : false,
			        typecastEmptyStringToNull : false
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
            	pre:pre,
            	"static" : staticConf
            });
			
			this.Transitions = patio.addModel("Transitions",{
            	pre:pre,
            	"static" : staticConf
            });
			
			this.Emails = patio.addModel("Emails",{
            	pre:pre,
            	"static" : staticConf
            });
			
			this.ContactLeads = patio.addModel("ContactLeads",{
            	pre:pre,
            	"static" : staticConf
            });
			
			this.VariationVisits = patio.addModel("VariationVisits",{
            	pre:pre,
            	"static" : staticConf
            });
			
			this.ExperimentVisits = patio.addModel("ExperimentVisits",{
            	pre:pre,
            	"static" : staticConf
            });
			
			this.GoalVisits = patio.addModel("GoalVisits",{
            	pre:pre,
            	"static" : staticConf
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