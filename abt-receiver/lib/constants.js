var CONFIG = require('config');

/**
 * HTTP Codes
 */
LOGIN_REQUIRED = 601;

/**
 * Paths
 */
LIB_DIR = __dirname + '/';
BUCKETS_DIR = __dirname + '/../buckets/';
SUBSCRIBERS_DIR = __dirname + '/../subscribers/';
CLIENTS_DIR = CONFIG.dirs.clients;

/**
 * Channels
 */
CHANNEL_VARIATIONS = 'variations';
CHANNEL_GOALS = 'goals';