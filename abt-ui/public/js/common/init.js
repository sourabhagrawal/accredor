window.Views = {};

;(function(Backbone) {
  // The super method takes two parameters: a method name
  // and an array of arguments to pass to the overridden method.
  // This is to optimize for the common case of passing 'arguments'.
  function _super(methodName, args) {
 
    // Keep track of how far up the prototype chain we have traversed,
    // in order to handle nested calls to _super.
    this._superCallObjects || (this._superCallObjects = {});
    var currentObject = this._superCallObjects[methodName] || this,
        parentObject  = findSuper(methodName, currentObject);
    this._superCallObjects[methodName] = parentObject;
 
    var result = parentObject[methodName].apply(this, args || []);
    delete this._superCallObjects[methodName];
    return result;
  }
 
  // Find the next object up the prototype chain that has a
  // different implementation of the method.
  function findSuper(methodName, childObject) {
    var object = childObject;
    while (object[methodName] === childObject[methodName]) {
      object = object.constructor.__super__;
    }
    return object;
  }
 
  _.each(["Model", "Collection", "View", "Router"], function(klass) {
    Backbone[klass].prototype._super = _super;
  });
 
})(Backbone);

if(window.eventBus == undefined)
	window.eventBus = _.extend({}, Backbone.Events);

$(function($){
	$(".alert").alert();
	
	$.ajaxSetup({
		global : true,
		statusCode: {
			601: function(){
				// Open the Login Modal
				Utils.openLoginBox();
			},
			
			202 : function(url){
				console.log(arguments);
				window.location.replace(document.location.protocol + '//' + document.location.host + url);
			}
		}
	});
	
	$(document).ajaxSuccess(function(evt, request, settings){
		try{
			var data = $.parseJSON(request.responseText);
			if(data.status && data.status.code == 1000){
//				settings.success(data);
//				console.log(data.success.message);
			}else{
				var message = "An unknown error occurred";
				if(data.message)
					message = data.message;
				console.log(message);
//				if(settings.error)
//					settings.error(request, message, data);
			}
		}catch(e){
//			var message = "An unknown error occurred";
//			console.log(message);
//			if(settings.error)
//				settings.error(request, message, request.responseText);
		}
	});
	
	$(document).ajaxError(function(evt, request, settings){
		if(request.status == 500){
			try{
				var data = $.parseJSON(request.responseText);
				console.log(data.message);
			}catch(e){
				var message = "An unknown error occurred";
				console.log(message);
			}
		}
	});
	
	/**
	 * Initialize header
	 */
	if(Utils.isAuthenticated()){
		new Views.DashboardHeaderView();
	}else{
		new Views.GlobalHeaderView();
	}
});
