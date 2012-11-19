var logger = require(LIB_DIR + 'log_factory').create("bucket");
var redis = require("redis");
var comb = require("comb");

var Bucket = comb.define(null, {
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
			this.client = redis.createClient();
			
			this.channels = [CHANNEL_VARIATIONS, CHANNEL_GOALS];
			this.subscribe();
			
			this.addBuckets();
		},
		
		subscribe : function(){
			var ref = this;
			
			if(this.channels){
				_.each(this.channels, function(channel){
					var client = redis.createClient();
					client.subscribe(channel);
					client.on("message", function(channel, message){
						var values = ref.filter(channel, message);
						if(values != null){
							ref.process(channel, values);
						}
					});
				});
			}
		},
		
		/**
		 * Add Sub - Buckets
		 */
		addBuckets : function(){},
		
		/**
		 * TODO : Filter the message to see if it matches
		 */
		filter : function(channel, message){},
		
		/**
		 * TODO : Store the values in Redis
		 */
		process : function(channel, values){}
	}
});

module.exports = Bucket;
	
