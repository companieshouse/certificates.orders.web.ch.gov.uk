import {NextFunction, Request, Response} from "express";
import {SessionKey} from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import {SignInInfoKeys} from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {CERTIFICATE_TYPE, LLP_CERTIFICATE_TYPE, LP_CERTIFICATE_TYPE, replaceCompanyNumber} from "./../model/page.urls";
import {createLogger} from "ch-structured-logging";
import {
    API_KEY,
    APPLICATION_NAME
} from "../config/config";
import {getUserId} from "../session/helper";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile";
import {getCompanyProfile} from "../client/api.client";
import {CompanyType} from "model/CompanyType";
import {FEATURE_FLAGS} from "../config/FeatureFlags";

const logger = createLogger(APPLICATION_NAME);

type CompanyDetails = { companyNumber: string, companyType: string }

const featureFlagsOnStrategy = ({companyNumber, companyType} : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.lpCertificateOrdersEnabled && CompanyType.LIMITED_PARTNERSHIP === companyType) {
        returnToUrl = replaceCompanyNumber(LP_CERTIFICATE_TYPE, companyNumber);
    } else if (FEATURE_FLAGS.llpCertificateOrdersEnabled && CompanyType.LIMITED_LIABILITY_PARTNERSHIP === companyType) {
        returnToUrl = replaceCompanyNumber(LLP_CERTIFICATE_TYPE, companyNumber);
    } else {
        returnToUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
    }
    return returnToUrl;
}

const featureFlagsOffStrategy = ({companyNumber: companyNumber } : CompanyDetails): string => {
    return replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
}

const lpFeatureFlagOnStrategy = ({companyNumber, companyType} : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.lpCertificateOrdersEnabled && CompanyType.LIMITED_PARTNERSHIP === companyType) {
        returnToUrl = replaceCompanyNumber(LP_CERTIFICATE_TYPE, companyNumber);
    } else {
        returnToUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
    }
    return returnToUrl;
}

const llpFeatureFlagOnStrategy = ({companyNumber, companyType} : CompanyDetails): string => {
    let returnToUrl: string;
    if (FEATURE_FLAGS.llpCertificateOrdersEnabled && CompanyType.LIMITED_LIABILITY_PARTNERSHIP === companyType) {
        returnToUrl = replaceCompanyNumber(LLP_CERTIFICATE_TYPE, companyNumber);
    } else {
        returnToUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
    }
    return returnToUrl;
}

let strategy: (companyDetail:CompanyDetails) => string;

if (FEATURE_FLAGS.lpCertificateOrdersEnabled && FEATURE_FLAGS.llpCertificateOrdersEnabled) {
    strategy = featureFlagsOnStrategy;
} else if (FEATURE_FLAGS.lpCertificateOrdersEnabled) {
    strategy = lpFeatureFlagOnStrategy;
} else if (FEATURE_FLAGS.llpCertificateOrdersEnabled) {
    strategy = llpFeatureFlagOnStrategy;
} else {
    strategy = featureFlagsOffStrategy;
}

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
                return res.redirect(`/signin?return_to=${strategy({companyNumber, companyType: companyProfile.type})}`);
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
