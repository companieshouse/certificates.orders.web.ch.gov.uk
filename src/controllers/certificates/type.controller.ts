import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import { postCertificateItem, getCompanyProfile } from "../../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId, CERTIFICATE_DELIVERY_DETAILS } from "./../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, API_KEY } from "../../config/config";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile/types";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyStatus = companyProfile.companyStatus;

        if (companyStatus === "active") {
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
        } else {
            const certificateItemRequest: CertificateItemPostRequest = {
                companyNumber,
                itemOptions: {
                    certificateType: "dissolution",
                    deliveryMethod: "postal",
                    deliveryTimescale: "standard"
                },
                quantity: 1
            };
            const userId = getUserId(req.session);
            const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);
            logger.info(`Dissolved certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
            res.redirect(replaceCertificateId(CERTIFICATE_DELIVERY_DETAILS, certificateItem.id));
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
