import { Request, Response, NextFunction } from "express";
import { CERTIFIED_COPY_FILING_HISTORY, replaceCompanyNumber } from "../../model/page.urls";
import { CERTIFIED_COPY_INDEX, YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { CHS_URL, API_KEY, APPLICATION_NAME } from "../../config/config";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        const startNowUrl = `${CHS_URL}${replaceCompanyNumber(CERTIFIED_COPY_FILING_HISTORY, companyNumber)}`;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyType = companyProfile.type;
        const filingHistory = companyProfile.links.filingHistory;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;

        if (!filingHistory || (filingHistory && companyType === "uk-establishment")) {
            const SERVICE_NAME = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, { SERVICE_NAME });
        } else {
            res.render(CERTIFIED_COPY_INDEX, { startNowUrl, companyNumber, SERVICE_URL });
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
