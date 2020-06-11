import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "ch-node-session-handler";

import router from "./routers/routers";
import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageUrls from "./model/page.urls";
import { createLoggerMiddleware } from "ch-structured-logging";
import authMiddleware from "./middleware/auth.middleware";
import authCertificateMiddleware from "./middleware/certificate.auth.middleware";
import {
  PIWIK_SITE_ID, PIWIK_URL, COOKIE_SECRET, COOKIE_DOMAIN, CACHE_SERVER, APPLICATION_NAME,
} from "./config/config";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// where nunjucks templates should resolve to
const viewPath = path.join(__dirname, "views");

// set up the template engine
const env = nunjucks.configure([
    viewPath,
    "node_modules/govuk-frontend/",
    "node_modules/govuk-frontend/components"
], {
    autoescape: true,
    express: app
});

const cookieConfig: CookieConfig = { cookieName: "__SID", cookieSecret: COOKIE_SECRET, cookieDomain: COOKIE_DOMAIN};
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));

const PROTECTED_PATHS =
  [pageUrls.CERTIFICATE_OPTIONS, pageUrls.CERTIFICATE_TYPE, pageUrls.CHECK_DETAILS, pageUrls.DELIVERY_DETAILS];
app.use(PROTECTED_PATHS, createLoggerMiddleware(APPLICATION_NAME));
app.use([pageUrls.ROOT, pageUrls.ROOT_CERTIFICATE], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT, authMiddleware);
app.use(pageUrls.ROOT_CERTIFICATE, authCertificateMiddleware);

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
    app.use("/orderable/certificates-assets/static", express.static("dist/static"));
    env.addGlobal("CSS_URL", "/orderable/certificates-assets/static/app.css");
    env.addGlobal("FOOTER", "/orderable/certificates-assets/static/footer.css");
} else {
    app.use("/orderable/certificates-assets/static", express.static("static"));
    env.addGlobal("CSS_URL", "/orderable/certificates-assets/static/app.css");
    env.addGlobal("FOOTER", "/orderable/certificates-assets/static/footer.css");
}

// apply our default router to /
app.use("/", router);

export default app;
