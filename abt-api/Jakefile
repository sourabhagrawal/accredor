desc('This is the default task.');
task('default', ['test'], function (params) {
  console.log('This is the default task.');
});

desc('This will drop and create schema');
task('createDB', function (dbUser, dbName) {
	jake.exec(['mysql -u' + dbUser + ' ' + dbName + ' < sql/create_schema.sql'], function () {
    	console.log('Schema recreated');
    	complete();
  	}, {
  		printStdout: true,
  		printStderr : true
  	});
});

desc('This will execute all the tests.');
task('test',['createDB[root,abt]'], {async: true}, function () {
	jake.exec(['vows test/suites/* --spec'], function () {
    	console.log('All tests passed.');
    	complete();
  	}, {
  		printStdout: true,
  		printStderr : true
  	});
});
