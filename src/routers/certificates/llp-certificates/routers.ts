import { Router } from "express";

import {
    LLP_ROOT_CERTIFICATE, LLP_CERTIFICATE_TYPE, LLP_CERTIFICATE_OPTIONS, LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, 
    LLP_CERTIFICATE_MEMBERS_OPTIONS, LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../../controllers/certificates/llp-certificates/type.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../../controllers/certificates/llp-certificates/options.controller";
import designatedMembersOptionsController, { render as renderDesignatedMemberOptions } from "../../../controllers/certificates/llp-certificates/designated-members.options.controller";
import membersOptionsController, { render as renderMembersOptions } from "../../../controllers/certificates/llp-certificates/members.options.controller";
import registeredOfficeOptionsController, { render as renderRegisteredOfficeOptions } from "../../../controllers/certificates/llp-certificates/registered.office.options.controller";


const router: Router = Router();

router.get(LLP_ROOT_CERTIFICATE, homeController);
router.get(LLP_CERTIFICATE_TYPE, renderCertificateType);
router.get(LLP_CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(LLP_CERTIFICATE_OPTIONS, collectionOptionsController);
router.get(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, renderDesignatedMemberOptions);
router.post(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, designatedMembersOptionsController);
router.get(LLP_CERTIFICATE_MEMBERS_OPTIONS, renderMembersOptions);
router.post(LLP_CERTIFICATE_MEMBERS_OPTIONS, membersOptionsController);
router.get(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, renderRegisteredOfficeOptions);
router.post(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, registeredOfficeOptionsController);

export default router;
