import { NextFunction, Request, Response } from "express";
import { CERTIFIED_COPY_FILING_HISTORY, replaceCompanyNumber, ROOT_CERTIFIED_COPY } from "../../model/page.urls";
import { CERTIFIED_COPY_INDEX, YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { API_KEY, APPLICATION_NAME, CHS_URL, DISPATCH_DAYS } from "../../config/config";
import { getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { getBasketLimit, getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { BasketLimit, BasketLimitState } from "../../model/BasketLimit";
import { getWhitelistedReturnToURL } from "../../utils/request.util";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const companyNumber: string = req.params.companyNumber;
        let startNowUrl = `${CHS_URL}${replaceCompanyNumber(ROOT_CERTIFIED_COPY, companyNumber)}`;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyName : string = companyProfile.companyName;
        const companyType = companyProfile.type;
        const filingHistory = companyProfile.links.filingHistory;
        const SERVICE_URL = "#"; // disable 'Order a certified document' link when already on same page
        const dispatchDays: string = DISPATCH_DAYS;
        const moreTabUrl: string = "/company/" + companyNumber + "/more";
        const basketLink: BasketLink = await getBasketLink(req);
        const basketLimit: BasketLimit = getBasketLimit(basketLink);

        const { redirected, startNowUrl: newStartNowUrl } =
            handleStartNow(req, res, startNowUrl, basketLimit, companyNumber);
        if (redirected) {
            return;
        }
        startNowUrl = newStartNowUrl;

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

/**
 * handleStartNow checks to see whether the incoming request may have resulted from the user clicking
 * on the start now button. If so, it controls the presentation of a basket limit warning/error and the
 * start now button enabled state as appropriate.
 */
const handleStartNow = (req: Request,
                         res: Response,
                         startNowUrl: string,
                         basketLimit: BasketLimit,
                         companyNumber: string) :
    { redirected: boolean, startNowUrl: string } => {
    const referrer = req.header('referrer');
    if (referrer == startNowUrl) { // we are here as a result of start now being clicked
        logger.debug(`Back on ${startNowUrl} again.`)
        if (basketLimit.basketLimitState == BasketLimitState.BELOW_LIMIT) {
            const nextPage = `${CHS_URL}${replaceCompanyNumber(CERTIFIED_COPY_FILING_HISTORY, companyNumber)}`;
            logger.debug(`Basket is not full, redirecting to  ${nextPage}.`)
            res.redirect(getWhitelistedReturnToURL(nextPage))
            return { redirected: true, startNowUrl: startNowUrl };
        } else {
            logger.debug(`Basket is full, display error and disable button.`)
            basketLimit.basketLimitState = BasketLimitState.DISPLAY_LIMIT_ERROR; // styles button as disabled
            startNowUrl = ""; // really disables the button (actually a link)
        }
    }
    return { redirected: false, startNowUrl: startNowUrl };
}
