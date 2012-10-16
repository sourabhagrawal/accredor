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
		return obj['fn']['foo'].apply(this,[obj['target']].concat(obj['fn']['params'] || []));
	};
	
	this.pop = function(){
		if(this.isEmpty())
			throw "Nothing to Undo";
		var obj = array[iter--];
		return obj['nfn']['foo'].apply(this,[obj['target']].concat(obj['nfn']['params'] || []));
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
			var instruction = "(" + obj['fn']['foo'].toString() + 
						".apply(this, ['" + obj.target + "'].concat(" + obj['fn']['params'] + ")));";
			//console.log(instruction);
			instructions.push(instruction);
		}
		
		return instructions.join("\n");
	};
};