var redis = require("redis"),
	client = redis.createClient();

exports.index = function(req, res){
	var message = req.query['message'];
	if(message)
		client.publish(CHANNEL_VARIATIONS, message);
	res.send(204);
};