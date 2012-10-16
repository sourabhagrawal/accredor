window.parent.frame = window;
var p$ = window.parent.$;
$(function($){
	$("#selected").draggable({
		start: Movement.onStart, 
		stop : Movement.onStop, 
		drag : Movement.onDrag
	});
	
	$("body").mouseover(function(event) {
	  $(event.target).addClass("over");
	});
	
	$("body").mouseout(function(event) {
	  $(event.target).removeClass("over");
	});
	
	$("body").click(function(event) {
		Movement.onClick(event);
		
		return false;
	});
	
	(function (t, left, top) {
	    $(t).css("position", "relative");
	    $(t).css("left", left);
	    $(t).css("top", top);
	}.apply(this, ['center:eq(0) > #main > #content > .articles:eq(0) > .article:eq(0) > .article-content:eq(0) > p:eq(0) > img:eq(0)'].concat(267,-26)));
	(function (t, left, top) {
	    $(t).css("position", "relative");
	    $(t).css("left", left);
	    $(t).css("top", top);
	}.apply(this, ['center:eq(0) > #main > #content > .articles:eq(0) > .article:eq(0) > h2:eq(0) > a:eq(0)'].concat(296,-17)));
});
