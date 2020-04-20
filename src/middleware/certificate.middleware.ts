import { NextFunction, Request, Response } from "express";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import { getExtraData, getAccessToken } from "../session/helper";
import { postCertificateItem } from "../client/api.client";
import { ApplicationData, APPLICATION_DATA_KEY } from "../model/session.data";
import { CERTIFICATE_OPTIONS, replaceCompanyNumber } from "./../model/page.urls";

export default async (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== "/") {
        const currentApplicationData: ApplicationData = getExtraData(req.session);
        const companyNumber = req.params.companyNumber;

        if (!currentApplicationData?.certificate?.id) {
            const certificateItemRequest: CertificateItemPostRequest = {
                companyNumber: req.params.companyNumber,
                itemOptions: {
                    certificateType: "incorporation-with-all-name-changes",
                    collectionLocation: "cardiff",
                    deliveryTimescale: "standard",
                },
                quantity: 1,
            };
            const accessToken: string = getAccessToken(req.session);
            const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);

            const applicationData: ApplicationData = {
                certificate: {
                    companyNumber: certificateItem.companyNumber,
                    id: certificateItem.id,
                },
            };

            req.session.
                map((value) => value.saveExtraData(APPLICATION_DATA_KEY, applicationData));

            return next();
        } else if (currentApplicationData.certificate.companyNumber !== companyNumber) {
            // clear data and redirect to certificate toptions page
        }
    }
    return next();
};