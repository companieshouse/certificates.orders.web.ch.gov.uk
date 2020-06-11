import { Router, Response, NextFunction, Request } from "express";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import { ROOT, CERTIFICATE_TYPE, CERTIFICATE_OPTIONS, DELIVERY_DETAILS, CHECK_DETAILS } from "../model/page.urls";
import homeController from "../controllers/home.controller";
import { render as renderCertificateType } from "../controllers/certificate.type.controller";
import checkDetailsController, { render as renderCheckDetails } from "../controllers/check.details.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../controllers/certificate.options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../controllers/delivery.details.controller";

import { getAccessToken } from "../session/helper";
import { getCertificateItem } from "../client/api.client";

const renderTemplate = (template: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        return res.render(template, { templateName: template, companyNumber: certificateItem.companyNumber });
    } catch (err) {
        next(err);
    }
};
const router: Router = Router();

router.get(ROOT, homeController);

router.get(CERTIFICATE_TYPE, renderCertificateType);

router.get(CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(DELIVERY_DETAILS, renderDeliveryDetails);
router.post(DELIVERY_DETAILS, deliveryDetailsController);

router.get(CHECK_DETAILS, renderCheckDetails);
router.post(CHECK_DETAILS, checkDetailsController);

export default router;
