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

        try {
            if (!currentApplicationData?.certificate?.id) {
                // create certificate if it does not exist in session
                const accessToken: string = getAccessToken(req.session);
                const applicationData: ApplicationData = await createCertificate(companyNumber, accessToken);

                req.session.map((value) => value.saveExtraData(APPLICATION_DATA_KEY, applicationData));
                await req.app.locals.saveSession(req.session.unsafeCoerce());

                return res.redirect(replaceCompanyNumber(CERTIFICATE_OPTIONS, companyNumber));

            } else if (currentApplicationData.certificate.companyNumber !== companyNumber) {
                // clear extra data in session and create certificate if the company number in the session
                // does not match the one in the request
                req.session.map((value) => value.saveExtraData(APPLICATION_DATA_KEY, {}));
                await req.app.locals.saveSession(req.session.unsafeCoerce());

                const accessToken: string = getAccessToken(req.session);
                const applicationData: ApplicationData = await createCertificate(companyNumber, accessToken);

                req.session.map((value) => value.saveExtraData(APPLICATION_DATA_KEY, applicationData));
                await req.app.locals.saveSession(req.session.unsafeCoerce());

                return res.redirect(replaceCompanyNumber(CERTIFICATE_OPTIONS, companyNumber));
            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    }
    return next();
};

const createCertificate = async (companyNumber, accessToken) => {
    const certificateItemRequest: CertificateItemPostRequest = {
        companyNumber,
        itemOptions: {
            certificateType: "incorporation-with-all-name-changes",
            collectionLocation: "cardiff",
            deliveryTimescale: "standard",
        },
        quantity: 1,
    };

    const certificateItem: CertificateItem = await postCertificateItem(accessToken, certificateItemRequest);

    const applicationData: ApplicationData = {
        certificate: {
            companyNumber: certificateItem.companyNumber,
            id: certificateItem.id,
        },
    };
    return applicationData;
}