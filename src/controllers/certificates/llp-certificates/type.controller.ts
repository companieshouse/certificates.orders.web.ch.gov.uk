import { Request, Response, NextFunction } from "express";

import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { postCertificateItem, getCompanyProfile } from "../../../client/api.client";
import { LLP_CERTIFICATE_OPTIONS, replaceCertificateId, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS } from "../../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME, API_KEY } from "../../../config/config";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import CertificateItemFactory from "../model/CertificateItemFactory";
import {CompanyStatus} from "../model/CompanyStatus";
import { FEATURE_FLAGS } from "../../../config/FeatureFlags";
import { YOU_CANNOT_USE_THIS_SERVICE } from "../../../model/template.paths";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.debug(`LLP Certificate render - company_number=${req?.params?.companyNumber}`);

        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, req.params.companyNumber);

        const validCompanyStatuses = {
            "active": true,
            "dissolved": true,
            "liquidation": FEATURE_FLAGS.liquidatedCompanyCertficiateEnabled
        };

        if(!validCompanyStatuses[companyProfile.companyStatus]) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
            return;
        }

        const certificateItemRequest: CertificateItemPostRequest = new CertificateItemFactory(companyProfile).createInitialRequest();
        const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);
        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        res.redirect(replaceCertificateId(companyProfile.companyStatus === CompanyStatus.DISSOLVED ? DISSOLVED_CERTIFICATE_DELIVERY_DETAILS : LLP_CERTIFICATE_OPTIONS, certificateItem.id));
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};
