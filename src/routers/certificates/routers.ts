import { Router } from "express";

import {
    CERTIFICATE_CHECK_DETAILS,
    CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_DIRECTOR_OPTIONS,
    CERTIFICATE_OPTIONS,
    CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    CERTIFICATE_SECRETARY_OPTIONS,
    CERTIFICATE_TYPE,
    DISSOLVED_CERTIFICATE_CHECK_DETAILS,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    DISSOLVED_CERTIFICATE_TYPE,
    ROOT_CERTIFICATE,
    ROOT_DISSOLVED_CERTIFICATE
} from "../../model/page.urls";
import homeController from "../../controllers/certificates/home.controller";
import { TypeController } from "../../controllers/certificates/type.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../controllers/certificates/options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../controllers/certificates/delivery.details.controller";
import registeredOfficeOptionsController, { render as renderRegisteredOfficeOptions } from "../../controllers/certificates/registered.office.options.controller";
import directorOptionsController, { render as renderDirectorOptions } from "../../controllers/certificates/director.options.controller";
import secretaryOptionsController, { render as renderSecretaryOptions } from "../../controllers/certificates/secretary.options.controller";
import { CompanyStatus } from "../../controllers/certificates/model/CompanyStatus";
import { CheckDetailsController } from "../../controllers/certificates/check-details/CheckDetailsController";
import { CertificateTextMapper } from "../../controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../config/config";
import { DefaultCompanyCheckDetailsFactory } from "../../controllers/certificates/check-details/DefaultCompanyCheckDetailsFactory";

const router: Router = Router();

router.get(ROOT_CERTIFICATE, homeController);
router.get(ROOT_DISSOLVED_CERTIFICATE, homeController);

const typeController = new TypeController(new Map<string, string>([
    [CompanyStatus.ACTIVE, CERTIFICATE_OPTIONS],
    [CompanyStatus.LIQUIDATION, CERTIFICATE_OPTIONS],
    [CompanyStatus.ADMINISTRATION, CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_DETAILS]
]));
router.get(CERTIFICATE_TYPE, typeController.render.bind(typeController));
router.get(DISSOLVED_CERTIFICATE_TYPE, typeController.render.bind(typeController));

router.get(CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, renderRegisteredOfficeOptions);
router.post(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, registeredOfficeOptionsController);

router.get(CERTIFICATE_DIRECTOR_OPTIONS, renderDirectorOptions);
router.post(CERTIFICATE_DIRECTOR_OPTIONS, directorOptionsController);

router.get(CERTIFICATE_SECRETARY_OPTIONS, renderSecretaryOptions);
router.post(CERTIFICATE_SECRETARY_OPTIONS, secretaryOptionsController);

router.get(CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
router.get(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);

const checkDetailsController = new CheckDetailsController(new DefaultCompanyCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS)));
router.get(CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));
router.get(DISSOLVED_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(DISSOLVED_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));

export default router;
