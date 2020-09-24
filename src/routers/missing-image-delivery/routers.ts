import { Router } from "express";
import { ROOT_MISSING_IMAGE_DELIVERY, MISSING_IMAGE_DELIVERY_CHECK_DETAILS, MISSING_IMAGE_DELIVERY_CREATE } from "../../model/page.urls";
import homeController from "../../controllers/missing-image-delivery/home.controller";
import { render as renderCreateController } from "../../controllers/missing-image-delivery/create.missing.image.delivery.item.controller";
import checkDetailsController from "../../controllers/missing-image-delivery/check.details.controller";

const router: Router = Router();

router.get(ROOT_MISSING_IMAGE_DELIVERY, homeController);
router.get(MISSING_IMAGE_DELIVERY_CREATE, renderCreateController);
router.get(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, checkDetailsController);

export default router;
