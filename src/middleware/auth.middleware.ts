import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {
    getStartNowUrl,
    LLP_ROOT_CERTIFICATE,
    LP_ROOT_CERTIFICATE,
    ROOT_CERTIFICATE
} from "./../model/page.urls";
import { createLogger } from "ch-structured-logging";
import {
    API_KEY,
    APPLICATION_NAME
} from "../config/config";
import { getUserId } from "../session/helper";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../client/api.client";
import { CompanyType } from "model/CompanyType";
import { FEATURE_FLAGS } from "../config/FeatureFlags";

const logger = createLogger(APPLICATION_NAME);

type CompanyDetails = { companyNumber: string, companyType: string }

const featureFlagsOnStrategy = ({ companyNumber, companyType } : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.lpCertificateOrdersEnabled && CompanyType.LIMITED_PARTNERSHIP === companyType) {
        logger.debug(`**1**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(LP_ROOT_CERTIFICATE, companyNumber);
    } else if (FEATURE_FLAGS.llpCertificateOrdersEnabled && CompanyType.LIMITED_LIABILITY_PARTNERSHIP === companyType) {
        logger.debug(`**2**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(LLP_ROOT_CERTIFICATE, companyNumber);
    } else {
        logger.debug(`**3**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(ROOT_CERTIFICATE, companyNumber);
    }
    return returnToUrl;
};

const featureFlagsOffStrategy = ({ companyNumber } : CompanyDetails): string => {
    logger.debug(`**4**`); // TODO-12134 Remove this
    return getStartNowUrl(ROOT_CERTIFICATE, companyNumber);
};

const lpFeatureFlagOnStrategy = ({ companyNumber, companyType } : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.lpCertificateOrdersEnabled && CompanyType.LIMITED_PARTNERSHIP === companyType) {
        logger.debug(`**5**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(LP_ROOT_CERTIFICATE, companyNumber);
    } else {
        logger.debug(`**6**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(ROOT_CERTIFICATE, companyNumber);
    }
    return returnToUrl;
};

const llpFeatureFlagOnStrategy = ({ companyNumber, companyType } : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.llpCertificateOrdersEnabled && CompanyType.LIMITED_LIABILITY_PARTNERSHIP === companyType) {
        logger.debug(`**7**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(LLP_ROOT_CERTIFICATE, companyNumber);
    } else {
        logger.debug(`**8**`); // TODO-12134 Remove this
        returnToUrl = getStartNowUrl(ROOT_CERTIFICATE, companyNumber);
    }
    return returnToUrl;
};

let strategy: (companyDetail:CompanyDetails) => string;

if (FEATURE_FLAGS.lpCertificateOrdersEnabled && FEATURE_FLAGS.llpCertificateOrdersEnabled) {
    strategy = featureFlagsOnStrategy;
} else if (FEATURE_FLAGS.lpCertificateOrdersEnabled) {
    strategy = lpFeatureFlagOnStrategy;
} else if (FEATURE_FLAGS.llpCertificateOrdersEnabled) {
    strategy = llpFeatureFlagOnStrategy;
} else {
    strategy = featureFlagsOffStrategy;
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.path !== "/") {
            if (!req.session) {
                logger.info(`${req.url}: Session object is missing!`);
            }
            const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

            if (!signedIn) {
                const companyNumber = req.params.companyNumber;
                const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
                logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
                return res.redirect(`/signin?return_to=${strategy({ companyNumber, companyType: companyProfile.type })}`);
            } else {
                const userId = getUserId(req.session);
                logger.info(`User is signed in, user_id=${userId}`);
            }
        }
        next();
    } catch (err) {
        logger.error(`Authentication middleware: ${err}`);
        next(err);
    }
};
