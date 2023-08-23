import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import cookieParser from "cookie-parser";
import actuator from "express-actuator";
import Redis from "ioredis";
import { SessionStore, SessionMiddleware, CookieConfig } from "@companieshouse/node-session-handler";

import certRouter from "./routers/certificates/routers";
import lpCertRouter from "./routers/certificates/lp-certificates/routers";
import llpCertRouter from "./routers/certificates/llp-certificates/routers";
import certCopyRouter from "./routers/certified-copies/routers";
import missingImageDeliveryRouter from "./routers/missing-image-deliveries/routers";
import errorHandlers from "./controllers/error.controller";

import { ERROR_SUMMARY_TITLE } from "./model/error.messages";
import * as pageUrls from "./model/page.urls";
import { createLoggerMiddleware } from "@companieshouse/structured-logging-node";
import authMiddleware from "./middleware/auth.middleware";
import authCertificateMiddleware from "./middleware/certificates/auth.middleware";
import authCertifiedCopyMiddleware from "./middleware/certified-copies/auth.middleware";
import authCertifiedCopyStartNowMiddleware from "./middleware/certified-copies/auth.start.now.middleware";
import authMissingImageDeliveryCreateMiddleware, {
    authMissingImageDeliveryCheckDetailsMiddleware
} from "./middleware/missing-image-deliveries/auth.middleware";

import {
    PIWIK_SITE_ID,
    PIWIK_URL,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    APPLICATION_NAME,
    PIWIK_SERVICE_NAME_CERTIFICATES,
    PIWIK_SERVICE_NAME_CERTIFIED_COPIES,
    PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    CERTIFICATE_PIWIK_START_GOAL_ID,
    CERTIFIED_COPIES_PIWIK_START_GOAL_ID,
    MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID,
    DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID,
    CHS_URL,
    LP_CERTIFICATE_PIWIK_START_GOAL_ID,
    LLP_CERTIFICATE_PIWIK_START_GOAL_ID,
    CERTIFICATE_FEEDBACK_SOURCE,
    LLP_CERTIFICATE_FEEDBACK_SOURCE,
    LP_CERTIFICATE_FEEDBACK_SOURCE,
    MISSING_IMAGE_DELIVERY_COPIES_FEEDBACK_SOURCE,
    CERTIFIED_COPIES_FEEDBACK_SOURCE,
    DISSOLVED_CERTIFICATE_FEEDBACK_SOURCE
} from "./config/config";
import { FEATURE_FLAGS } from "./config/FeatureFlags";

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const actuatorOptions = {
    basePath: "/certificates-orders-web", // It will set /management/info instead of /info
    /* infoGitMode: "simple", */ // the amount of git information you want to expose, 'simple' or 'full',
    infoBuildOptions: undefined, // extra information you want to expose in the build object. Requires an object.
    infoDateFormat: undefined, // by default, git.commit.time will show as is defined in git.properties. If infoDateFormat is defined, moment will format git.commit.time. See https://momentjs.com/docs/#/displaying/format/.
    customEndpoints: [] // array of custom endpoints
};

app.use(actuator(actuatorOptions));

