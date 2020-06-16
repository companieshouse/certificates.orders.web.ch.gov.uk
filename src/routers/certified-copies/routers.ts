import { Router, Response, NextFunction, Request } from "express";

import { ROOT_CERTIFIED_COPY, CERTIFIFIED_COPY_DELIVERY_DETAILS, CERTIFIFIED_COPY_CHECK_DETAILS } from "../../model/page.urls";

import homeController from "../../controllers/certified-copies/home.controller";
import checkDetailsController from "../../controllers/certified-copies/check.details.controller";
import deliveryDetailsController from "../../controllers/certified-copies/delivery.details.controller";

const router: Router = Router();

router.get(ROOT_CERTIFIED_COPY, homeController);

router.get(CERTIFIFIED_COPY_DELIVERY_DETAILS, deliveryDetailsController);
router.post(CERTIFIFIED_COPY_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFIFIED_COPY_CHECK_DETAILS, checkDetailsController);
router.post(CERTIFIFIED_COPY_CHECK_DETAILS, checkDetailsController);

export default router;
