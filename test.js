//var log4js = require('log4js');
//log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.file('logs/cheese.log'), 'cheese');
//
//var logger = log4js.getLogger('cheese');
//logger.setLevel('INFO');

//var logger = require('./lib/LogFactory').create("test");
//
//logger.trace('Entering cheese testing');
//logger.debug('Got cheese.');
//logger.info('Cheese is Gouda.');
//logger.warn('Cheese is quite smelly.');
//logger.error('Cheese is too ripe!');
//logger.fatal('Cheese was breeding ground for listeria.');

//var comb = require('comb');
//
//var Animal = comb.define(null, {
//	instance : {
//		constructor : function(options){
//			console.log(options);
//			console.log("Animal Created");
//		}
//	}
//});
//
//var Dog = comb.define(Animal, {
//	instance : {
//		constructor : function(options){
//			console.log("Dog Created");
//			options.color = "Black";
//			console.log(arguments);
//			this._super(arguments);
//		}
//	}
//});
//
//new Dog({name : "Tom"});

var foo = function(){
    console.log("hello");
};

foo.toString = function(){
    return "Modified toString";
};

console.log(foo.toString());