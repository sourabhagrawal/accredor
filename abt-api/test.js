var comb = require('comb');
var DB = require('./lib/db_connection');
var models = require('./lib/models_factory');
var emitter = require('./lib/emitter');

//emitter.on('modelsSynced', function(){
//	var ds = models['Experiments'];
//	ds.forUpdate().filter({status : 'created'}).limit(2).all()
//		.then(function(exs){
//			exs.forEach(function(ex){
//				return ex.update({status:'stopped'});
//			});
//		}).then(function(a){
//			console.log(a);
//		});
//});


var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport("Sendmail");

var mailOptions = {
    from: "iitr.sourabh@gmail.com",
    to: "iitr.sourabh@gmail.com",
    subject: "Hello world!",
    text: "Plaintext body"
};

transport.sendMail(mailOptions);