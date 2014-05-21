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
DOMAIN_HOST = "accredor.com";
DOMAIN_NAME = "Accredor";
DOMAIN_SUPPORT_ID = "support@accredor.com";

/**
 * Global events
 */
EVENT_MARK_SCRIPT_OLD = 'mark_script_old';

/**
 * Environment related
 */
ENVIRONMENT = process.env.NODE_ENV;
IS_PROD = ENVIRONMENT == 'production';