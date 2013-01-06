var knox = require('knox');

var client = knox.createClient({
    key: 'AKIAIVBQVGKDRVQ46N2Q'
  , secret: '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'
  , bucket: 'snippets-bkt'
});

client.putFile('my.json', '/user.json', function(err, res){
	// Logic
	
});


//client.list({}, function(err, data){
//	console.log(data.length);
//});