import { Router } from "express";

import {
    CERTIFICATE_CHECK_DETAILS,
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS,
    LLP_CERTIFICATE_CHECK_DETAILS,
    LLP_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS,
    LLP_CERTIFICATE_DELIVERY_OPTIONS,
    LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS,
    LLP_CERTIFICATE_MEMBERS_OPTIONS,
    LLP_CERTIFICATE_OPTIONS,
    LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS,
    LLP_CERTIFICATE_TYPE, LLP_CERTIFICATE_VIEW_CHANGE_OPTIONS,
    LLP_ROOT_CERTIFICATE
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import designatedMembersOptionsController, { render as renderDesignatedMemberOptions } from "../../../controllers/certificates/llp-certificates/designated-members.options.controller";
import membersOptionsController, { render as renderMembersOptions } from "../../../controllers/certificates/llp-certificates/members.options.controller";
import deliveryDetailsController, { render as renderDeliveryDetails } from "../../../controllers/certificates/llp-certificates/delivery.details.controller";
import deliveryOptionsController, { render as renderDeliveryOptions } from "../../../controllers/certificates/delivery.options.controller";
import emailOptionsController, { render as renderEmailOptions } from "../../../controllers/certificates/email.options.controller";
import registeredOfficeOptionsController, { render as renderRegisteredOfficeOptions } from "../../../controllers/certificates/llp-certificates/registered.office.options.controller";
import { TypeController } from "../../../controllers/certificates/type.controller";
import { CompanyStatus } from "../../../controllers/certificates/model/CompanyStatus";
import { CheckDetailsController } from "../../../controllers/certificates/check-details/CheckDetailsController";
import { CertificateTextMapper } from "../../../controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../../config/config";
import { LLPCheckDetailsFactory } from "../../../controllers/certificates/check-details/LLPCheckDetailsFactory";
import { OptionsControllerConfiguration } from "../../../controllers/certificates/options/OptionsControllerConfiguration";
import {
    LLP_CERTIFICATE_CHECK_DETAILS as LLP_CERTIFICATE_CHECK_DETAILS_TEMPLATE,
    LLP_CERTIFICATE_CHECK_DETAILS_ALTERNATE as LLP_CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE
} from "../../../model/template.paths";
import { DefaultCompanyCheckDetailsFactory } from "../../../controllers/certificates/check-details/DefaultCompanyCheckDetailsFactory";

const router: Router = Router();

router.get(LLP_ROOT_CERTIFICATE, homeController);
const typeController = new TypeController(new Map<string, string>([
    [CompanyStatus.ACTIVE, LLP_CERTIFICATE_OPTIONS],
    [CompanyStatus.LIQUIDATION, LLP_CERTIFICATE_OPTIONS],
    [CompanyStatus.ADMINISTRATION, LLP_CERTIFICATE_OPTIONS],
    [CompanyStatus.DISSOLVED, DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS]
]));
router.get(LLP_CERTIFICATE_TYPE, typeController.render.bind(typeController));

const optionsController = OptionsControllerConfiguration.optionsControllerInstance();
router.get(LLP_CERTIFICATE_OPTIONS, optionsController.handleGet.bind(optionsController));
router.post(LLP_CERTIFICATE_OPTIONS, optionsController.handlePost.bind(optionsController));

router.get(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, renderRegisteredOfficeOptions);
router.post(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, registeredOfficeOptionsController);
router.get(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, renderDesignatedMemberOptions);
router.post(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, designatedMembersOptionsController);
router.get(LLP_CERTIFICATE_MEMBERS_OPTIONS, renderMembersOptions);
router.post(LLP_CERTIFICATE_MEMBERS_OPTIONS, membersOptionsController);
router.get(LLP_CERTIFICATE_DELIVERY_DETAILS, renderDeliveryDetails);
router.post(LLP_CERTIFICATE_DELIVERY_DETAILS, deliveryDetailsController);
router.get(LLP_CERTIFICATE_DELIVERY_OPTIONS, renderDeliveryOptions);
router.post(LLP_CERTIFICATE_DELIVERY_OPTIONS, deliveryOptionsController);
router.get(LLP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS, renderEmailOptions);
router.post(LLP_CERTIFICATE_DELIVERY_EMAIL_OPTIONS, emailOptionsController);

const checkDetailsController = new CheckDetailsController(new LLPCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), LLP_CERTIFICATE_CHECK_DETAILS_TEMPLATE));
router.get(LLP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handleGet.bind(checkDetailsController));
router.post(LLP_CERTIFICATE_CHECK_DETAILS, checkDetailsController.handlePost.bind(checkDetailsController));

const viewChangeCertOptions = new CheckDetailsController(new DefaultCompanyCheckDetailsFactory(new CertificateTextMapper(DISPATCH_DAYS), LLP_CERTIFICATE_CHECK_DETAILS_ALTERNATE_TEMPLATE));
router.get(LLP_CERTIFICATE_VIEW_CHANGE_OPTIONS, viewChangeCertOptions.handleGet.bind(viewChangeCertOptions));

export default router;
