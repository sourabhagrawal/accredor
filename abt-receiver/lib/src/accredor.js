(function($){
	$.cookie.json = true;
	
	var d = accredor.data;
	
	var applyUrlAdjustments = function(url){
		if(!url) // If null
			return;
		
		// trim it.
		url = $.trim(url);
		
		// Remove hash.
		var hashIndex = url.indexOf('#');
		if (hashIndex > 0) {
			url = url.substring(0, hashIndex);
		}
		
		// Remove trailing /'s
		url = url.replace(/\/+$/, "");
		
		//Remove http or https
		if(url.indexOf('http') != -1){ // ohh duh!!
			url = url.replace(/(http:\/\/|https:\/\/)/, '');
		}
		
		// Remove dubdubdub
		url = url.replace('www\.', '');
		
		// Remove query params ?? TODO
		
		return url;
	};
	
	var trackCookie = "acc.track";
	var pendingCookie = 'acc.pending';
	var receiverURL = accredor.receiverURL || 'http://localhost:10002/';
	var currentURL = applyUrlAdjustments(window.location.href);
	
	var matchLinks = function(ls){
		for(var i in ls){
			var l = ls[i];
			if(l.url){
				var url = applyUrlAdjustments(l.url);
				if(currentURL == url){
					return true;
				}
			}
		};
		return false;
	};
	
	var setCookie = function(name, value){
		$.cookie(name, value, {expires : 1, path: '/'});
	};
	
	var queue = function(url){
		var value = $.cookie(pendingCookie);
		if(value != '')
			value += '|||';
		setCookie(pendingCookie, value + url);
	};
	
	var send = function(){
		var value = $.cookie(pendingCookie);
		if(value && value.trim() != ''){
			var tokens = value.split('|||');
			if(tokens.length > 0){
				var url = receiverURL + tokens[0];
				
				new Image().src = url;
				
				tokens.splice(0, 1);
				value = tokens.join('|||');
				setCookie(pendingCookie, value);
				
				send();
			}
		}
	};
	setInterval(send, 10000);
	
	send(); // Send pending beacons from previous page
	
	var VariationHandler = function(){
		this.chooseVariation = function(vs){
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
		
		this.markVariationInCookie = function(v, eid){
			var value = $.cookie(trackCookie);
			if(!value) value = {};
			if(!value.vs) value.vs = {};
			value.vs[eid] = v.id;
			
			setCookie(trackCookie, value);
		};
		
		this.fetchOldVariation = function(eid){
			var value = $.cookie(trackCookie);
			if(value && value.vs && value.vs[eid])
				return value.vs[eid];
			return null;
		};
		
		this.generateTrackUrl = function(v, eid){
			return 'variations/?message=' + eid + ":" + v.id;
		};
		
		this.applyVariation = function(v, eid, skipBeacon){
			if(v && v.script){
				/**
				 * Mark that variation is going to be applied.
				 * 	Mark the cookie
				 * 	Send a beacon
				 * and then apply it
				 */
				if(skipBeacon != true){ // New variation to be applied
					//Marking cookie
					this.markVariationInCookie(v, eid);
					
					//Sending beacon
					var url = this.generateTrackUrl(v, eid);
					queue(url);
				}
				
				if(v.isControl != 1){
					//Applying variation
					window.location.replace(v.script);
				}
			}
		};
		
		this.findVariationById = function(vs, vid){
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
	};
	
	var variationHandler = new VariationHandler();
	
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
					
					var oldVId = variationHandler.fetchOldVariation(ex.id);
					if(oldVId){
						var v = variationHandler.findVariationById(ex.vs, oldVId);
						if(v){
							isNew = false;
							variationHandler.applyVariation(v, ex.id, true); //Applying an old variation
						}
					}
					
					if(isNew){
						var v = variationHandler.chooseVariation(ex.vs);
						if(v){ // A variation has been choosen
							variationHandler.applyVariation(v, ex.id);
						}
					}
				}
			}
		});
	}
	
	var GoalHandler = function(){
		this.matchGoalUrl = function(g){
			var url = applyUrlAdjustments(g.url);
			if(url == currentURL){
				return true;
			}
			return false;
		};
		
		this.markGoalInCookie = function(g){
			var value = $.cookie(trackCookie);
			if(!value) value = {};
			if(!value.gs) value.gs = [];
			value.gs.push(g.id);
			
			setCookie(trackCookie, value);
		};
		
		this.isGoalMarked = function(g){
			var value = $.cookie(trackCookie);
			
			if(value && value.gs && value.gs.length > 0){
				var index = $.inArray(g.id, value.gs);
				if(index != -1)
					return true;
			}
			
			return false;
		};
		
		this.getMarkedVariations = function(){
			var value = $.cookie(trackCookie);
			if(value && value.vs){
				return value.vs;
			}
			return null;
		};
		
		this.generateTrackUrl = function(g){
			var vs  = this.getMarkedVariations();
			if(vs){
				var message = '';
				jQuery.each(vs, function(eid, vid) {
					if(message != '')
						message += '__';
					message += g.id + ":" + eid + ":" + vid;
				});
				return 'goals/?message=' + message;
			}
			
			return false;
		};
		
		this.markGoal = function(g){
			if(g){
				// Mark the goal in cookie
				this.markGoalInCookie(g);
				
				//Send beacon
				var url = this.generateTrackUrl(g);
				if(url)
					queue(url);
			}
		};
	};
	
	var goalHandler = new GoalHandler();
	
	/**
	 * iterate over goals to see if we have to listen for any
	 */
	if(d && d.gs && d.gs.length){
		d.gs.forEach(function(g){
			var matched = goalHandler.matchGoalUrl(g);
			if(matched){
				/**
				 * The goal url has matched. Handle the goal according to goal type
				 * If this user has already been marked for this goal, skip
				 */
				if(!goalHandler.isGoalMarked(g)){
					if(g.type && g.type == 'visit'){
						//Mark the goal and Send a beacon
						goalHandler.markGoal(g);
					}else if(g.type && g.type == 'engagement'){
						function onClick(){
							goalHandler.markGoal(g);
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