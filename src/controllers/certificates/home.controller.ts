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
    DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED,
    DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED
} from "../../config/config";
import {YOU_CANNOT_USE_THIS_SERVICE} from "../../model/template.paths";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName: string = companyProfile.companyName;
        const companyStatus = companyProfile.companyStatus;
        const companyType = companyProfile.type;
        const moreTabUrl = "/company/" + companyNumber + "/more";

        let acceptableCompanyTypes = [
            "llp",
            "ltd",
            "plc",
            "old-public-company",
            "private-limited-guarant-nsc",
            "private-limited-guarant-nsc-limited-exemption",
            "private-limited-shares-section-30-exemption",
            "private-unlimited",
            "private-unlimited-nsc"
        ];
        // Allow limited partnership certificate if company is active
        if (companyStatus === "active") {
            acceptableCompanyTypes = [...acceptableCompanyTypes, "limited-partnership"];
        }

        let startNowUrl;
        let SERVICE_URL;

        const allow: boolean = acceptableCompanyTypes.some(type => type === companyType);
        if (allow && ["active", "dissolved"].includes(companyStatus)) {

            let landingPage: string;

            if (companyStatus === "dissolved") {
                landingPage = "certificates/index";
                SERVICE_URL = `/company/${companyNumber}/orderable/dissolved-certificates`;
                startNowUrl = replaceCompanyNumber(DISSOLVED_CERTIFICATE_TYPE, companyNumber);
                logger.debug(`Certificates Home Controller - Dissolved Company, company_number=${companyNumber}, service_url=${SERVICE_URL}, start_now_url=${startNowUrl}`);
            } else {
                if (DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED === "true" && companyType === "limited-partnership") {
                    landingPage = "certificates/lp-certificates/index";
                    SERVICE_URL = `/company/${companyNumber}/orderable/lp-certificates`;
                    startNowUrl = replaceCompanyNumber(LP_CERTIFICATE_TYPE, companyNumber);
                    logger.debug(`Certificates Home Controller - Active Limited Partnership Company, company_number=${companyNumber}, service_url=${SERVICE_URL}, start_now_url=${startNowUrl}`);
                } else if (DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED === "true" && companyType === "llp") {
                    landingPage = "certificates/llp-certificates/index";
                    SERVICE_URL = `/company/${companyNumber}/orderable/llp-certificates`;
                    startNowUrl = replaceCompanyNumber(LLP_CERTIFICATE_TYPE, companyNumber);
                    logger.debug(`Certificates Home Controller - Active Limited Liability Partnership Company, company_number=${companyNumber}, service_url=${SERVICE_URL}, start_now_url=${startNowUrl}`);
                } else {
                    landingPage = "certificates/index";
                    SERVICE_URL = `/company/${companyNumber}/orderable/certificates`;
                    startNowUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
                    logger.debug(`Certificates Home Controller - Active Company, company_number=${companyNumber}, service_url=${SERVICE_URL}, start_now_url=${startNowUrl}`);
                }
            }

            logger.debug(`Rendering ${landingPage}, company_status=${companyStatus}, start_now_url=${startNowUrl}, company_number=${companyNumber}, service_url=${SERVICE_URL}, dispatch_days=${DISPATCH_DAYS}, more_tab_url=${moreTabUrl}`);
            res.render(landingPage, {
                companyStatus,
                startNowUrl,
                companyNumber,
                SERVICE_URL,
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
