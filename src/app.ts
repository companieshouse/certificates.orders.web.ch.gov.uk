import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "@companieshouse/node-session-handler";

import certRouter from "./routers/certificates/routers";
import lpCertRouter from "./routers/certificates/lp-certificates/routers";
import llpCertRouter from "./routers/certificates/llp-certificates/routers";
import certCopyRouter from "./routers/certified-copies/routers";
import missingImageDeliveryRouter from "./routers/missing-image-deliveries/routers";

import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageUrls from "./model/page.urls";
import { createLoggerMiddleware } from "ch-structured-logging";
import authMiddleware from "./middleware/auth.middleware";
import authCertificateMiddleware from "./middleware/certificates/auth.middleware";
import authCertifiedCopyMiddleware from "./middleware/certified-copies/auth.middleware";
import authMissingImageDeliveryMiddleware from "./middleware/missing-image-deliveries/auth.middleware";

import {
    PIWIK_SITE_ID,
    PIWIK_URL,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    APPLICATION_NAME,
    SERVICE_NAME_CERTIFICATES,
    PIWIK_SERVICE_NAME_CERTIFICATES,
    SERVICE_NAME_CERTIFIED_COPIES,
    PIWIK_SERVICE_NAME_CERTIFIED_COPIES,
    SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    SERVICE_NAME_GENERIC,
    CERTIFICATE_PIWIK_START_GOAL_ID,
    CERTIFIED_COPIES_PIWIK_START_GOAL_ID,
    MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID,
    DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID,
    CHS_URL,
    DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED,
    DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED,
    SERVICE_NAME_LP_CERTIFICATES,
    SERVICE_NAME_LLP_CERTIFICATES,
    PIWIK_SERVICE_NAME_LLP_CERTIFICATES,
    PIWIK_SERVICE_NAME_LP_CERTIFICATES,
    LP_CERTIFICATE_PIWIK_START_GOAL_ID, LLP_CERTIFICATE_PIWIK_START_GOAL_ID
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
    pageUrls.CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    pageUrls.CERTIFICATE_DIRECTOR_OPTIONS,
    pageUrls.LP_CERTIFICATE_TYPE,
    pageUrls.LP_CERTIFICATE_OPTIONS,
    pageUrls.LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS,
    pageUrls.LLP_CERTIFICATE_OPTIONS,
    pageUrls.LLP_CERTIFICATE_TYPE,
    pageUrls.LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS,
    pageUrls.LLP_CERTIFICATE_MEMBERS_OPTIONS,
    pageUrls.DISSOLVED_CERTIFICATE_OPTIONS,
    pageUrls.DISSOLVED_CERTIFICATE_TYPE,
    pageUrls.DISSOLVED_CERTIFICATE_CHECK_DETAILS,
    pageUrls.DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    pageUrls.CERTIFIED_COPY_DELIVERY_DETAILS,
    pageUrls.CERTIFIED_COPY_CHECK_DETAILS,
    pageUrls.MISSING_IMAGE_DELIVERY_CREATE,
    pageUrls.MISSING_IMAGE_DELIVERY_CHECK_DETAILS
];

app.use(PROTECTED_PATHS, createLoggerMiddleware(APPLICATION_NAME));
app.use([pageUrls.ROOT_CERTIFICATE, pageUrls.ROOT_CERTIFICATE_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT_CERTIFICATE, authMiddleware);
app.use(pageUrls.ROOT_CERTIFICATE_ID, authCertificateMiddleware);

app.use([pageUrls.LP_ROOT_CERTIFICATE, pageUrls.LP_ROOT_CERTIFICATE_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.LP_ROOT_CERTIFICATE, authMiddleware);
app.use(pageUrls.LP_ROOT_CERTIFICATE_ID, authCertificateMiddleware);

app.use([pageUrls.LLP_ROOT_CERTIFICATE, pageUrls.LLP_ROOT_CERTIFICATE_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.LLP_ROOT_CERTIFICATE, authMiddleware);
app.use(pageUrls.LLP_ROOT_CERTIFICATE_ID, authCertificateMiddleware);

app.use([pageUrls.ROOT_DISSOLVED_CERTIFICATE, pageUrls.ROOT_DISSOLVED_CERTIFICATE_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT_DISSOLVED_CERTIFICATE, authMiddleware);
app.use(pageUrls.ROOT_DISSOLVED_CERTIFICATE_ID, authCertificateMiddleware);

app.use([pageUrls.ROOT_CERTIFIED_COPY, pageUrls.ROOT_CERTIFIED_COPY_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.ROOT_CERTIFIED_COPY_ID, authCertifiedCopyMiddleware);

app.use([pageUrls.ROOT_MISSING_IMAGE_DELIVERY, pageUrls.ROOT_MISSING_IMAGE_DELIVERY_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use([pageUrls.MISSING_IMAGE_DELIVERY_CREATE, pageUrls.ROOT_MISSING_IMAGE_DELIVERY_ID], authMissingImageDeliveryMiddleware);

app.use((req, res, next) => {
    if (req.path.includes("/certificates")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_CERTIFICATES);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", CERTIFICATE_PIWIK_START_GOAL_ID);
    } else if (req.path.includes("/dissolved-certificates")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_CERTIFICATES);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID", DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID);
    } else if (req.path.includes("/certified-copies")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_CERTIFIED_COPIES);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFIED_COPIES);
        env.addGlobal("CERTIFIED_COPIES_PIWIK_START_GOAL_ID", CERTIFIED_COPIES_PIWIK_START_GOAL_ID);
    } else if (req.path.includes("missing-image-deliveries")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_MISSING_IMAGE_DELIVERY);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY);
        env.addGlobal("MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID", MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID);
    } else if (req.path.includes("/lp-certificates")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_LP_CERTIFICATES);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_LP_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", LP_CERTIFICATE_PIWIK_START_GOAL_ID);
    } else if (req.path.includes("/llp-certificates")) {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_LLP_CERTIFICATES);
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_LLP_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", LLP_CERTIFICATE_PIWIK_START_GOAL_ID);
    } else {
        env.addGlobal("SERVICE_NAME", SERVICE_NAME_GENERIC);
        env.addGlobal("PIWIK_SERVICE_NAME", "");
        env.addGlobal("SERVICE_PATH", "");
    }
    next();
});

app.set("views", viewPath);
app.set("view engine", "html");

// add global variables to all templates
env.addGlobal("CDN_URL", process.env.CDN_HOST);
env.addGlobal("CHS_URL", CHS_URL);
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
if (DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED === "true") {
    app.use("/", lpCertRouter);
}
if (DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED === "true") {
    app.use("/", llpCertRouter);
}
app.use("/", certCopyRouter);
app.use("/", missingImageDeliveryRouter);

export default app;
