var CONFIG = require('config');

/**
 * HTTP Codes
 */
LOGIN_REQUIRED = 601;

/**
 * Domain related
 */
DOMAIN_HOST = CONFIG.domain.host;
DOMAIN_NAME = CONFIG.domain.name;
DOMAIN_SUPPORT_ID = CONFIG.domain.support_id;

/**
 * Paths
 */
LIB_DIR = __dirname + '/';
CLIENTS_DIR = CONFIG.dirs.clients;
DAOS_DIR = __dirname + '/../daos/';
IMPLS_DIR = __dirname + '/../impls/';
EMAILS_DIR = __dirname + '/../views/emails/';