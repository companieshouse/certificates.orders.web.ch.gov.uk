import { Router } from "express";

import {
    ROOT_CERTIFICATE, CERTIFICATE_TYPE, CERTIFICATE_OPTIONS, CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_CHECK_DETAILS, ROOT_DISSOLVED_CERTIFICATE, DISSOLVED_CERTIFICATE_TYPE,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, DISSOLVED_CERTIFICATE_CHECK_DETAILS, CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    CERTIFICATE_DIRECTOR_OPTIONS, CERTIFICATE_SECRETARY_OPTIONS
} from "../../model/page.urls";
import homeController from "../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../controllers/certificates/type.controller";
import checkDetailsController, { render as renderCheckDetails } from "../../controllers/certificates/check.details.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../controllers/certificates/options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../controllers/certificates/delivery.details.controller";
import registeredOfficeOptionsController, { render as renderRegisteredOfficeOptions } from "../../controllers/certificates/registered.office.options.controller";
import { render as renderDirectorOptions } from "../../controllers/certificates/director.options.controller";
import { render as renderSecretaryOptions } from "../../controllers/certificates/secretary.options.controller";

const router: Router = Router();

router.get(ROOT_CERTIFICATE, homeController);
router.get(ROOT_DISSOLVED_CERTIFICATE, homeController);

router.get(CERTIFICATE_TYPE, renderCertificateType);
router.get(DISSOLVED_CERTIFICATE_TYPE, renderCertificateType);

router.get(CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, renderRegisteredOfficeOptions);
router.post(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, registeredOfficeOptionsController);

router.get(CERTIFICATE_DIRECTOR_OPTIONS, renderDirectorOptions);
router.get(CERTIFICATE_SECRETARY_OPTIONS, renderSecretaryOptions);

router.get(CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
router.get(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFICATE_CHECK_DETAILS, renderCheckDetails);
router.post(CERTIFICATE_CHECK_DETAILS, checkDetailsController);
router.get(DISSOLVED_CERTIFICATE_CHECK_DETAILS, renderCheckDetails);
router.post(DISSOLVED_CERTIFICATE_CHECK_DETAILS, checkDetailsController);

export default router;
