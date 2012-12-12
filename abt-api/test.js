var jade = require('jade');

jade.renderFile('./views/emails/verification_email.jade', {url : 'http://localhost/verify?t='}, function(err, html){
	console.log(err);
	console.log(html);
});
