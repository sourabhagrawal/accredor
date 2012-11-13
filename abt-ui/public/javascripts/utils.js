var Utils = Utils || {};

Utils.openLoginBox = function(){
	$('#loginBox').modal({}).css({
	       'width': function () { 
	           return '360px';  
	       }
	});
};