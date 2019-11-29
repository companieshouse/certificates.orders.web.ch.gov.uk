import * as express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import router from "./routers";

const app = express();

// set some app variables from the environment
app.set("port", process.env.PORT || "3000");
app.set("dev", process.env.NODE_ENV === "development");

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
  app.use("/static", express.static("dist/static"));
  env.addGlobal("CSS_URL", "/static/app.css");
}
// apply our default router to /
app.use("/", router);

export default app;
