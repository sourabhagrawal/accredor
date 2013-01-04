var redis = require("redis");

var Lock = function(){
	this.client = redis.createClient();
	
	this.lockTimeOut = 5000, // 5 secs!!
	this.reacquireInterval = 2000, // 2 secs
	
	this.acquire = function(key, timestamp, callback){
		var ref = this;
		
		ref.client.setnx(key, timestamp, function(err, reply){
			if(err){
				callback(err);
			}else{
				if(reply == 1){
					//Lock acquired
					callback(null, reply);
				}else{
					ref.client.get(key, function(err, reply){
						if(err){
							callback(err);
						}else{
							if(reply < new Date().getTime()){
								// Lock has expired. The client that acquired the lock has failed to release it.
								ref.client.getset(key, timestamp, function(err, reply){
									if(err){
										callback(err);
									}else{
										if(reply < new Date().getTime()){
											// Still got expired timestamp. The lock has been acquired. Yay!
											callback(null, reply);
										}else{
											// Someone else got it first. Let's go to sleep
											setTimeout(ref.acquireLock, ref.reacquireInterval);
										}
									}
								});
							}else{
								// Has to wait
								setTimeout(ref.acquireLock, ref.reacquireInterval);
							}
						}
					});
				}
			}
		});
	};
	
	this.release = function(key, callback){
		this.client.del(key, function(err, reply){
			if(err){
				callback(err);
			}else{
				callback(null, reply);
			}
		});
	};
};

module.exports = new Lock(); 