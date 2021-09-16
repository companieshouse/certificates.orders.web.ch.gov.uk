import { Router } from "express";

import {
    LP_ROOT_CERTIFICATE,
    LP_CERTIFICATE_TYPE,
    LP_CERTIFICATE_OPTIONS,
    LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS,
    LP_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_CHECK_DETAILS
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../../controllers/certificates/lp-certificates/type.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../../controllers/certificates/lp-certificates/options.controller";
import placeOfBusinessOptionsController, {render as renderPlaceOfBusinessOptions} from "../../../controllers/certificates/lp-certificates/principal.place.options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../../controllers/certificates/lp-certificates/delivery.details.controller";
import checkDetailsController, { render as renderCheckDetails} from "../../../controllers/certificates/lp-certificates/check.details.controller";

const router: Router = Router();

router.get(LP_ROOT_CERTIFICATE, homeController);
router.get(LP_CERTIFICATE_TYPE, renderCertificateType);
router.get(LP_CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(LP_CERTIFICATE_OPTIONS, collectionOptionsController);
router.get(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, renderPlaceOfBusinessOptions);
router.post(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, placeOfBusinessOptionsController);
router.get(LP_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(LP_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
router.get(LP_CERTIFICATE_CHECK_DETAILS, renderCheckDetails);
router.post(LP_CERTIFICATE_CHECK_DETAILS, checkDetailsController);

export default router;