var accredor = {};
accredor.data = {
	exs : [{
		id : 1,
		ls : [{
			url : 'http://localhost:10010/'
		},{
			url : 'http://localhost:10010/index'
		}],
		vs : [{
			id : 1,
			type : 'url',
			script : 'http://localhost:10010/index2',
			percent : '100.0'
		},{
			id : 2,
			type : 'url',
			isControl : 1,
			script : 'http://localhost:10010/index',
			percent : '0.0'
		},{
			id : 3,
			type : 'url',
			script : 'http://localhost:10010/index3',
			percent : '0.0'
		}]
	}],
	
	gs : [{
		id : 1,
		url : 'http://localhost:10010/index2',
		type : 'visit'
	},{
		id : 2,
		url : 'http://localhost:10010/index2',
		type : 'engagement'
	}]
};

(function($){
	$.cookie.json = true;
	
	var d = accredor.data;
	
	var matchLinks = function(ls){
		for(var i in ls){
			var l = ls[i];
			if(l.url){
				if(window.location.href == l.url){
					return true;
				}
			}
		};
		return false;
	};
	
	var chooseVariation = function(vs){
		var num = Math.floor((Math.random()*100)+1);
		
		if(vs){
			var offset = 0.0;
			for(var i in vs){
				var v = vs[i];
				if(v.percent){
					try{
						var fPercent = parseFloat(v.percent);
						if(num >= offset && num < (offset + fPercent)){
							//Apply variation
							return v;
						}else{
							offset += fPercent;
						}
					}catch(e){}
				}
			};
		}
		return false;
	};
	
	var sendBeacon = function(url){
		if($.browser.webkit)
			$.getJSON(url + "&callback=?");
		else
			new Image().src = url;
	};
	
	var markVariationInCookie = function(v, eid){
		var value = $.cookie("acc.track");
		if(!value) value = {};
		if(!value.vs) value.vs = {};
		value.vs[eid] = v.id;
		
		$.cookie("acc.track", value, {expires : 1});
	};
	
	var fetchOldVariation = function(eid){
		var value = $.cookie("acc.track");
		if(value && value.vs && value.vs[eid])
			return value.vs[eid];
		return null;
	};
	
	var generateVariationTrackUrl = function(v, eid){
		return 'http://localhost:10002/variations/?message=' + eid + ":" + v.id;
	};
	
	var applyVariation = function(v, eid, skipBeacon){
		if(v && v.script){
			/**
			 * Mark that variation is going to be applied.
			 * 	Mark the cookie
			 * 	Send a beacon
			 * and then apply it
			 */
			
			//Marking cookie
			markVariationInCookie(v, eid);
			
			if(skipBeacon != true){
				//Sending beacon
				var url = generateVariationTrackUrl(v, eid);
				sendBeacon(url);
			}
			
			if(v.isControl != 1){
				//Applying variation
				window.location.replace(v.script);
			}
		}
	};
	
	var findVariationById = function(vs, vid){
		if(vs){
			for(var i in vs){
				var v = vs[i];
				if(v.id){
					if(v.id == vid)
						return v;
				}
			};
		}
		
		return false;
	};
	
	/**
	 * iterate over experiments to see if variations have to be applied.
	 */
	if(d && d.exs && d.exs.length > 0){
		d.exs.forEach(function(ex){
			if(ex.ls && ex.ls.length > 0){
				var matched = matchLinks(ex.ls);
				if(matched){
					/**
					 * The link has matched. This means a variation can be applied here. 
					 * Now we have to see if the user has already been applies with a variation from this experiment.
					 * If yes, Apply the same variation.
					 * else, it is a new user. Figure out which variation to apply based on variation percentages.
					 */
					var isNew = true;
					
					var oldVId = fetchOldVariation(ex.id);
					if(oldVId){
						var v = findVariationById(ex.vs, oldVId);
						if(v){
							isNew = false;
							applyVariation(v, ex.id, true); //Applying an old variation
						}
					}
					
					if(isNew){
						var v = chooseVariation(ex.vs);
						if(v){ // A variation has been choosen
							applyVariation(v, ex.id);
						}
					}
				}
			}
		});
	}
	
	var matchGoalUrl = function(g){
		if(g.url == window.location.href){
			return true;
		}
		return false;
	};
	
	var markGoalInCookie = function(g){
		var value = $.cookie("acc.track");
		if(!value) value = {};
		if(!value.gs) value.gs = [];
		value.gs.push(g.id);
		
		$.cookie("acc.track", value, {expires : 1});
	};
	
	var isGoalMarked = function(g){
		var value = $.cookie("acc.track");
		
		if(value && value.gs && value.gs.length > 0){
			var index = $.inArray(g.id, value.gs);
			if(index != -1)
				return true;
		}
		
		return false;
	};
	
	var getMarkedVariations = function(){
		var value = $.cookie("acc.track");
		if(value && value.vs){
			return value.vs;
		}
		return null;
	};
	
	var generateGoalTrackUrl = function(g){
		var vs  = getMarkedVariations();
		if(vs){
			var message = '';
			jQuery.each(vs, function(eid, vid) {
				if(message != '')
					message += '__';
				message += g.id + ":" + eid + ":" + vid;
			});
			return 'http://localhost:10002/goals/?message=' + message;
		}
		
		return false;
	};
	
	var markGoal = function(g){
		console.log("in markGoal");
		if(g){
			// Mark the goal in cookie
			markGoalInCookie(g);
			
			//Send beacon
			var url = generateGoalTrackUrl(g);
			if(url)
				sendBeacon(url);
		}
	};
	
	/**
	 * iterate over goals to see if we have to listen for any
	 */
	if(d && d.gs && d.gs.length){
		d.gs.forEach(function(g){
			var matched = matchGoalUrl(g);
			if(matched){
				/**
				 * The goal url has matched. Handle the goal according to goal type
				 * If this user has already been marked for this goal, skip
				 */
				if(!isGoalMarked(g)){
					if(g.type && g.type == 'visit'){
						//Mark the goal and Send a beacon
						markGoal(g);
					}else if(g.type && g.type == 'engagement'){
						function onClick(){
							markGoal(g);
							$(document).off('click', onClick);
						}
						//Add a listener to listen to a global click
						$(document).click(onClick);
					}
				}
			}
		});
	}
}(jQuery));