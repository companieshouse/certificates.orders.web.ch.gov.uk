import {NextFunction, Request, Response} from "express";

import {getAccessToken, getUserId} from "../../../session/helper";
import {
    CertificateItem,
    CertificateItemPostRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {getCompanyProfile, postCertificateItem} from "../../../client/api.client";
import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS,
    replaceCertificateId
} from "../../../model/page.urls";
import {createLogger} from "ch-structured-logging";
import {API_KEY, APPLICATION_NAME} from "../../../config/config";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import CertificateItemFactory from "../model/CertificateItemFactory";
import {CompanyStatus} from "../model/CompanyStatus";
import {YOU_CANNOT_USE_THIS_SERVICE} from "../../../model/template.paths";
import {CompanyStatusHelper} from "./CompanyStatusHelper";

const logger = createLogger(APPLICATION_NAME);

const companyStatusHelper = new CompanyStatusHelper({
    [CompanyStatus.ACTIVE]: LLP_CERTIFICATE_OPTIONS,
    [CompanyStatus.LIQUIDATION]: LLP_CERTIFICATE_OPTIONS,
    [CompanyStatus.DISSOLVED]: DISSOLVED_CERTIFICATE_DELIVERY_DETAILS
});

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        logger.debug(`LLP Certificate render - company_number=${req?.params?.companyNumber}`);

        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, req.params.companyNumber);

        if (!companyStatusHelper.companyStatusValid(companyProfile.companyStatus)) {
            res.status(400).render(YOU_CANNOT_USE_THIS_SERVICE, {});
            return;
        }

        const certificateItemRequest: CertificateItemPostRequest = new CertificateItemFactory(companyProfile).createInitialRequest();
        const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);
        logger.info(`Certificate Item created, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

        res.redirect(replaceCertificateId(companyStatusHelper.redirectPathByCompanyStatus(companyProfile.companyStatus), certificateItem.id));
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};