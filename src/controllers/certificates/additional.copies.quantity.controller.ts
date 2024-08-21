import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { appendItemToBasket, getBasket, getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { DELIVERY_DETAILS, ADDITIONAL_COPIES, ADDITIONAL_COPIES_QUANTITY } from "../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { BY_ITEM_KIND, StaticRedirectCallback } from "./StaticRedirectCallback";
import { getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { mapPageHeader } from "../../utils/page.header.utils";

const logger = createLogger(APPLICATION_NAME);
const ADDITIONAL_COPIES_QUANTITY_OPTION_FIELD: string = "additionalCopiesQuantityOptions";
const PAGE_TITLE: string = "Additional Copies Quantity - Order a certificate - GOV.UK";
const redirectCallback = new StaticRedirectCallback(BY_ITEM_KIND);


export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        
        logger.info(`Render additional copies quantity selection page, certificate item id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        const basketLink: BasketLink = await getBasketLink(req);
        const pageHeader = mapPageHeader(req);
        
        return res.render(ADDITIONAL_COPIES_QUANTITY, {
            templateName: ADDITIONAL_COPIES_QUANTITY,
            pageTitleText: PAGE_TITLE,
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem, req.session),
            ...basketLink,
            ...pageHeader
        });
 
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const errors = validationResult(req);
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const additionalCopiesQuantity: string = req.body[ADDITIONAL_COPIES_QUANTITY_OPTION_FIELD];
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);

        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const additionalCopiesQuantityErrorData = createGovUkErrorData(errorText, "#additionalCopiesQuantity", true, "");
            return res.render(ADDITIONAL_COPIES_QUANTITY, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                additionalCopiesQuantityErrorData,
                errorList: [additionalCopiesQuantityErrorData]
            });
        } else {
            logger.info(`User has selected quantity=${additionalCopiesQuantity} of additional copies`);

            //TO-DO: - BI-12031 - Patch quantity to certificateItemResource

            const basket = await getBasket(accessToken);
            if (basket.enrolled) {
                await appendItemToBasket(accessToken, { itemUri: certificateItem.links.self });
                return redirectCallback.redirectEnrolled({
                    response: res,
                    items: basket.items,
                    deliveryDetails: basket.deliveryDetails
                });
            }
            return res.redirect(DELIVERY_DETAILS);
            
            }
        } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined):string => {
   return ADDITIONAL_COPIES;
};

export default [route];