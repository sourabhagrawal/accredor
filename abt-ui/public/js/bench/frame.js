window.parent.frame = window;
var p$ = window.parent.$;
$(function($){
	window.stack = new Stack();
	window.movement = new Movement(stack);
	
	$("#selected").draggable({
		start: movement.onStart, 
		stop : movement.onStop, 
		drag : movement.onDrag
	});
	
	
	var passThroughAndClick = function(event){
		var left = $(window).scrollLeft();
	    var top = $(window).scrollTop();

	    //hide the overlay for now so the document can find the underlying elements
	    $(event.target).css('display','none');
	    //use the current scroll position to deduct from the click position
	    $(document.elementFromPoint(event.pageX-left, event.pageY-top)).click();
	    //show the overlay again
	    $(event.target).css('display','block');
	};
	
	var onClick = function(event){
		target = $(event.target);
		
		if(target[0].id == "selected"){
			passThroughAndClick(event);
			return;
		}
		
		$("#selected").css({
			position : 'absolute', 
			height : target.height(), 
			width : target.width(), 
			left : target.offset().left, 
			top : target.offset().top, 
			display : 'block'
		});
		
		this.mode = 'movement';
		if(this.mode){
			if(this.mode == 'movement'){
				movement.init(target);
			}
		}
	};
	
	var encloseBox = function(event){
		$('.accredor-border').remove();
		
		var target = $(event.target);
		
		var left = target.offset().left;
		var top = target.offset().top;
		var bottom = top + target.height();
		var right = left + target.width();
		
		// On the top
		$("<div></div>")
			.attr('class','accredor-border')
			.attr('style', 'position:absolute; display:block; height : 2px; width : ' + target.width() + "px; top : " + top + "px; left : " + left + "px;")
			.appendTo('body');
		
		// On the bottom
		$("<div></div>")
			.attr('class','accredor-border')
			.attr('style', 'position:absolute; display:block; height : 2px; width : ' + (target.width() + 2) + "px; top : " + bottom + "px; left : " + left + "px;")
			.appendTo('body');
		
		// On the left
		$("<div></div>")
			.attr('class','accredor-border')
			.attr('style', 'position:absolute; display:block; width : 2px; height : ' + target.height() + "px; left : " + left + "px; top : " + top + "px;")
			.appendTo('body');
		
		// On the right
		$("<div></div>")
			.attr('class','accredor-border')
			.attr('style', 'position:absolute; display:block; width : 2px; height : ' + target.height() + "px; left : " + right + "px; top : " + top + "px;")
			.appendTo('body');
	};
	
	var onMouseOver = function(event){
		encloseBox(event);
	};
	
	var onMouseOut = function(event){
		$('.accredor-border').remove();
	};
	
	$("body").mouseover(function(event) {
		onMouseOver(event);
	});
	
	$("body").mouseout(function(event) {
		onMouseOut(event);
	});
	
	$("body").click(function(event) {
		onClick(event);
		
		return false;
	});
	
	window.applyCode = function(fn){
		stack.setInitialCode(fn);
	};
});
