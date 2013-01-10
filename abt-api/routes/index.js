/**
 * Initialize all routes
 */
module.exports = function(app){
	require('./experiments_route')(app);
	require('./variations_route')(app);
	require('./links_route')(app);
	require('./goals_route')(app);
	require('./users_route')(app);
	require('./emails_route')(app);
	require('./script_details_route')(app);
	require('./contact_leads_route')(app);
	require('./reports_data_route')(app);
	require('./experiment_visits_route')(app);
	require('./goal_visits_route')(app);
};