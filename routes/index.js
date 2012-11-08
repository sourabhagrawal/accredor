module.exports = function(app){
	require('./experiments_route')(app);
	require('./variations_route')(app);
};