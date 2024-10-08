import { Router } from "express";

import {
    CERTIFICATE_CHECK_DETAILS,
    CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_DELIVERY_OPTIONS,
    CERTIFICATE_DIRECTOR_OPTIONS,
    CERTIFICATE_EMAIL_OPTIONS,
    CERTIFICATE_OPTIONS,
    CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    CERTIFICATE_SECRETARY_OPTIONS,
    CERTIFICATE_ADDITIONAL_COPIES_OPTIONS,
    CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS,
    CERTIFICATE_TYPE, CERTIFICATE_VIEW_CHANGE_OPTIONS,
    DISSOLVED_CERTIFICATE_CHECK_DETAILS,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS,
    DISSOLVED_CERTIFICATE_EMAIL_OPTIONS,
    DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_OPTIONS,
    DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS,
    DISSOLVED_CERTIFICATE_TYPE,
    ROOT_CERTIFICATE,
    ROOT_DISSOLVED_CERTIFICATE,
    START_BUTTON_PATH_SUFFIX
} from "../../model/page.urls";
import {
    CERTIFICATE_CHECK_DETAILS as CERTIFICATE_CHECK_DETAILS_TEMPLATE,
    CERTIFICATE_CHECK_DETAILS_ALTERNATE as CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE
} from "../../model/template.paths";
import homeController from "../../controllers/certificates/home.controller";
import { TypeController } from "../../controllers/certificates/type.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../controllers/certificates/delivery.details.controller";
import deliveryOptionsController, { render as renderDeliveryOptions } from "../../controllers/certificates/delivery.options.controller";
import emailOptionsController, { render as renderEmailOptions } from "../../controllers/certificates/email.options.controller";
import registeredOfficeOptionsController, { render as renderRegisteredOfficeOptions } from "../../controllers/certificates/registered.office.options.controller";
import directorOptionsController, { render as renderDirectorOptions } from "../../controllers/certificates/director.options.controller";
import secretaryOptionsController, { render as renderSecretaryOptions } from "../../controllers/certificates/secretary.options.controller";
import additionalCopiesController, { render as renderAdditionalCopies} from "../../controllers/certificates/additional.copies.controller";
import additionalCopiesQuantityController, { render as renderAdditionalCopiesQuantity} from "../../controllers/certificates/additional.copies.quantity.controller";
import { CompanyStatus } from "../../controllers/certificates/model/CompanyStatus";
import { CheckDetailsController } from "../../controllers/certificates/check-details/CheckDetailsController";
import { CertificateTextMapper } from "../../controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../config/config";
import { DefaultCompanyCheckDetailsFactory } from "../../controllers/certificates/check-details/DefaultCompanyCheckDetailsFactory";
import { OptionsControllerConfiguration } from "../../controllers/certificates/options/OptionsControllerConfiguration";

const router: Router = Router();

router.get(ROOT_CERTIFICATE, homeController);
router.get(ROOT_CERTIFICATE + START_BUTTON_PATH_SUFFIX, homeController);
router.get(ROOT_DISSOLVED_CERTIFICATE, homeController);
router.get(ROOT_DISSOLVED_CERTIFICATE + START_BUTTON_PATH_SUFFIX, homeController);

const typeController = new TypeController(new Map<string, string>([
    [CompanyStatus.ACTIVE, CERTIFICATE_OPTIONS],
    [CompanyStatus.LIQUIDATION, CERTIFICATE_OPTIONS],
    [CompanyStatus.ADMINISTRATION, CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS]
]));
router.get(CERTIFICATE_TYPE, typeController.render.bind(typeController));
router.get(DISSOLVED_CERTIFICATE_TYPE, typeController.render.bind(typeController));

const optionsController = OptionsControllerConfiguration.optionsControllerInstance();
router.get(CERTIFICATE_OPTIONS, optionsController.handleGet.bind(optionsController));
router.post(CERTIFICATE_OPTIONS, optionsController.handlePost.bind(optionsController));

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

router.get(CERTIFICATE_DELIVERY_OPTIONS, renderDeliveryOptions);
router.post(CERTIFICATE_DELIVERY_OPTIONS, deliveryOptionsController);
router.get(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS, renderDeliveryOptions);
router.post(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS, deliveryOptionsController);

router.get(CERTIFICATE_EMAIL_OPTIONS, renderEmailOptions);
router.post(CERTIFICATE_EMAIL_OPTIONS, emailOptionsController);
router.get(DISSOLVED_CERTIFICATE_EMAIL_OPTIONS, renderEmailOptions);
router.post(DISSOLVED_CERTIFICATE_EMAIL_OPTIONS, emailOptionsController);

router.get(CERTIFICATE_ADDITIONAL_COPIES_OPTIONS, renderAdditionalCopies);
router.post(CERTIFICATE_ADDITIONAL_COPIES_OPTIONS, additionalCopiesController);
router.get(DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_OPTIONS, renderAdditionalCopies);
router.post(DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_OPTIONS, additionalCopiesController);

router.get(CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS, renderAdditionalCopiesQuantity);
router.post(CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS, additionalCopiesQuantityController);
router.get(DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS, renderAdditionalCopiesQuantity);
router.post(DISSOLVED_CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS, additionalCopiesQuantityController);

const checkDetailsController = new CheckDetailsController(new DefaultCompanyCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), CERTIFICATE_CHECK_DETAILS_TEMPLATE));
router.get(CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));
router.get(DISSOLVED_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(DISSOLVED_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));

const viewChangeCertOptions = new CheckDetailsController(new DefaultCompanyCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE));
router.get(CERTIFICATE_VIEW_CHANGE_OPTIONS, viewChangeCertOptions.handleGet.bind(viewChangeCertOptions));

export default router;
