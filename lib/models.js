var patio = require("patio");
var logger = require('./log_factory').create("models");
var DB = require('./db_connection');

var Experiments = patio.addModel("Experiments")
					.oneToMany("Variations",{key : "experiment_id"})
					.oneToMany("Links",{key : "experiment_id"});
var Variations = patio.addModel("Variations").manyToOne("Experiments",{key : "experiment_id"});
var Links = patio.addModel("Links").manyToOne("Experiments",{key : "experiment_id"});

var disconnectError = function(err) {
	logger.debug(err);
    patio.disconnect();
};

patio.syncModels().then(function(){
	logger.debug("synced");
//	Experiments.findById(1).then(function(ex){
////		 console.log(ex);
//		 ex.Variations.then(function(v){
//			 console.log(v);
//		 });
//	}, function(error){
//		   console.log(error);
//	});
	
//	Experiments.save({
//		userId : 1,
//		name : 'pqr',
//		createdAt : '2012-10-26 19:23:49',
//		Variations : [{
//			experimentId : 1,
//			percent : 30,
//			createdAt : '2012-10-26 19:23:49'
//		}]
//	}).then(function(ex){
//		console.log(ex);
//	},function(error){
//		console.log(error);
//	});
}, disconnectError);