import { Request, Response, NextFunction } from "express";
import { DISSOLVED_CERTIFICATE_TYPE, CERTIFICATE_TYPE, replaceCompanyNumber } from "../../model/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, API_KEY, DISPATCH_DAYS } from "../../config/config";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyStatus = companyProfile.companyStatus;
        const companyType = companyProfile.type;
        const moreTabUrl = "/company/" + companyNumber + "/more";
        const acceptableCompanyTypes = [
            "limited-partnership",
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
        let startNowUrl;
        let SERVICE_URL;

        if (companyStatus === "dissolved") {
            acceptableCompanyTypes.shift(); // Remove limited-partnership from list
            SERVICE_URL = `/company/${companyNumber}/orderable/dissolved-certificates`;
            startNowUrl = replaceCompanyNumber(DISSOLVED_CERTIFICATE_TYPE, companyNumber);
        } else {
            SERVICE_URL = `/company/${companyNumber}/orderable/certificates`;
            startNowUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
        }
        const allow: boolean = acceptableCompanyTypes.some(type => type === companyType);

        if (allow && ["active", "dissolved"].includes(companyStatus)) {
            res.render("certificates/index", { companyStatus, startNowUrl, companyNumber, SERVICE_URL, DISPATCH_DAYS, moreTabUrl });
        } else {
            const SERVICE_NAME = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, { SERVICE_NAME });
        };
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
