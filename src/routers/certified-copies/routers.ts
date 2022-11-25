import { Router } from "express";

import {
    ROOT_CERTIFIED_COPY,
    CERTIFIED_COPY_DELIVERY_DETAILS,
    CERTIFIED_COPY_CHECK_DETAILS,
    CERTIFIED_COPY_DELIVERY_OPTIONS,
    START_BUTTON_PATH_SUFFIX
} from "../../model/page.urls";
import deliveryOptionsController, { render as renderDeliveryOptions } from "../../controllers/certified-copies/delivery.options.controller";
import deliveryDetailsController, { render as renderCertifiedCopies } from "../../controllers/certified-copies/delivery.details.controller";
import homeController from "../../controllers/certified-copies/home.controller";
import checkDetailsController, { render as renderCheckDetails } from "../../controllers/certified-copies/check.details.controller";

const router: Router = Router();

router.get(ROOT_CERTIFIED_COPY, homeController);
router.get(ROOT_CERTIFIED_COPY + START_BUTTON_PATH_SUFFIX, homeController);

router.get(CERTIFIED_COPY_DELIVERY_OPTIONS, renderDeliveryOptions);
router.post(CERTIFIED_COPY_DELIVERY_OPTIONS, deliveryOptionsController)

router.get(CERTIFIED_COPY_DELIVERY_DETAILS, renderCertifiedCopies);
router.post(CERTIFIED_COPY_DELIVERY_DETAILS, deliveryDetailsController);

router.get(CERTIFIED_COPY_CHECK_DETAILS, renderCheckDetails);
router.post(CERTIFIED_COPY_CHECK_DETAILS, checkDetailsController);

export default router;
