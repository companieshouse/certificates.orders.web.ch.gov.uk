import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postInitialCertificateItem } from "../../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { FEATURE_FLAGS } from "../../config/FeatureFlags";
import { CompanyStatus } from "./model/CompanyStatus";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../model/template.paths";
import { BadRequest } from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        logger.debug(`Certificate render function called, company_number=${companyNumber}`);
        const userId = getUserId(req.session);
        const certificateItemRequest = createCertificateItemRequest(companyNumber);
        const certificateItem: CertificateItem = await postInitialCertificateItem(accessToken, certificateItemRequest);
        const companyStatus = certificateItem.itemOptions.companyStatus;

        if (companyStatus === CompanyStatus.ACTIVE || (companyStatus === CompanyStatus.LIQUIDATION && FEATURE_FLAGS.liquidatedCompanyCertficiateEnabled)) {
            logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
            res.redirect(replaceCertificateId(CERTIFICATE_OPTIONS, certificateItem.id));
        } else if (companyStatus === CompanyStatus.DISSOLVED) {
            logger.info(`Dissolved certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
            res.redirect(replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id));
        } else {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        }
    } catch (err) {
        if (err === BadRequest) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
        } else {
            logger.error(`${err}`);
            next(err);
        }
    }
};

const createCertificateItemRequest = (companyNumber: string): CertificateItemPostRequest => {
    return {
        companyNumber,
        itemOptions: {
            deliveryMethod: "postal",
            deliveryTimescale: "standard"
        },
        quantity: 1
    };
};
