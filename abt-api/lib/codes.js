
var substitute = function(message, params){
	if(params != undefined){
        params.forEach(function(param, index, arr){
            message = message.replace("{" + (index + 1) + "}", param);
        });
        if(message.match("{[0-9]*}")){
            throw "Insufficient substitution values (Provided : " + params.length + ")";
        };
    }
    return message;
};

var message = function(message){
	var foo = function(options){
		return substitute(message, options);
	};
	
	foo.toString = function(){
		return message;
	};
	
	return foo;
};

var status = function(opts){
	var foo = function(options){
		return {code : opts.code, message : substitute(opts.message, options)};
	};
	
	foo.toString = function(){
		return opts;
	};
	
	foo.equals = function(obj){
		return obj.code == opts.code;
	};
	
	return foo;
};

var SuccessCodes = new function(){
	this.OPERATION_SUCCESSFULL = "Operation was successfull";
	this.RECORD_FETCHED = message("{1} : {2} fetched successfully");
	this.RECORD_CREATED = message("{1} created successfully");
	this.RECORD_UPDATED = message("{1} : {2} updated successfully");
	this.RECORD_DELETED = message("{1} : {2} deleted successfully");
	this.RECORDS_SEARCHED = message("{1}s searched successfully");
};

var ErrorCodes = new function(){
	this.UNKNOWN_ERROR = status({code : 1001, message : "An unknown error occurred"});
	this.ID_NULL = status({code : 1101, message : "Id can not be null"});
	this.RECORD_WITH_ID_NOT_EXISTS = status({code : 1102, message : "{1} with id : {2} does not exist"});
	this.RECORD_WITH_ID_NOT_FETCHED = status({code : 1103, message : "{1} with id : {2} could not be fetched"});
	this.CREATION_FAILED = status({code : 1104, message : "{1} could not be created"});
	this.UPDATION_FAILED = status({code : 1105, message : "{1} with id : {2} could not be updated"});
	this.DELETION_FAILED = status({code : 1106, message : "{1} with id : {2} could not be deleted"});
	this.SEARCH_FAILED = status({code : 1107, message : "Search on {1}s could not be completed"});
	
	this.EXPERIMENT_USER_ID_NAME_EXISTS = status({code : 1201, message : "Experiment with this Name already exists"});
	this.VARIATION_EXPERIMENT_ID_NAME_EXISTS = status({code : 1301, message : "Variation with this Name already exists for this experiment"});
};

exports.success = SuccessCodes;
exports.error = ErrorCodes;