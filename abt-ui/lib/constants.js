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
DOMAIN_HOST = "accredor.com";
DOMAIN_NAME = "Accredor";
DOMAIN_SUPPORT_ID = "support@accredor.com";

/**
 * Environment related
 */
ENVIRONMENT = process.env.NODE_ENV;
IS_PROD = ENVIRONMENT == 'production';
