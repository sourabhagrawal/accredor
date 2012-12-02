var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("emails_dao");
var DAO = require('./dao.js');

var EmailsDAO = comb.define(DAO,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.model = "Emails";
            this._super([options]);
		},
		
		updateBatch : function(batchSize, filter, params){
			return this._model.forUpdate().filter(filter).limit(batchSize).all()
				.then(function(models){
					models.forEach(function(ex){
						return ex.update(params);
					});
				});
		}
	}
});

module.exports = new EmailsDAO();
