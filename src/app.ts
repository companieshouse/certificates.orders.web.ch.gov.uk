import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import router from "./routers";

const app = express();

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
env.addGlobal("PIWIK_URL", "https://example.com");
env.addGlobal("PIWIK_SITE_ID", "123");

// serve static assets in development. this will not execute in production.
if (process.env.NODE_ENV === "development") {
  app.use("/orderable/certificates/static", express.static("dist/static"));
  env.addGlobal("CSS_URL", "/orderable/certificates/static/app.css");
}
// apply our default router to /
app.use("/orderable/certificates", router);

export default app;
