var redis = require("redis"),
	client = redis.createClient();

exports.index = function(req, res){
	var message = req.query['message'];
	if(message)
		client.publish(CHANNEL_GOALS, message);
	res.send();
};