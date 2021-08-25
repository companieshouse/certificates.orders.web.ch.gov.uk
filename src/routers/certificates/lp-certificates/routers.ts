import { Router } from "express";

import {
    LP_ROOT_CERTIFICATE, LP_CERTIFICATE_TYPE, LP_CERTIFICATE_OPTIONS
} from "../../../model/page.urls";

import homeController from "../../../controllers/certificates/home.controller";
import { render as renderCertificateType } from "../../../controllers/certificates/lp-certificates/type.controller";
import collectionOptionsController, { render as renderCertificateOptions } from "../../../controllers/certificates/lp-certificates/options.controller";

const router: Router = Router();

router.get(LP_ROOT_CERTIFICATE, homeController);
router.get(LP_CERTIFICATE_TYPE, renderCertificateType);
router.get(LP_CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(LP_CERTIFICATE_OPTIONS, collectionOptionsController);

export default router;