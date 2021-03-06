var assetHandler = require('connect-assetmanager-handlers');
var customAssetHandler = require(LIB_DIR + 'asset_handler');

var assetGroups = function(){
	var roots = [__dirname + '/../public/lib/bootstrap/img/',
	            __dirname + '/../public/lib/ericka/img/'];
	var debug = (!IS_PROD);
	var config = {
	    /**
	     * CSS Groups
	     */
		css_common: {
	        'route': /\/static\/css\/common\.css/, 
	        'path': './public/', 
	        'dataType': 'css', 
	        'files': [ 
				'/lib/bootstrap/css/bootstrap.css', 
				'/lib/bootstrap/css/bootstrap-responsive.css',
				'/lib/ericka/style/flexslider.css',
				'/lib/ericka/style/prettyPhoto.css',
				'/lib/ericka/style/style.css',
				'/lib/ericka/style/blue.css',
				'/css/abt.css'
	        ],
	        'preManipulate': {
	            // Regexp to match user-agents including MSIE.
	            'MSIE': [
//	                assetHandler.yuiCssOptimize,
	                assetHandler.fixVendorPrefixes,
	                assetHandler.fixGradients,
	                assetHandler.stripDataUrlsPrefix
	            ],
	            // Matches all (regex start line)
	            '^': [
//	                assetHandler.yuiCssOptimize,
	                assetHandler.fixVendorPrefixes,
	                assetHandler.fixGradients, 
	                customAssetHandler.replaceImageRefToBase64(roots),
	            ]
	        },
	        debug : debug
	    },
	    
	    /**
	     * JS Groups
	     */
	    js_common : {
	    	'route': /\/static\/js\/common\.js/, 
	        'path': './public/', 
	        'dataType': 'javascript', 
	        'files': [ 
				'/lib/jquery-ui/js/jquery-1.8.2.js',
				'/lib/jquery-ui/js/jquery-ui-1.9.0.custom.js',
				'/lib/spin.min.js',
				'/lib/jquery.spin.js',
				'/lib/utils/jquery.cookie.js',
				'/lib/backbone/underscore.js',
				'/lib/backbone/backbone.js',
				'/lib/backbone/backbone.localStorage.js',
				'/lib/bootstrap/js/bootstrap.js',
				
				'lib/ericka/js/html5shim.js',
				'/lib/ericka/js/jquery.flexslider-min.js',
				'/lib/ericka/js/jquery.isotope.js',
				'/lib/ericka/js/jquery.prettyPhoto.js',
				'/lib/ericka/js/filter.js',
				'/lib/ericka/js/jquery.tweet.js',
				'/lib/ericka/js/custom.js',
				
				'/js/lang/en.js',
				'/js/common/template_loader.js',
				'/js/common/utils.js',
				'/js/common/init.js',
				
				'/js/views/base_view.js',
				'/js/views/base_login_view.js',
				'/js/views/login_box_view.js',
				'/js/views/signup_view.js',
				'/js/views/forgot_view.js',
				'/js/views/header_view.js',
				'/js/views/split_experiment_view.js',
				'/js/views/create_goal_view.js',
				'/js/views/experiments_list_view.js',
				'/js/views/goals_list_view.js',
				'/js/views/list_reports_view.js'
	        ],
	        debug : debug
	    }
	};
	
	this.getAll = function(){
		return config;
	};
};

module.exports = new assetGroups();