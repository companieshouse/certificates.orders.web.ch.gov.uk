import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "ch-node-session-handler";

import certRouter from "./routers/certificates/routers";
import certCopyRouter from "./routers/certified-copies/routers";

import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageUrls from "./model/page.urls";
import { createLoggerMiddleware } from "ch-structured-logging";
import authMiddleware from "./middleware/auth.middleware";
import authCertificateMiddleware from "./middleware/certificates/auth.middleware";
import authCertifiedCopyMiddleware from "./middleware/certified-copies/auth.middleware";

import {
    PIWIK_SITE_ID,
    PIWIK_URL,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    APPLICATION_NAME,
    SERVICE_NAME_CERTIFICATES,
    SERVICE_NAME_CERTIFIED_COPIES,
    SERVICE_NAME_GENERIC
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

const cookieConfig: CookieConfig = { cookieName: "__SID", cookieSecret: COOKIE_SECRET, cookieDomain: COOKIE_DOMAIN };
const sessionStore = new SessionStore(new Redis(`redis://${CACHE_SERVER}`));

const PROTECTED_PATHS = [
    pageUrls.CERTIFICATE_OPTIONS,
    pageUrls.CERTIFICATE_TYPE,
    pageUrls.CERTIFICATE_CHECK_DETAILS,
    pageUrls.CERTIFICATE_DELIVERY_DETAILS,
    pageUrls.CERTIFIED_COPY_DELIVERY_DETAILS,
    pageUrls.CERTIFIED_COPY_CHECK_DETAILS
];

app.use(PROTECTED_PATHS, createLoggerMiddleware(APPLICATION_NAME));
app.use([pageUrls.ROOT_CERTIFICATE, pageUrls.ROOT_CERTIFICATE_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT_CERTIFICATE, authMiddleware);
app.use(pageUrls.ROOT_CERTIFICATE_ID, authCertificateMiddleware);

app.use([pageUrls.ROOT_CERTIFIED_COPY, pageUrls.ROOT_CERTIFIED_COPY_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT_CERTIFIED_COPY_ID, authCertifiedCopyMiddleware);

app.use((req, res, next) => {
  if(req.path.includes('/certificates')) {
    env.addGlobal("SERVICE_NAME", SERVICE_NAME_CERTIFICATES);
  } else if(req.path.includes('/certified-copies')) {
    env.addGlobal("SERVICE_NAME", SERVICE_NAME_CERTIFIED_COPIES);
  } else {
    env.addGlobal("SERVICE_NAME", SERVICE_NAME_GENERIC);
  }
  next();
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
    app.use("/orderable/certificates-assets/static", express.static("dist/static"));
    env.addGlobal("CSS_URL", "/orderable/certificates-assets/static/app.css");
    env.addGlobal("FOOTER", "/orderable/certificates-assets/static/footer.css");
} else {
    app.use("/orderable/certificates-assets/static", express.static("static"));
    env.addGlobal("CSS_URL", "/orderable/certificates-assets/static/app.css");
    env.addGlobal("FOOTER", "/orderable/certificates-assets/static/footer.css");
}

// apply our default router to /
app.use("/", certRouter);
app.use("/", certCopyRouter);

export default app;
