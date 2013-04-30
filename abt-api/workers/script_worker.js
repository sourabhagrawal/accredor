var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("script_worker");
var scriptDetailsImpl = require(IMPLS_DIR + 'script_details_impl');
var experimentsImpl = require(IMPLS_DIR + 'experiments_impl');
var variationsImpl = require(IMPLS_DIR + 'variations_impl');
var linksImpl = require(IMPLS_DIR + 'links_impl');
var filtersImpl = require(IMPLS_DIR + 'filters_impl');
var goalsImpl = require(IMPLS_DIR + 'goals_impl');
var CONFIG = require('config');
var eventEmitter = require('events').EventEmitter;
var Bus = require(LIB_DIR + 'bus');

/**
 * A worker thread that will pick old scripts and generate fresh user data
 */


var ScriptWorker = function() {

    var ref = this;

    //Next 2 lines ??
    CONFIG.script = CONFIG.script || {};
    var interval = CONFIG.script.interval || 5 * 1000; //5 Secs
    var batchSize = CONFIG.script.batchSize || 5;

    this.run = function() {

        var experimentCountMap = {};
        var experimentIds = [];
        var scriptData = {exs : [], gs : []};
        var bus = new Bus();
        var goalsDone = false;
        var experimentsDone = false;

        scriptDetailsImpl.search(function(err, data) {
            if (err) {
                logger.error(err);
            } else {
                if (data && data.data && data.data.length > 0) {
                    var scripts = data.data;
                    _.each(scripts, function(script) {

                        var scriptId = script.id;
                        var userId = script['userId'];
                        bus.fire("search_experiments", scriptId, userId);
                        bus.fire("search_goals", scriptId, userId);
                    });
                } else {
                    logger.info("Nothing to update in script details.");
                }
            }
            setTimeout(ref.run, interval);

        }, 'isOld:eq:1___status:in:' + SCRIPT_DETAILS.NOT_SCRIPTED + ',' + SCRIPT_DETAILS.SCRIPTED, 0, batchSize)

        bus.on('search_experiments', function(scriptId, userId) {
            experimentsImpl.search(function(err, data) {
                if (err) {
                    logger.error(err);
                } else {
                    if (data && data.data && data.data.length > 0) {
                        var experiments = data.data;
                        _.each(experiments, function(experiment) {
                            var experimentId = experiment.id;
                            var experimentData = {
                                id : experimentId,
                                vs : [],
                                ls : [],
                                fs : []
                            };
                            scriptData.exs.push(experimentData);
                            experimentCountMap[experimentId] = 0;
                            experimentIds.push(experimentId);
                            bus.fire("search_variations", experimentId, experimentData, scriptId);
                            bus.fire("search_links", experimentId, experimentData, scriptId);
                            bus.fire("search_filters", experimentId, experimentData, scriptId);
                        });
                    }

                }
            }, 'userId:eq:' + userId + '___isDisabled:eq:0___status:eq:' + EXPERIMENT.STARTED);

        });

        bus.on("search_variations", function(experimentId, experimentData, scriptId) {
            variationsImpl.search(function(err, data) {
                if (err) {
                    logger.log(err)
                } else {
                    if (data && data.data && data.data.length > 0) {
                        var variations = data.data;
                        _.each(variations, function(variation) {
                            experimentData.vs.push({
                                id : variation.id,
                                type : variation.type,
                                isControl : variation.isControl,
                                script :variation.script,
                                percent : variation.percent
                            });
                        });
                    }
                    experimentCountMap[experimentId]++;
                    bus.fire('check_count', experimentId, scriptId)
                }

            }, 'experiment_id:eq:' + experimentId + '__is_disabled:eq:0');
        });

        bus.on("search_links", function(experimentId, experimentData, scriptId) {
            linksImpl.search(function(err, data) {
                if (err) {
                    logger.log(err)
                } else {
                    if (data && data.data && data.data.length > 0) {
                        var links = data.data;
                        _.each(links, function(link) {
                            experimentData.ls.push({
                                id : link.id,
                                url : link.url,
                                type : link.type
                            });
                        });
                    }

                    experimentCountMap[experimentId]++;
                    bus.fire('check_count', experimentId, scriptId)
                }

            }, 'experiment_id:eq:' + experimentId + '__is_disabled:eq:0');
        });

        bus.on("search_filters", function(experimentId, experimentData, scriptId) {
            filtersImpl.search(function(err, data) {
                if (err) {
                    logger.log(err)
                } else {
                    if (data && data.data && data.data.length > 0) {
                        var filters = data.data;
                        _.each(filters, function(filter) {
                            experimentData.fs.push({
                                id : filter.id,
                                type : filter.type,
                                name : filter.name,
                                value : filter.value
                            });
                        });
                    }
                    experimentCountMap[experimentId]++;
                    bus.fire('check_count', experimentId, scriptId)
                }

            }, 'experiment_id:eq:' + experimentId + '__is_disabled:eq:0');
        });

        bus.on('check_count', function(experimentId, scriptId) {
            if (experimentCountMap[experimentId] == 3) {
                bus.fire("check_ex", scriptId);
            }
        });

        bus.on('check_ex', function(scriptId) {
            _.each(experimentIds, function(experimentId) {
                if (experimentCountMap[experimentId] == 3) {
                    experimentsDone = true;
                    bus.fire('check_u', scriptId);
                }
            })
        });

        bus.on('all_data_fetched', function(scriptId) {
            scriptDetailsImpl.update(scriptId, {
                data : JSON.stringify(scriptData),
                isOld : 0,
                status : SCRIPT_DETAILS.NOT_SCRIPTED
            }, function(err, data) {
                if (err) {
                    logger.error(err);
                } else {
                    logger.info('Regenerated script data for script: ' + scriptId);
                }
            })
        });

        //Fetch goals
        bus.on("search_goals", function(scriptId, userId) {
            goalsImpl.search(function(err, data) {
                if (err) {
                    logger.error(err);
                } else {
                    var goals = data.data;
                    if (goals && goals.length > 0) {
                        _.each(goals, function(goal) {
                            scriptData.gs.push({
                                id : goal.id,
                                type : goal.type,
                                url : goal.url
                            });
                        });
                    }
                }
                goalsDone = true;
                bus.fire('check_u', scriptId);
            }, 'userId:eq:' + userId + '___isDisabled:eq:0___status:eq:' + GOAL.CREATED);
        });

        bus.on('check_u', function(scriptId) {
            if (experimentsDone && goalsDone) {
                bus.fire('all_data_fetched', scriptId);
            }
        });
    }
}

module.exports = ScriptWorker;