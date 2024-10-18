import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
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
import { renderPage } from "../../utils/render.utils";
import { ADDITIONAL_COPIES_QUANTITY_OPTION_SELECTION } from "../../model/error.messages";

const logger = createLogger(APPLICATION_NAME);
const ADDITIONAL_COPIES_QUANTITY_OPTION_FIELD: string = "additionalCopiesQuantityOptions";
const PAGE_TITLE: string = "Additional Copies Quantity - Order a certificate - GOV.UK";
const redirectCallback = new StaticRedirectCallback(BY_ITEM_KIND);

const validators = [
    check("additionalCopiesQuantityOptions").not().isEmpty().withMessage(ADDITIONAL_COPIES_QUANTITY_OPTION_SELECTION)
];

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`Render additional copies quantity selection page`);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const backLink = ADDITIONAL_COPIES;

        await renderPage(req, res, ADDITIONAL_COPIES_QUANTITY, PAGE_TITLE, certificateItem, backLink, 1);
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
            const additionalCopiesQuantityErrorData = createGovUkErrorData(errorText, "#additionalCopiesQuantityOptions", true, "");
            return res.render(ADDITIONAL_COPIES_QUANTITY, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                additionalCopiesQuantityErrorData,
                errorList: [additionalCopiesQuantityErrorData]
            });
        } else {
            const baseQuantity = 1;
            logger.info(`User has selected ${additionalCopiesQuantity} additional copies`);
            const certificateItemPatchRequest: CertificateItemPatchRequest = {
                quantity : baseQuantity + parseInt(additionalCopiesQuantity)
            };
            
            const patchedCertificateItem = await patchCertificateItem(accessToken, req.params.certificateId, certificateItemPatchRequest);
            logger.info(`Patched certificate item with delivery option, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchedCertificateItem.companyNumber}`);
            logger.info(`Quantity has been updated to: ${patchedCertificateItem.quantity} ` );
            const basket = await getBasket(accessToken);
            if (basket.enrolled) {
                await appendItemToBasket(accessToken,{ itemUri: patchedCertificateItem.links.self});
                return redirectCallback.redirectEnrolled({
                    response: res,
                    items: basket.items,
                    deliveryDetails: basket.deliveryDetails,
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

export default [...validators, route];