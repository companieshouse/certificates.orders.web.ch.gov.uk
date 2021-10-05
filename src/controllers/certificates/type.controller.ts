import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postCertificateItem, getCompanyProfile } from "../../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS } from "./../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, API_KEY } from "../../config/config";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

const logger = createLogger(APPLICATION_NAME);
const INCORPORATION_WITH_ALL_NAME_CHANGES: string = "incorporation-with-all-name-changes";
const DISSOLUTION: string = "dissolution";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, companyNumber);
        const companyStatus = companyProfile.companyStatus;
        logger.debug(`Certificate render function called, company_number=${companyNumber}`);

        if (companyStatus === "active") {
            const certificateItemRequest = createCertificateItemRequest(companyNumber, INCORPORATION_WITH_ALL_NAME_CHANGES, companyProfile.type);
            const userId = getUserId(req.session);
            const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);
            logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
            res.redirect(replaceCertificateId(CERTIFICATE_OPTIONS, certificateItem.id));
        } else {
            const dissolvedCertificateItemRequest = createCertificateItemRequest(companyNumber, DISSOLUTION, companyProfile.type);
            const userId = getUserId(req.session);
            const certificateItem: CertificateItem = await postCertificateItem(accessToken, dissolvedCertificateItemRequest);
            logger.info(`Dissolved certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
            res.redirect(replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id));
        }
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const createCertificateItemRequest = (companyNumber, certificateType: string, companyType: string):CertificateItemPostRequest => {
    return {
        companyNumber,
        itemOptions: {
            companyType: companyType,
            certificateType,
            deliveryMethod: "postal",
            deliveryTimescale: "standard"
        },
        quantity: 1
    };
};
