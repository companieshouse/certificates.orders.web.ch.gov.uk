import { NextFunction, Request, Response } from "express";

import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postInitialCertificateItem } from "../../../client/api.client";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS,
    replaceCertificateId
} from "../../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../../config/config";
import { CompanyStatus } from "../model/CompanyStatus";
import { BadRequest } from "http-errors";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../../model/template.paths";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.debug(`LP Certificate render - company_number=${req?.params?.companyNumber}`);

        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        const certificateItem: CertificateItem = await postInitialCertificateItem(accessToken, {
            companyNumber: req.params.companyNumber
        });

        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        res.redirect(replaceCertificateId(certificateItem.itemOptions.companyStatus === CompanyStatus.ACTIVE ? LP_CERTIFICATE_OPTIONS : DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id));
    } catch (err) {
        if (err === BadRequest) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE);
        } else {
            logger.error(`${err}`);
            next(err);
        }
    }
};
