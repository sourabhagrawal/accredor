/**
 * This file contains the constants defined for entities. 
 * Will contain entity specific data, like name, states, etc.
 */


/**
 * Experiment entity
 */
EXPERIMENT = {
	name : 'experiment',
	
	//States
	CREATED : 'created',
	STARTED : 'started',
	STOPPED : 'stopped',
	
	types : {
		SPLITTER : 'splitter'
	}
};

/**
 * Variation entity
 */
VARIATION = {
	name : 'variation',
	
	types : {
		URL : 'URL'
	}
};

/**
 * Goal entity
 */
GOAL = {
	name : 'goal',
	
	CREATED : 'created',
	STOPPED : 'stopped',
	
	types : {
		VISIT : 'visit',
		ENGAGEMENT : 'engagement',
		CLICK : 'click'
	}
};

/**
 * Email entity
 */
EMAIL = {
	name : 'email',
	
	// States
	QUEUED : 'queued',
	PROCESSING : 'processing',
	SENT : 'sent',
	FAILED : 'failed'
};
