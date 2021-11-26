import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import chaiHttp from "chai-http";

chai.use(chaiHttp);
chai.use(sinonChai);
chai.use(chaiAsPromised);

process.env.PIWIK_URL = "test";
process.env.PIWIK_SITE_ID = "test";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.COOKIE_DOMAIN = "cookie domain";
process.env.CACHE_SERVER = "secret";
process.env.CHS_API_KEY = "Xy6onkjQWF0TkRn0hfdq=";
process.env.API_URL = "http://apiurl.co";
process.env.CHS_URL = "http://chsurl.co";
process.env.CERTIFICATE_PIWIK_START_GOAL_ID = "1";
process.env.DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID = "3";
process.env.CERTIFIED_COPIES_PIWIK_START_GOAL_ID = "2";
process.env.MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID = "8";
process.env.LLP_CERTIFICATE_PIWIK_START_GOAL_ID = "4"
process.env.LP_CERTIFICATE_PIWIK_START_GOAL_ID = "5"
process.env.DISPATCH_DAYS = "10";
process.env.DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED = "true";
process.env.DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED = "true";
process.env.LIQUIDATED_COMPANY_CERTIFICATES_ENABLED = "true";

