import { Request, Response, NextFunction } from "express";
import { CERTIFICATE_TYPE, replaceCompanyNumber } from "../../model/page.urls";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, API_KEY } from "../../config/config";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyStatus = companyProfile.companyStatus;
        const companyType = companyProfile.type;
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
        const startNowUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);

        const allow: boolean = acceptableCompanyTypes.some(type => type === companyType);

        if (allow && companyStatus === "active") {
            res.render("certificates/index", { startNowUrl, companyNumber });
        } else {
            const SERVICE_NAME = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, { SERVICE_NAME });
        };
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
