import { NextFunction, Request, Response } from "express";
import { replaceCompanyNumber, ROOT_CERTIFIED_COPY } from "../../model/page.urls";
import { CERTIFIED_COPY_INDEX, YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { API_KEY, APPLICATION_NAME, CHS_URL, DISPATCH_DAYS } from "../../config/config";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { BasketLimit } from "../../model/BasketLimit";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        let startNowUrl = `${CHS_URL}${replaceCompanyNumber(ROOT_CERTIFIED_COPY, companyNumber)}/start`;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName : string = companyProfile.companyName;
        const companyType = companyProfile.type;
        const filingHistory = companyProfile.links.filingHistory;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;
        const dispatchDays: string = DISPATCH_DAYS;
        const moreTabUrl: string = "/company/" + companyNumber + "/more";
        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);

        if (!filingHistory || (filingHistory && companyType === "uk-establishment")) {
            const SERVICE_NAME = null;
            res.render(YOU_CANNOT_USE_THIS_SERVICE, { SERVICE_NAME });
        } else {
            res.render(CERTIFIED_COPY_INDEX,
                {
                    startNowUrl,
                    companyNumber,
                    SERVICE_URL,
                    dispatchDays,
                    moreTabUrl,
                    companyName,
                    ...basketLink,
                    ...basketLimit });
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
