import { NextFunction, Request, RequestHandler, Response } from "express";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import { getExtraData, getAccessToken, addExtraData } from "../session/helper";
import { postCertificateItem } from "../client/api.client";
import { ApplicationData } from "model/session.data";
import { CERTIFICATE_OPTIONS, replaceCompanyNumber } from "./../model/page.urls";

export default async (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== "/") {
        const currentApplicationData: any = await getExtraData(req.session);
        const companyNumber = req.params.companyNumber;
        console.log("currentApplicationData")
        console.log(currentApplicationData);
        if (!currentApplicationData?.certificate?.id) {
            console.log("setting data")
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
            const extraData = await addExtraData(req.session, applicationData);
            console.log(extraData);
            const certificateOptionssUrl = replaceCompanyNumber(CERTIFICATE_OPTIONS, companyNumber);
            return res.redirect(certificateOptionssUrl);
        } else if (currentApplicationData.certificate.companyNumber !== companyNumber) {
            // clear data and redirect to certitifce toptions page
        }
    }
    next();
};