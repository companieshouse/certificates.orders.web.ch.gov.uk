import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import router from "./routers/routers";
import {ERROR_SUMMARY_TITLE} from "./model/error.messages";
import {PIWIK_SITE_ID, PIWIK_URL} from "./session/config";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
  viewPath,
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components",
], {
  autoescape: true,
  express: app,
});

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("PIWIK_URL", PIWIK_URL);
env.addGlobal("PIWIK_SITE_ID", PIWIK_SITE_ID);
env.addGlobal("ERROR_SUMMARY_TITLE", ERROR_SUMMARY_TITLE);

// serve static assets in development.
// this will execute in production for now, but we will host these else where in the future.
if (process.env.NODE_ENV !== "production") {
  app.use("/orderable/certificates/static", express.static("dist/static"));
  env.addGlobal("CSS_URL", "/orderable/certificates/static/app.css");
  env.addGlobal("FOOTER", "/orderable/certificates/static/footer.css");
} else {
  app.use("/orderable/certificates/static", express.static("static"));
  env.addGlobal("CSS_URL", "/orderable/certificates/static/app.css");
  env.addGlobal("FOOTER", "/orderable/certificates/static/footer.css");
}

// apply our default router to /
app.use("/orderable/certificates", router);

export default app;
