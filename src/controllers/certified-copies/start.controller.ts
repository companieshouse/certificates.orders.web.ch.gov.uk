import { createLogger } from "ch-structured-logging";
import { API_KEY, APPLICATION_NAME, CHS_URL, DISPATCH_DAYS } from "../../config/config";
import { NextFunction, Request, Response } from "express";
import { BasketLimit, BasketLimitState } from "../../model/BasketLimit";
import { CERTIFIED_COPY_FILING_HISTORY, replaceCompanyNumber } from "../../model/page.urls";
import { getWhitelistedReturnToURL } from "../../utils/request.util";
import { BasketLink } from "../../model/BasketLink";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";
import { CERTIFIED_COPY_INDEX, YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getCompanyProfile } from "../../client/api.client";

const logger = createLogger(APPLICATION_NAME);

/**
 * start controller controls the presentation of a basket limit warning/error and the
 * start now button enabled state as appropriate.
 */
export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.debug(`start controller handler invoked.`);

        const companyNumber: string = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName : string = companyProfile.companyName;
        const companyType = companyProfile.type;
        const filingHistory = companyProfile.links.filingHistory;
        const SERVICE_URL = `/company/${companyNumber}/orderable/certified-copies`;
        const dispatchDays: string = DISPATCH_DAYS;
        const moreTabUrl: string = "/company/" + companyNumber + "/more";
        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);

        if (basketLimit.basketLimitState == BasketLimitState.BELOW_LIMIT) {
            const nextPage = `${CHS_URL}${replaceCompanyNumber(CERTIFIED_COPY_FILING_HISTORY, companyNumber)}`;
            logger.debug(`Basket is not full, redirecting to  ${nextPage}.`)
            res.redirect(getWhitelistedReturnToURL(nextPage))
        } else {
            logger.debug(`Basket is full, display error and disable button.`)
            basketLimit.basketLimitState = BasketLimitState.DISPLAY_LIMIT_ERROR; // styles button as disabled
            const startNowUrl = ""; // really disables the button (actually a link)

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

        }

    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }

};
