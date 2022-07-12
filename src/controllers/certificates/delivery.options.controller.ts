import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { CertificateItem, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS , EMAIL_OPTIONS} from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, DISPATCH_DAYS } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import CertificateSessionData from "session/CertificateSessionData";
import { DELIVERY_OPTION_SELECTION } from "../../model/error.messages";
import { createGovUkErrorData } from "../../model/govuk.error.data";

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
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(DELIVERY_OPTIONS, {
            DISPATCH_DAYS,
            deliveryOption: certificateItem.itemOptions.deliveryTimescale,
            templateName: DELIVERY_DETAILS,
            pageTitleText: PAGE_TITLE,
            SERVICE_URL: setServiceUrl(certificateItem),
            backLink: setBackLink(certificateItem, req.session)
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
            const deliveryOptionsErrorData = createGovUkErrorData(errorText, "#deliveryOptions", true, "");
            return res.render(DELIVERY_OPTIONS, {
                pageTitleText: PAGE_TITLE,
                SERVICE_URL: setServiceUrl(certificateItem),
                backLink: setBackLink(certificateItem, req.session),
                deliveryOptionsErrorData,
                errorList: [deliveryOptionsErrorData]
            });
        } else {
            let certificateItem: CertificateItemPatchRequest;
            if (deliveryOption === "standard") {
                certificateItem = {
                    itemOptions: {
                        deliveryTimescale: deliveryOption,
                        includeEmailCopy: false
                    }
                };
            } else {
                certificateItem  = {
                    itemOptions: {
                        deliveryTimescale: deliveryOption,
                    }
                };
            }
            const certificatePatchResponse = await patchCertificateItem( accessToken, req.params.certificateId, certificateItem);
            logger.info(`Patched certificate item with delivery option, id=${req.params.certificateId}, user_id=${userId}, company_number=${certificatePatchResponse.companyNumber}`);
            if (certificateItem.itemOptions?.deliveryTimescale === "same-day") {
                return res.redirect(EMAIL_OPTIONS);
            }
            return res.redirect(DELIVERY_DETAILS);
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
    } else if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    }
    return "certificate-options";
};

export default  [...validators, route];
