import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { appendItemToBasket, getBasket, getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { ADDITIONAL_COPIES, DELIVERY_DETAILS, DELIVERY_OPTIONS, EMAIL_OPTIONS } from "../../model/template.paths";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import CertificateSessionData from "session/CertificateSessionData";
import { DELIVERY_OPTION_SELECTION } from "../../model/error.messages";
import { createGovUkErrorData } from "../../model/govuk.error.data";
import { BY_ITEM_KIND, StaticRedirectCallback } from "./StaticRedirectCallback";
import { getBasketLink } from "../../utils/basket.utils";
import { BasketLink } from "../../model/BasketLink";
import { mapPageHeader } from "../../utils/page.header.utils";

const DELIVERY_OPTION_FIELD: string = "deliveryOptions";
const PAGE_TITLE: string = "Delivery options - Order a certificate - GOV.UK";
const logger = createLogger(APPLICATION_NAME);

const validators = [
    check("deliveryOptions").not().isEmpty().withMessage(DELIVERY_OPTION_SELECTION)
];


export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const basketLink: BasketLink = await getBasketLink(req);
        const pageHeader = mapPageHeader(req);
        const EXPRESS_COST =  "50";
        const STANDARD_COST = "15";
        const EXPRESS_DISPATCH_TEXT = "£50 for express dispatch to a UK or international address. Orders received before 11am will be sent out the same working day. Orders received after 11am will be sent out the next working day. We send UK orders by Royal Mail 1st Class post and international orders by Royal Mail International post.";
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(DELIVERY_OPTIONS, {
            DISPATCH_DAYS,
            EXPRESS_COST,
            STANDARD_COST,
            EXPRESS_DISPATCH_TEXT,
            deliveryOption: certificateItem.itemOptions.deliveryTimescale,
            templateName: DELIVERY_DETAILS,
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

const route = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const deliveryOption: string = req.body[DELIVERY_OPTION_FIELD];
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            const errorText = errorArray[errorArray.length - 1].msg as string;
            const EXPRESS_COST =  "50";
            const STANDARD_COST = "15";
            const deliveryOptionsErrorData = createGovUkErrorData(errorText, "#deliveryOptions", true, "");
            return res.render(DELIVERY_OPTIONS, {
                DISPATCH_DAYS,
                EXPRESS_COST,
                STANDARD_COST,
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                deliveryOptionsErrorData,
                errorList: [deliveryOptionsErrorData]
            });
        } else {
            let certificateItemPatchRequest: CertificateItemPatchRequest;
            if (deliveryOption === "standard") {
                certificateItemPatchRequest = {
                    itemOptions: {
                        deliveryTimescale: deliveryOption,
                        includeEmailCopy: false
                    }
                };
            } else {
                certificateItemPatchRequest = {
                    itemOptions: {
                        deliveryTimescale: deliveryOption
                    }
                };
            }
            const certificatePatchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItemPatchRequest);
            logger.info(`Patched certificate item with delivery option, id=${req.params.certificateId}, user_id=${userId}, company_number=${certificatePatchResponse.companyNumber}`);
            const basket = await getBasket(accessToken);
            if (certificateItemPatchRequest.itemOptions?.deliveryTimescale === "same-day") {
                logger.info("same day if satateent to email options")
                return res.redirect(EMAIL_OPTIONS);
            } else if (basket.enrolled) {
                await appendItemToBasket(accessToken, { itemUri: certificateItem.links.self });
                return res.redirect(ADDITIONAL_COPIES);
            } else {
                return res.redirect(DELIVERY_DETAILS);
            }
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined):string => {
    if (certificateItem.itemOptions?.certificateType === "dissolution") {
        return `/company/${certificateItem.companyNumber}/orderable/dissolved-certificates`;
    }
    if (certificateItem.itemOptions?.secretaryDetails?.includeBasicInformation) {
        return "secretary-options";
    } else if (certificateItem.itemOptions?.directorDetails?.includeBasicInformation) {
        return "director-options";
    } else if (certificateItem.itemOptions?.memberDetails?.includeBasicInformation) {
        return "members-options";
    } else if (certificateItem.itemOptions?.designatedMemberDetails?.includeBasicInformation) {
        return "designated-members-options";
    } else if (certificateItem.itemOptions?.principalPlaceOfBusinessDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "principal-place-of-business-options?layout=full" : "principal-place-of-business-options";
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    }
    return "certificate-options";
};

export default [...validators, route];
