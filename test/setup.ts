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
process.env.CACHE_SERVER = "secret";
process.env.API_URL = "http://apiurl.co";
process.env.CHS_URL = "http://chsurl.co";
