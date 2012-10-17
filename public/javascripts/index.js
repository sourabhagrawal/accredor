var _theframe = document.getElementById("content-frame");
if(_theframe != undefined)
	_theframe.contentWindow.location.href = _theframe.src;

$(function($){
	$("#undo").click(function(event){
		frame.Stack.undo();
	});
	
	$("#redo").click(function(event){
		frame.Stack.redo();
	});
});
