import { Router, Response, NextFunction, Request } from "express";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import { ROOT_CERTIFIED_COPY, CERTIFIFIED_COPY_DELIVERY_DETAILS, CERTIFIFIED_COPY_CHECK_DETAILS } from "../../model/page.urls";

import homeController from "../../controllers/certified-copies/home.controller";
import checkDetailsController, { render as renderCheckDetails } from "../../controllers/certified-copies/check.details.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../controllers/certified-copies/delivery.details.controller";

import { getAccessToken } from "../../session/helper";
import { getCertificateItem } from "../../client/api.client";

const renderTemplate = (template: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certifiedCopyItem: CertificateItem = await getCertificateItem(accessToken, req.params.certifiedCopyId);
        return res.render(template, { templateName: template, companyNumber: certifiedCopyItem.companyNumber });
    } catch (err) {
        next(err);
    }
};
const router: Router = Router();

router.get(ROOT_CERTIFIED_COPY, homeController);

router.get(CERTIFIFIED_COPY_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(CERTIFIFIED_COPY_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFIFIED_COPY_CHECK_DETAILS, renderCheckDetails);
router.post(CERTIFIFIED_COPY_CHECK_DETAILS, checkDetailsController);

export default router;
