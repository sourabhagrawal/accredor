var CONFIG = require('config');

/**
 * HTTP Codes
 */
LOGIN_REQUIRED = 601;

/**
 * Paths
 */
LIB_DIR = __dirname + '/';

/**
 * Domain related
 */
DOMAIN_HOST = CONFIG.domain.host;
DOMAIN_NAME = CONFIG.domain.name;
DOMAIN_SUPPORT_ID = CONFIG.domain.support_id;

/**
 * Environment related
 */
ENVIRONMENT = process.env.NODE_ENV;
IS_PROD = ENVIRONMENT == 'production';
