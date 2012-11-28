var comb = require('comb');
var patio = require('patio');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("dao");
var models = require(LIB_DIR + 'models_factory');

/**
 * Data Access Object to be extended by entities
 * It is used to read and store data transparently from and to the database.
 * This layer has to be dumb to business logic
 */
var DAO = comb.define(null,{
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
			/**
			 * Bind it with a model
			 */
            this._model = models[options.model];
		},
		
		/**
		 * To fetch a model through its Id
		 * @param id
		 * @returns The model
		 */
		getById : function(id){
			return this._model.findById(id);
		},
		
		/**
		 * To create a model
		 * @param params. The JSON of keys and values to be persisted
		 * @returns The created model
		 */
		create : function(params){
			return this._model.save(params);
		},
		
		/**
		 * To update a model with new values
		 * @param model
		 * @param params
		 * @returns The updated model
		 */
		update : function(model, params){
			return model.update(params);
		},
		
		/**
		 * 
		 * @param filters [{field : <field-name>, op : <operator>, value : <value>}, {....   }]
		 * @param start Defaults to 0
		 * @param fetchSize Defaults to 10. if == -1 return all 
		 * @param sortBy Defaults to id
		 * @param sortDir Defaults to DESC
		 */
		search : function(filters, start, fetchSize, sortBy, sortDir){
			//TODO Implement
			var params = {};
			filters = filters || {};
			_.each(filters, function(filter){
				if(filter.field != null && filter.op != null){
					if(filter.value != null){
						var field = filter.field;
						var op = filter.op;
						var value = filter.value;
						if(op == 'lt' || op == 'lte' || 
							op == 'gt' || op == 'gte' || 
							op == 'eq' || op == 'neq' || 
							op == 'like' || op == 'iLike'){
							params[field] = params[field] || {};
							params[field][op] = value;
						}else if(op == 'in'){
							params[field] = params[field] || {};
							if(_.isArray(value))
								params[field]['in'] = value;
						}else if(op == 'bw'){
							params[field] = params[field] || {};
							if(_.isArray(value))
								params[field].between = value;
						}else if(op == 'nbw'){
							params[field] = params[field] || {};
							if(_.isArray(value))
								params[field].notBetween = value;
						}
					}
				}
			});
			var result = this._model.filter(params);
			
			if(fetchSize == undefined || fetchSize.trim() == '')
				fetchSize = 10;
			start = start != undefined && start.trim() != '' && start >= 0 ? start : 0;
			
			if(fetchSize != -1)
				result = result.limit(fetchSize, start);
			
			if(sortBy == undefined || sortBy.trim() == ''){
				sortBy = 'id';
				sortDir = 'DESC';
			}
			
			if(sortDir == undefined || sortDir.trim() == ''){
				sortDir = 'DESC';
			}
			
			var sql = patio.sql;
			result = result.order(sql[sortBy][sortDir.toLowerCase()]());
			
			return result.all();
		}
	}
});

module.exports = DAO;