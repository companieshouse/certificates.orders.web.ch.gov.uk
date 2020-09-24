import { Router } from "express";
import { ROOT_SCAN_UPON_DEMAND, SCAN_UPON_DEMAND_CHECK_DETAILS, SCAN_UPON_DEMAND_CREATE } from "../../model/page.urls";
import homeController from "../../controllers/missing-image-delivery/home.controller";
import { render as renderCreateController } from "../../controllers/missing-image-delivery/create.scud.item.controller";
import checkDetailsController from "../../controllers/missing-image-delivery/check.details.controller";

const router: Router = Router();

router.get(ROOT_SCAN_UPON_DEMAND, homeController);
router.get(SCAN_UPON_DEMAND_CREATE, renderCreateController);
router.get(SCAN_UPON_DEMAND_CHECK_DETAILS, checkDetailsController);

export default router;
