import { Router, Response, NextFunction, Request } from "express";
import { CertificateItem } from "ch-sdk-node/dist/services/certificates/types";

import { ROOT_CERTIFICATE, CERTIFICATE_TYPE, CERTIFICATE_OPTIONS, CERTIFICATE_DELIVERY_DETAILS, CERTIFICATE_CHECK_DETAILS } from "../../model/page.urls";
import homeController from "../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../controllers/certificates/type.controller";
import checkDetailsController, { render as renderCheckDetails } from "../../controllers/certificates/check.details.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../controllers/certificates/options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../controllers/certificates/delivery.details.controller";

import { getAccessToken } from "../../session/helper";
import { getCertificateItem } from "../../client/api.client";

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

router.get(ROOT_CERTIFICATE, homeController);

router.get(CERTIFICATE_TYPE, renderCertificateType);

router.get(CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFICATE_CHECK_DETAILS, renderCheckDetails);
router.post(CERTIFICATE_CHECK_DETAILS, checkDetailsController);

export default router;
