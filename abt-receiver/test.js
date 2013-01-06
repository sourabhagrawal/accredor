var knox = require('knox');

var client = knox.createClient({
    key: 'AKIAIVBQVGKDRVQ46N2Q'
  , secret: '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'
  , bucket: 'scripts.accredor.com'
});

client.putFile('public/scripts/7615328.js', '/7615328.js', {'x-amz-acl' : 'public-read'}, function(err, res){
	console.log(res);
});