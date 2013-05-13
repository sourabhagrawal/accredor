var _ = require('underscore');
var redis = require("redis");
var logger = require(LIB_DIR + 'log_factory').create("cache");
var comb = require("comb");
var Bus = require(LIB_DIR + 'bus');
var experimentsImpl = require(IMPLS_DIR + 'experiments_impl');

var Cache = comb.define(null, {

    instance : {
        constructor : function(options) {
            options = options || {};
            this._super(arguments);
            client = redis.createClient();
        },

        updateOrAddToCache : function(userId, experimentId) {
            var ref = this;
            var userKey = "user:" + userId + ":experiments";

            client.exists(userKey, function(err, reply) {
                if (err) {
                    logger.error(err);
                } else {
                    if (reply == 0) {
                        ref.fetchDataFromDb(userId, function(err, experimentIds) {
                            if (err) {
                                logger.error(err);
                            } else {
                                ref.cacheExperiments(userId, experimentIds);
                            }
                        });
                    }
                    else
                        client.sadd(userKey, experimentId);
                }
            });
        },

        cacheExperiments : function(userId, experimentIds) {
            var bus = new Bus();
            var userKey = "user:" + userId + ":experiments";

            client.llen("experiment_keys", function(err, reply) {
                if (err) {
                    logger.error(err);
                } else {
                    //Do I need a transaction here to ensure both operation succeeded.
                    bus.fire("cache_experiment", reply);
                }
            });

            bus.on("cache_experiment", function(cacheCount) {

                if (cacheCount == CACHE_LIMIT) {
                    client.lpop("experiment_keys", function(err, reply) {
                        if (err) {
                            logger.error(err);
                        } else {
                            client.del(reply);
                        }
                    });
                }
                client.rpush("experiment_keys", userKey);

                _.each(experimentIds, function(experimentId) {
                    client.sadd(userKey, experimentId);
                });

            });
        },

        fetchDataFromDb : function(userId, callback) {
            var ref = this;
            experimentsImpl.search(function(err, data) {
                if (err) {
                    callback(err, false);
                } else {
                    var experiments = data.data;
                    var experimentIds = [];
                    _.each(experiments, function(experiment) {
                        var expId = experiment.id;
                        experimentIds.push(expId);
                    });
                    callback(null, experimentIds);
                }
            }, 'userId:eq:' + userId + '__isDisabled:eq:0')
        },

        checkAccessOfExperiments : function(userId, experimentId, callback) {

            var bus = new Bus();
            var ref = this;
            var accessible = false;
            var userKey = "user:" + userId + ":experiments";
            client.sismember(userKey, experimentId, function(err, reply) {
                if (err) {
                    callback(err, null);
                } else {
                    if (reply == 0) {
                        bus.fire("fetch_from_db", userId);
                    } else {
                        callback(null, reply);
                    }
                }
            });

            bus.on("fetch_from_db", function(userId) {
                var accessible = false;
                ref.fetchDataFromDb(userId, function(err, experimentIds) {
                    if (err) {
                        logger.error(err);
                    } else {
                        _.each(experimentIds, function(expId) {
                            if (expId == experimentId)
                                accessible = true;
                        });
                        callback(null, accessible);
                        ref.cacheExperiments(userId, experimentIds);
                    }
                });
            });
        }
    }
});

module.exports = new Cache();