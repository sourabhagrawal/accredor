var fs = require('fs');
var UglifyJS = require("uglify-js");

/**
 * It generated the JS file to be given to the user
 */
var Generator = function(){
	
	this.jquery = fs.readFileSync(LIB_DIR + 'src/jquery-1.8.2.js');
	this.jqueryCookie = fs.readFileSync(LIB_DIR + 'src/jquery.cookie.js');
	var accCode = fs.readFileSync(LIB_DIR + 'src/accredor.js');
	
	this.run = function(userData){
		var receiverURL = "http://localhost:8082/";
		if(IS_PROD){
			receiverURL = "http://accredor.com:8082/";
		}
		var userCode = "window.accredor = {}; " + " accredor.receiverURL = '" + receiverURL + "'; accredor.data = " + userData;
		var sourceCode = userCode + ';' + this.jquery.toString() + this.jqueryCookie.toString() + accCode.toString();
		var final_code = UglifyJS.minify(sourceCode, {
			fromString : true
		});
		
		return final_code.code;
	};
};

module.exports = new Generator();