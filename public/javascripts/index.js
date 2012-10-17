var _theframe = document.getElementById("content-frame");
if(_theframe != undefined)
	_theframe.contentWindow.location.href = _theframe.src;

$(function($){
	var editor = CodeMirror(document.getElementById("code-box"), {
	  mode:  "javascript",
	  lineNumbers: true,
	  matchBrackets: true,
	  lineWrapping : true,
	  height:0
	});
	
	editor.setSize(null, 0);
	
	$("#code-container" ).resizable();
	
	$("#undo").click(function(event){
		frame.Stack.undo();
	});
	
	$("#redo").click(function(event){
		frame.Stack.redo();
	});
	
	$("#script-btn").click(function(event){
		var script = frame.Stack.toScript();
		editor.setValue(script);
		
		$('#code-container').css('height', 100 );
		editor.setSize(null, 100);
	});
});
