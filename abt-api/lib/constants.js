var CONFIG = require('config');

/**
 * HTTP Codes
 */
LOGIN_REQUIRED = 601;

/**
 * Paths
 */
CLIENTS_DIR = CONFIG.dirs.clients;
LIB_DIR = __dirname + '/';
DAOS_DIR = __dirname + '/../daos/';
IMPLS_DIR = __dirname + '/../impls/';
EMAILS_DIR = __dirname + '/../views/emails/';

/**
 * Domain related
 */
DOMAIN_HOST = CONFIG.domain.host;
DOMAIN_NAME = CONFIG.domain.name;
DOMAIN_SUPPORT_ID = CONFIG.domain.support_id;

/**
 * Global events
 */
EVENT_MARK_SCRIPT_OLD = 'mark_script_old';

/**
 * Environment related
 */
ENVIRONMENT = process.env.NODE_ENV;
IS_PROD = ENVIRONMENT == 'production';