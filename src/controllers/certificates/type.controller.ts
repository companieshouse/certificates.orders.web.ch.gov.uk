import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/certificates/types";
import { postCertificateItem } from "../../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "./../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;

        const certificateItemRequest: CertificateItemPostRequest = {
            companyNumber,
            itemOptions: {
                certificateType: "incorporation-with-all-name-changes",
                deliveryMethod: "postal",
                deliveryTimescale: "standard"
            },
            quantity: 1
        };
        const userId = getUserId(req.session);
        const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);
        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        res.redirect(replaceCertificateId(CERTIFICATE_OPTIONS, certificateItem.id));
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
