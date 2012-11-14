var comb = require('comb');

//var foo = function(callback){
//	callback("Hello World!");
//};
//
//var Animal = comb.define(null, {
//	instance : {
//		constructor : function(options){
//			options = options || {};
//			this._super(arguments);
//			
//			this._type = options.type;
//		},
//		
//		desc : function(){
//			return "It is a " + (this._type || "Animal");
//		}
//	}
//});
//
//var Monkey = comb.define(Animal, {
//	instance : {
//		contructor : function(options){
//			options = options || {};
//			options.type = 'Mammal';
//			this._super(arguments);
//		},
//		
//		desc : function(){
//			var ref = this;
//			foo(function(str){
//				console.log(ref._super() + ". It can jump on trees");
//			});
//		}
//	}
//});
//
//var aAnimal = new Animal();
//var aMonkey = new Monkey();
//
//console.log(aAnimal.desc());
//console.log(aMonkey.desc());