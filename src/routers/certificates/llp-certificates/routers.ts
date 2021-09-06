import { Router } from "express";

import {
    LLP_ROOT_CERTIFICATE, LLP_CERTIFICATE_TYPE, LLP_CERTIFICATE_OPTIONS, LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../../controllers/certificates/llp-certificates/type.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../../controllers/certificates/llp-certificates/options.controller";
import designatedMembersOptionsController, { render as renderDesignatedMemberOptions } from "../../../controllers/certificates/llp-certificates/designated-members.options.controller";

const router: Router = Router();

router.get(LLP_ROOT_CERTIFICATE, homeController);
router.get(LLP_CERTIFICATE_TYPE, renderCertificateType);
router.get(LLP_CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(LLP_CERTIFICATE_OPTIONS, collectionOptionsController);
router.get(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, renderDesignatedMemberOptions);
router.post(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, designatedMembersOptionsController);

export default router;
