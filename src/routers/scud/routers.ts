import { Router } from "express";
import { ROOT_SCAN_UPON_DEMAND } from "../../model/page.urls";
import homeController from "../../controllers/scud/home.controller";

const router: Router = Router();

router.get(ROOT_SCAN_UPON_DEMAND, homeController);

export default router;
