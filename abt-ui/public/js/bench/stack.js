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
	
	this.reset = function(){
		while(!this.isEmpty()){
			this.undo();
		}
	};
	
	this.isEmpty = function(){
		return iter == -1;
	};
	
	this.isFull = function(){
		return iter == array.length - 1;
	};
	
	this.initializeStack = function(){
		var count = 0;
		var fn = this.initialCode['fn'];
		var nfn = this.initialCode['nfn'];
		var ref = this;
		
		fn.forEach(function(f){
			ref.add(f, nfn[count]);
			count++;
		});
	};
	
	this.toCode = function(reverse){
		var instructions = [];
		
		if(reverse == true){
			for(var i = iter; i >= 0; i--){
				var obj = array[i];
				var instruction = obj['nfn'];
				instructions.push(instruction);
			}
		}else{
			for(var i = 0; i <= iter; i++){
				var obj = array[i];
				var instruction = obj['fn'];
				instructions.push(instruction);
			}
		}
		return instructions;
	};
	
	this.toScript = function(){
		return JSON.stringify({fn : this.toCode(), nfn : this.toCode(true)});
	};
	
	this.setInitialCode = function(script){
		if(script == '') return;
		
		script = JSON.parse(script);
		this.initialCode = script;
		this.initializeStack();
		
		script['fn'].forEach(function(fn){
			eval(fn);
		});
	};
};