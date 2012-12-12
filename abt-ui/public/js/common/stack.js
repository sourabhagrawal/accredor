var Stack = new function(){
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
		for(var i = 0; i <= iter; i++){
			var obj = array[i];
			var instruction = obj['fn'] + ";\n";
			instructions.push(instruction);
		}
		
		return instructions.join("\n");
	};
};