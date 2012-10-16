var Movement = new function(){
	var target = undefined;
	var start = undefined;
	var initPos = undefined;
	
	var ref = this;
	
	var toSelector = function(t){
		if(t.attr('id') != undefined && t.attr('id') != ""){
			var index = $(t.prop('tagName') + "." + t.attr('id')).index(t);
			return "#" + t.attr('id') + (index > 0 ? ":eq(" + index + ")" : "");
		}else{
			var parents = t.parents().map(function (elem, index) {
				if(this.tagName.toLowerCase() != "html" && this.tagName.toLowerCase() != "body"){
					if(this.id != undefined && this.id != ""){
						var index = $(this.tagName + "." + this.id).index(this);
						return "#" + this.id + (index > 0 ? ":eq(" + index + ")" : "");
					}else if($(this).attr('class') != undefined && $(this).attr('class') != ""){
						var clazz = $(this).attr('class').split(/\s+/)[0];
						var index = $(this.tagName + "." + clazz).index(this);
						return "." + clazz + ":eq(" + index + ")";
					}else{
						var index = $(this).parent().children(this.tagName).index(this);
						return this.tagName.toLowerCase() + ":eq(" + index + ")"; 
					}
				}
			}).get().reverse().join(" > ");
			
			var index = t.parent().children(t.prop('tagName')).index(t);
			return parents + " > " + t.prop('tagName').toLowerCase() + ":eq(" + index + ")";
		}
	};
	
	this.onStart = function(event, ui){
		if(start == undefined)
			start = ui.position;
	};
	
	this.onStop = function(event, ui){
		var selector = toSelector(target);
		ref.add(selector, 
			{
				foo : function(t, left, top){
					$(t).css('position', 'relative');
					$(t).css('left', left);
					$(t).css('top', top);
				},
				params : [
					initPos.left + ui.position.left - start.left,
					initPos.top + ui.position.top - start.top
				]
			}, {
				foo : function(t, left, top){
					$(t).css('left', initPos.left);
					$(t).css('top', initPos.top);
				},
				params : [
					initPos.left,
					initPos.top
				]
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