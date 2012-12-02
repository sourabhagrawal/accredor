/**
 * Initialize all routes
 */
module.exports = function(app){
	require('./experiments_route')(app);
	require('./variations_route')(app);
	require('./links_route')(app);
	require('./users_route')(app);
	require('./emails_route')(app);
};