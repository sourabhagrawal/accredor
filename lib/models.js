var comb = require('comb');
var patio = require("patio");
var logger = require('./log_factory').create("models");
var DB = require('./db_connection');
var emitter = require('./emitter');

var ModelsFactory = comb.define(null,{
	instance : {
		constructor : function(){
            this._super(arguments);
            
            this.Experiments = patio.addModel("Experiments")
						.oneToMany("Variations",{key : "experiment_id"})
						.oneToMany("Links",{key : "experiment_id"});
			this.Variations = patio.addModel("Variations").manyToOne("Experiments",{key : "experiment_id"});
			this.Links = patio.addModel("Links").manyToOne("Experiments",{key : "experiment_id"});

            patio.syncModels().then(function(){
            	logger.debug("synced");
            	emitter.emit("modelsSynced");
            }, function(error){
            	logger.fatal(error);
                patio.disconnect();
            });
		}
	}
});

var factory = comb.singleton(ModelsFactory);

module.exports = new factory();