import {Request, Response, NextFunction} from "express";
import {
    DISSOLVED_CERTIFICATE_TYPE,
    CERTIFICATE_TYPE,
    replaceCompanyNumber,
    LLP_CERTIFICATE_TYPE, LP_CERTIFICATE_TYPE
} from "../../model/page.urls";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile";
import {getCompanyProfile} from "../../client/api.client";
import {createLogger} from "ch-structured-logging";
import {
    APPLICATION_NAME,
    API_KEY,
    DISPATCH_DAYS,
} from "../../config/config";
import {YOU_CANNOT_USE_THIS_SERVICE} from "../../model/template.paths";
import {CompanyType} from "../../model/CompanyType";
import {FEATURE_FLAGS} from "../../config/FeatureFlags";

type LandingPage = { landingPage: string, startNowUrl: string, serviceUrl: string }
type CompanyDetail = { companyNumber: string, type: string };

const logger = createLogger(APPLICATION_NAME);
const featureFlagsOnStrategy = ({companyNumber, type}: CompanyDetail): LandingPage => {
    let landingPage: LandingPage;

    if (CompanyType.LIMITED_PARTNERSHIP === type) {
        landingPage = {
            landingPage: "certificates/lp-certificates/index",
            startNowUrl: replaceCompanyNumber(LP_CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/lp-certificates`
        };
        logger.debug(`Certificates Home Controller - Active Limited Partnership Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    } else if (CompanyType.LIMITED_LIABILITY_PARTNERSHIP === type) {
        landingPage = {
            landingPage: "certificates/llp-certificates/index",
            startNowUrl: replaceCompanyNumber(LLP_CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/llp-certificates`
        };
        logger.debug(`Certificates Home Controller - Active Limited Liability Partnership Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    } else {
        landingPage = {
            landingPage: "certificates/index",
            startNowUrl: replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/certificates`
        };
        logger.debug(`Certificates Home Controller - Active Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    }
    return landingPage;
}

const lpFeatureFlagOnStrategy = ({companyNumber, type}: CompanyDetail): LandingPage => {
    let landingPage: LandingPage;

    if (CompanyType.LIMITED_PARTNERSHIP === type) {
        landingPage = {
            landingPage: "certificates/lp-certificates/index",
            startNowUrl: replaceCompanyNumber(LP_CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/lp-certificates`
        };
        logger.debug(`Certificates Home Controller - Active Limited Partnership Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    } else {
        landingPage = {
            landingPage: "certificates/index",
            startNowUrl: replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/certificates`
        };
        logger.debug(`Certificates Home Controller - Active Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    }
    return landingPage;
}

const llpFeatureFlagOnStrategy = ({companyNumber, type}: CompanyDetail): LandingPage => {
    let landingPage: LandingPage;

    if (CompanyType.LIMITED_LIABILITY_PARTNERSHIP === type) {
        landingPage = {
            landingPage: "certificates/llp-certificates/index",
            startNowUrl: replaceCompanyNumber(LLP_CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/llp-certificates`
        };
        logger.debug(`Certificates Home Controller - Active Limited Liability Partnership Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    } else {
        landingPage = {
            landingPage: "certificates/index",
            startNowUrl: replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber),
            serviceUrl: `/company/${companyNumber}/orderable/certificates`
        };
        logger.debug(`Certificates Home Controller - Active Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
    }
    return landingPage;
}

const featureFlagsOffStrategy = ({companyNumber}: CompanyDetail): LandingPage => {
    const landingPage: LandingPage = {
        landingPage: "certificates/index",
        startNowUrl: replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber),
        serviceUrl: `/company/${companyNumber}/orderable/certificates`
    }
    logger.debug(`Certificates Home Controller - Active Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);

    return landingPage;
}

let strategy: ({companyNumber, type}: CompanyDetail) => LandingPage;

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
        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName: string = companyProfile.companyName;
        const companyStatus = companyProfile.companyStatus;
        const companyType = companyProfile.type;
        const moreTabUrl = "/company/" + companyNumber + "/more";

        const acceptableCompanyTypes = [
            CompanyType.LIMITED_LIABILITY_PARTNERSHIP,
            CompanyType.LIMITED_COMPANY,
            CompanyType.PUBLIC_LIMITED_COMPANY,
            CompanyType.OLD_PUBLIC_COMPANY,
            CompanyType.PRIVATE_LIMITED_GUARANT_NSC,
            CompanyType.PRIVATE_LIMITED_GUARANT_NSC_LIMITED_EXEMPTION,
            CompanyType.PRIVATE_LIMITED_SHARES_SECTION_30_EXEMPTION,
            CompanyType.PRIVATE_UNLIMITED,
            CompanyType.PRIVATE_UNLIMITED_NSC
        ];
        // Allow limited partnership certificate if company is active
        if (companyStatus === "active") {
            acceptableCompanyTypes.push(CompanyType.LIMITED_PARTNERSHIP)
        }

        const allow: boolean = acceptableCompanyTypes.some(type => type === companyType);
        if (allow && ["active", "dissolved"].includes(companyStatus)) {

            let landingPage: LandingPage;

            if (companyStatus === "dissolved") {
                landingPage = {
                    landingPage: "certificates/index",
                    startNowUrl: replaceCompanyNumber(DISSOLVED_CERTIFICATE_TYPE, companyNumber),
                    serviceUrl: `/company/${companyNumber}/orderable/dissolved-certificates`
                }

                logger.debug(`Certificates Home Controller - Dissolved Company, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, start_now_url=${landingPage.startNowUrl}`);
            } else {
                landingPage = strategy(companyProfile);
            }

            logger.debug(`Rendering ${landingPage}, company_status=${companyStatus}, start_now_url=${landingPage.startNowUrl}, company_number=${companyNumber}, service_url=${landingPage.serviceUrl}, dispatch_days=${DISPATCH_DAYS}, more_tab_url=${moreTabUrl}`);
            res.render(landingPage.landingPage, {
                companyStatus,
                startNowUrl: landingPage.startNowUrl,
                companyNumber,
                SERVICE_URL: landingPage.serviceUrl,
                DISPATCH_DAYS,
                moreTabUrl,
                companyName
            });
        } else {
            const SERVICE_NAME = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, {SERVICE_NAME});
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