app.use(function (req, res, next) {
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0");
    next();
});

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
    pageUrls.CERTIFICATE_DELIVERY_OPTIONS,
    pageUrls.CERTIFICATE_EMAIL_OPTIONS,
    pageUrls.CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    pageUrls.CERTIFICATE_DIRECTOR_OPTIONS,
    pageUrls.LP_CERTIFICATE_TYPE,
    pageUrls.LP_CERTIFICATE_OPTIONS,
    pageUrls.LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS,
    pageUrls.LP_CERTIFICATE_DELIVERY_DETAILS,
    pageUrls.LP_CERTIFICATE_DELIVERY_OPTIONS,
    pageUrls.LP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS,
    pageUrls.LP_CERTIFICATE_CHECK_DETAILS,
    pageUrls.LLP_CERTIFICATE_OPTIONS,
    pageUrls.LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    pageUrls.LLP_CERTIFICATE_TYPE,
    pageUrls.LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS,
    pageUrls.LLP_CERTIFICATE_MEMBERS_OPTIONS,
    pageUrls.LLP_CERTIFICATE_DELIVERY_DETAILS,
    pageUrls.LLP_CERTIFICATE_DELIVERY_OPTIONS,
    pageUrls.LLP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS,
    pageUrls.LLP_CERTIFICATE_CHECK_DETAILS,
    pageUrls.DISSOLVED_CERTIFICATE_OPTIONS,
    pageUrls.DISSOLVED_CERTIFICATE_TYPE,
    pageUrls.DISSOLVED_CERTIFICATE_CHECK_DETAILS,
    pageUrls.DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    pageUrls.DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS,
    pageUrls.DISSOLVED_CERTIFICATE_EMAIL_OPTIONS,
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
app.use(pageUrls.ROOT_CERTIFIED_COPY, authCertifiedCopyStartNowMiddleware);
app.use(pageUrls.ROOT_CERTIFIED_COPY_ID, authCertifiedCopyMiddleware);

app.use([pageUrls.ROOT_MISSING_IMAGE_DELIVERY, pageUrls.ROOT_MISSING_IMAGE_DELIVERY_ID], SessionMiddleware(cookieConfig, sessionStore));
app.use(pageUrls.MISSING_IMAGE_DELIVERY_CREATE, authMissingImageDeliveryCreateMiddleware);
app.use(pageUrls.ROOT_MISSING_IMAGE_DELIVERY_ID, authMissingImageDeliveryCheckDetailsMiddleware);

app.use((req, res, next) => {
    if (req.path.includes("/certificates")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", CERTIFICATE_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", CERTIFICATE_FEEDBACK_SOURCE);
    } else if (req.path.includes("/dissolved-certificates")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID", DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", DISSOLVED_CERTIFICATE_FEEDBACK_SOURCE);
    } else if (req.path.includes("/certified-copies")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFIED_COPIES);
        env.addGlobal("CERTIFIED_COPIES_PIWIK_START_GOAL_ID", CERTIFIED_COPIES_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", CERTIFIED_COPIES_FEEDBACK_SOURCE);
    } else if (req.path.includes("missing-image-deliveries")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY);
        env.addGlobal("MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID", MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", MISSING_IMAGE_DELIVERY_COPIES_FEEDBACK_SOURCE);
    } else if (req.path.includes("/lp-certificates")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", LP_CERTIFICATE_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", LP_CERTIFICATE_FEEDBACK_SOURCE);
    } else if (req.path.includes("/llp-certificates")) {
        env.addGlobal("PIWIK_SERVICE_NAME", PIWIK_SERVICE_NAME_CERTIFICATES);
        env.addGlobal("CERTIFICATE_PIWIK_START_GOAL_ID", LLP_CERTIFICATE_PIWIK_START_GOAL_ID);
        env.addGlobal("FEEDBACK_SOURCE", LLP_CERTIFICATE_FEEDBACK_SOURCE);
    } else {
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
env.addGlobal("ACCOUNT_URL", process.env.ACCOUNT_URL);
env.addGlobal("CHS_MONITOR_GUI_URL", process.env.CHS_MONITOR_GUI_URL);

app.use("/orderable/certificates-assets/static", express.static("static"));
env.addGlobal("CSS_URL", "/orderable/certificates-assets/static/app.css");
env.addGlobal("FOOTER", "/orderable/certificates-assets/static/footer.css");
env.addGlobal("MOBILE_MENU", "/orderable/certificates-assets/static/js/mobile-menu.js");

// apply our default router to /
app.use("/", certRouter);
if (FEATURE_FLAGS.lpCertificateOrdersEnabled) {
    app.use("/", lpCertRouter);
}
if (FEATURE_FLAGS.llpCertificateOrdersEnabled) {
    app.use("/", llpCertRouter);
}
app.use("/", certCopyRouter);
app.use("/", missingImageDeliveryRouter);
app.use(errorHandlers);

export default app;
