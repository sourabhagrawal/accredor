var step = require('step');
var fs = require('fs');

var replaceImageRefToBase64 = function (root, verbose) {
	function injectBase64Data(base64string, filePath, callback) {
		var regex = new RegExp(filePath.replace(/([.?\/])/ig,'\\$1'), 'g');

		if (!base64string || base64string.length > 32768) {
			base64string = filePath;
		} else {
			if (filePath.match(/\.gif/i)) {
				base64string = 'data:image/gif;base64,'+base64string;
			} else if (filePath.match(/\.jpe?g/i)) {
				base64string = 'data:image/jpg;base64,'+base64string;
			} else {
				base64string = 'data:image/png;base64,'+base64string;
			}
		}

		callback({
			'regex': regex
			, 'data': base64string
		});
	}
	function getFileData(filePath, stepCallback) {
		filePath = filePath.replace(/(url\(|\))/g,'').replace(/'/g,'').replace(/"/g,'');
		if (filePath.match(/^ *http:\/\//i)) {
			var RequestProxy = fs.RequestProxy = function () {
				events.EventEmitter.call(this);
				var body = '';
				this.end = function() {
					fetchCallback(null, body);
				};
				this.write = function(data) {
					body += data.toString('base64');
				};
			};
			sys.inherits(RequestProxy, events.EventEmitter);

			var responseBodyStream = new RequestProxy();
			request({'uri': filePath, 'responseBodyStream': responseBodyStream}, function(){});
		} else {
			var data = null;
			for(var i = 0; i < root.length; i++){
				var dir = root[i];
				try{
					data = fs.readFileSync(dir + filePath);
					if(data) break;
				}catch(e){
					if (verbose)
						console.log(e);
				}
			}
			
			if(data){
				injectBase64Data(data.toString('base64'), filePath, function(content) {
					stepCallback(null, content);
				});
			}else{
				throw new Error('Failed: ' + filePath);
			}
		}
	}
	return function(file, path, index, isLast, callback) {
		var files = file.match(/url\(([^)]+)\)/g);

		if (!files) {
			callback(file);
			return;
		}

		step(function () {
			var group = this.group();

			files.forEach(function (filePath) {
				getFileData(filePath, group());
			});
		}, function (err, contents) {
			if (err) {
				throw err;
			}
			contents.forEach(function (imageData) {
				file = file.replace(imageData.regex, imageData.data);
			});
			if (verbose) {
				console.log('Finished generating: '+path);
			}
			callback(file);
		});
	};
};

exports.replaceImageRefToBase64 = replaceImageRefToBase64;