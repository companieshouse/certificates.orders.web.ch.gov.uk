import { Router } from "express";
import { ROOT_SCAN_UPON_DEMAND, SCAN_UPON_DEMAND_CHECK_DETAILS, SCAN_UPON_DEMAND_CREATE } from "../../model/page.urls";
import homeController from "../../controllers/scud/home.controller";
import checkDetailsController from "../../controllers/scud/check.details.controller";
import createController from "../../controllers/scud/create.scud.item.controller";

const router: Router = Router();

router.get(ROOT_SCAN_UPON_DEMAND, homeController);
router.get(SCAN_UPON_DEMAND_CREATE, createController)

router.get(SCAN_UPON_DEMAND_CHECK_DETAILS, checkDetailsController);

export default router;
