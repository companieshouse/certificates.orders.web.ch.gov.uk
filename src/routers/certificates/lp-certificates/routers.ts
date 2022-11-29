import { Router } from "express";

import {
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS,
    LP_CERTIFICATE_CHECK_DETAILS,
    LP_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS,
    LP_CERTIFICATE_DELIVERY_OPTIONS,
    LP_CERTIFICATE_OPTIONS,
    LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS,
    LP_CERTIFICATE_TYPE,
    LP_CERTIFICATE_VIEW_CHANGE_OPTIONS,
    LP_ROOT_CERTIFICATE,
    START_BUTTON_PATH_SUFFIX
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import placeOfBusinessOptionsController, { render as renderPlaceOfBusinessOptions } from "../../../controllers/certificates/lp-certificates/principal.place.options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../../controllers/certificates/lp-certificates/delivery.details.controller";
import deliveryOptionsController, { render as renderDeliveryOptions } from "../../../controllers/certificates/delivery.options.controller";
import emailOptionsController, { render as renderEmailOptions } from "../../../controllers/certificates/email.options.controller";
import { TypeController } from "../../../controllers/certificates/type.controller";
import { CompanyStatus } from "../../../controllers/certificates/model/CompanyStatus";
import { CheckDetailsController } from "../../../controllers/certificates/check-details/CheckDetailsController";
import { LPCheckDetailsFactory } from "../../../controllers/certificates/check-details/LPCompanyCheckDetailsFactory";
import { CertificateTextMapper } from "../../../controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../../config/config";
import { OptionsControllerConfiguration } from "../../../controllers/certificates/options/OptionsControllerConfiguration";
import { LP_CERTIFICATE_CHECK_DETAILS as LP_CERTIFICATE_CHECK_DETAILS_TEMPLATE, LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE as LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE } from "../../../model/template.paths";

const router: Router = Router();

router.get(LP_ROOT_CERTIFICATE, homeController);
router.get(LP_ROOT_CERTIFICATE + START_BUTTON_PATH_SUFFIX, homeController);
const typeController = new TypeController(new Map<string, string>([
    [CompanyStatus.ACTIVE, LP_CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS]
]));
router.get(LP_CERTIFICATE_TYPE, typeController.render.bind(typeController));

const optionsController = OptionsControllerConfiguration.optionsControllerInstance();
router.get(LP_CERTIFICATE_OPTIONS, optionsController.handleGet.bind(optionsController));
router.post(LP_CERTIFICATE_OPTIONS, optionsController.handlePost.bind(optionsController));

router.get(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, renderPlaceOfBusinessOptions);
router.post(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, placeOfBusinessOptionsController);
router.get(LP_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(LP_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
router.get(LP_CERTIFICATE_DELIVERY_OPTIONS, renderDeliveryOptions);
router.post(LP_CERTIFICATE_DELIVERY_OPTIONS, deliveryOptionsController);
router.get(LP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS, renderEmailOptions);
router.post(LP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS, emailOptionsController);

const checkDetailsController = new CheckDetailsController(new LPCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), LP_CERTIFICATE_CHECK_DETAILS_TEMPLATE));
router.get(LP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(LP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));

const viewChangeCertOptions = new CheckDetailsController(new LPCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE));
router.get(LP_CERTIFICATE_VIEW_CHANGE_OPTIONS, viewChangeCertOptions.handleGet.bind(viewChangeCertOptions));

export default router;
