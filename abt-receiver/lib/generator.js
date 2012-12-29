var fs = require('fs');
var UglifyJS = require("uglify-js");

var Generator = function(){
	
	this.jquery = fs.readFileSync(LIB_DIR + 'src/jquery-1.8.2.js');
	this.jqueryCookie = fs.readFileSync(LIB_DIR + 'src/jquery.cookie.js');
	
	this.run = function(userData){
		var userCode = "var accredor = {}; accredor.data = " + userData;
		var accCode = fs.readFileSync(LIB_DIR + 'src/accredor.js');
		var sourceCode = userCode + ';' + this.jquery.toString() + this.jqueryCookie.toString() + accCode.toString();
		var final_code = UglifyJS.minify(sourceCode, {
			fromString : true
		});
		
		return final_code.code;
	};
};

module.exports = new Generator();