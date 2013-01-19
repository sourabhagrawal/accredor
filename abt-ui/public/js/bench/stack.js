var Stack = function(){
	this.initialCode = undefined;
	
	var array = [];
	
	var iter = -1;
	
	this.add = function(fn, nfn){
		if(iter != array.length - 1){
			if(iter > -1)
				array = array.slice(0, iter);
			else if(iter == -1)
				array = [];
		}
		iter = array.push({fn : fn, nfn : nfn}) - 1;
	};
	
	this.redo = function(){
		if(this.isFull())
			throw "Nothing to Redo";
		var obj = array[++iter];
		eval(obj['fn']);
	};
	
	this.undo = function(){
		if(this.isEmpty())
			throw "Nothing to Undo";
		var obj = array[iter--];
		eval(obj['nfn']);
	};
	
	this.isEmpty = function(){
		return iter == -1;
	};
	
	this.isFull = function(){
		return iter == array.length - 1;
	};
	
	this.toScript = function(){
		var instructions = [];
		if(this.initialCode){
			instructions.push(this.initialCode);
		}
		
		for(var i = 0; i <= iter; i++){
			var obj = array[i];
			var instruction = obj['fn'];
			instructions.push(instruction);
		}
		
		return instructions.join("\n");
	};
	
	this.setInitialCode = function(fn){
		this.initialCode = fn;
		eval(fn);
	};
};