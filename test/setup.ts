import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import chaiHttp = require("chai-http");

chai.use(chaiHttp);
chai.use(sinonChai);
chai.use(chaiAsPromised);

// global.expect = chai.expect;
// (global as any)['expect'] = chai.expect;

process.env.PIWIK_URL = "test";
process.env.PIWIK_SITE_ID = "test";
process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
process.env.CACHE_SERVER = "secret";
process.env.API_URL = "api url";
process.env.CHS_URL = "chs url";
