var comb = require('comb');
var patio = require('patio');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("dao");
var models = require('./../lib/models_factory');

var DAO = comb.define(null,{
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
            this._model = models[options.model];
		},

		getById : function(id){
			return this._model.findById(id);
		},
		
		create : function(params){
			return this._model.save(params);
		},
		
		update : function(id, params){
			return this._model.update(params, {id : id});
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
			
			if(fetchSize == undefined)
				fetchSize = 10;
			start = start != undefined && start >= 0 ? start : 0;
			
			if(fetchSize != -1)
				result = result.limit(fetchSize, start);
			
			if(sortBy == undefined){
				sortBy = 'id';
				sortDir = 'DESC';
			}
			var sql = patio.sql;
			result = result.order(sql[sortBy][sortDir.toLowerCase()]());
			
			return result.all();
		}
	}
});

module.exports = DAO;