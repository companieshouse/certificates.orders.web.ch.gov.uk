import { Request, Response, NextFunction } from "express";

import { getAccessToken } from "../session/helper";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { postCertificateItem } from "../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "./../model/page.urls";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const companyNumber = req.params.companyNumber;

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

        res.redirect(replaceCertificateId(CERTIFICATE_OPTIONS, certificateItem.id));
    } catch (err) {
        next(err);
    }
};
