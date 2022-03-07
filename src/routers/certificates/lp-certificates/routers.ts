import { Router } from "express";

import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_CHECK_DETAILS,
    LP_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS,
    LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS,
    LP_CERTIFICATE_TYPE,
    LP_ROOT_CERTIFICATE
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../../controllers/certificates/lp-certificates/options.controller";
import placeOfBusinessOptionsController, { render as renderPlaceOfBusinessOptions } from "../../../controllers/certificates/lp-certificates/principal.place.options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../../controllers/certificates/lp-certificates/delivery.details.controller";
import { TypeController } from "../../../controllers/certificates/type.controller";
import { CompanyStatus } from "../../../controllers/certificates/model/CompanyStatus";
import { CheckDetailsController } from "../../../controllers/certificates/check-details/CheckDetailsController";
import { LPCheckDetailsFactory } from "../../../controllers/certificates/check-details/LPCompanyCheckDetailsFactory";
import { CertificateTextMapper } from "../../../controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../../config/config";

const router: Router = Router();

router.get(LP_ROOT_CERTIFICATE, homeController);
const typeController = new TypeController(new Map<string, string>([
    [CompanyStatus.ACTIVE, LP_CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS]
]));
router.get(LP_CERTIFICATE_TYPE, typeController.render.bind(typeController));
router.get(LP_CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(LP_CERTIFICATE_OPTIONS, collectionOptionsController);
router.get(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, renderPlaceOfBusinessOptions);
router.post(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, placeOfBusinessOptionsController);
router.get(LP_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(LP_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
const checkDetailsController = new CheckDetailsController(new LPCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS)));
router.get(LP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(LP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));

export default router;
