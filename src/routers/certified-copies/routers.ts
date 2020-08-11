import { Router } from "express";

import { ROOT_CERTIFIED_COPY, CERTIFIED_COPY_DELIVERY_DETAILS, CERTIFIED_COPY_CHECK_DETAILS } from "../../model/page.urls";
import deliveryDetailsController, { render as renderCertifiedCopies } from "../../controllers/certified-copies/delivery.details.controller";
import homeController from "../../controllers/certified-copies/home.controller";
import checkDetailsController from "../../controllers/certified-copies/check.details.controller";

const router: Router = Router();

router.get(ROOT_CERTIFIED_COPY, homeController);

router.get(CERTIFIED_COPY_DELIVERY_DETAILS, renderCertifiedCopies);
router.post(CERTIFIED_COPY_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFIED_COPY_CHECK_DETAILS, checkDetailsController);
router.post(CERTIFIED_COPY_CHECK_DETAILS, checkDetailsController);

export default router;
