import { NextFunction, Request, Response } from "express";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getAccessToken, getUserId } from "../../session/helper";
import { getCertificateItem } from "../../client/api.client";
import { DELIVERY_DETAILS, DELIVERY_OPTIONS, EMAIL_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { setServiceUrl } from "../../utils/service.url.utils";
import { Session } from "@companieshouse/node-session-handler";
import CertificateSessionData from "session/CertificateSessionData";

const PAGE_TITLE: string = "Delivery options - Order a certificate - GOV.UK";
const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        logger.info(`Get certificate item, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(EMAIL_OPTIONS, {
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
        return res.redirect(DELIVERY_DETAILS);
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined):string => {
    if (certificateItem.itemOptions?.certificateType === "dissolution") {
        return `/company/${certificateItem.companyNumber}/orderable/dissolved-certificates`;
    }
    return DELIVERY_OPTIONS;
};

export default  [route];
