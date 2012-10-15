var stack = new function(){
	var array = [];
	
	var iter = -1;
	
	this.add = function(target, fn, nfn){
		if(iter != array.length - 1){
			if(iter > -1)
				array = array.slice(0, iter);
			else if(iter == -1)
				array = [];
		}
		iter = array.push({target : target, fn : fn, nfn : nfn}) - 1;
	};
	
	this.push = function(){
		if(this.isFull())
			throw "Nothing to Redo";
		var obj = array[++iter];
		return obj['fn'](obj['target']);
	};
	
	this.pop = function(){
		if(this.isEmpty())
			throw "Nothing to Undo";
		var obj = array[iter--];
		return obj['nfn'](obj['target']);
	};
	
	this.isEmpty = function(){
		return iter == -1;
	};
	
	this.isFull = function(){
		return iter == array.length - 1;
	};
};

var Movement = new function(){
	var target = undefined;
	var start = undefined;
	var stop = undefined;
	var initPos = undefined;
	
	var ref = this;
	
	this.onStart = function(event, ui){
		if(start == undefined)
			start = ui.position;
	};
	
	this.onStop = function(event, ui){
		if(stop == undefined)
			stop = ui.position;
		ref.add(target, function(t){
			t.css('position', 'relative');
			t.css('left', initPos.left + ui.position.left - start.left);
			t.css('top', initPos.top + ui.position.top - start.top);
		}, function(t){
			t.css('left', initPos.left);
			t.css('top', initPos.top);
		});
	};
	
	this.onDrag = function(event, ui){
		if(target){
			var leftO = ui.position.left - start.left;
			var topO = ui.position.top - start.top;
			target.css("left" , initPos.left + leftO);
			target.css("top" , initPos.top + topO);
		};
	};
	
	this.onClick = function(event){
		target = $(event.target);
		target.css('position', 'relative');
		start = undefined;
		stop = undefined;
		initPos = {
				left : parseInt(target.css('left').replace('px', '')),
				top : parseInt(target.css('top').replace('px', ''))
		};
		$("#selected").css({
			position : 'absolute', 
			height : target.height(), 
			width : target.width(), 
			left : target.offset().left, 
			top : target.offset().top, 
			display : 'block'
		});
	};
	
	this.add = function(target, fn, nfn){
		stack.add(target, fn, nfn);
	};
	
	this.redo = function(){
		stack.push();
	};
	
	this.undo = function(){
		stack.pop();
	};
};

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
});
