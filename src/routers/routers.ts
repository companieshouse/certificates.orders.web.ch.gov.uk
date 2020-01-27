import {Router, Response, NextFunction, Request} from "express";

import * as pageUrls from "../model/page.urls";
import goodStandingController from "../controllers/good.standing.controller";
import orderDetailsController from "../controllers/order.details.controller";

// a router is a collection of routes that can have their own middleware chain. It is helpful to create routers for
// a collection of related routes for better organisation and specific logic.

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
    return res.render(template, { templateName: template });
  };
const router: Router = Router();

router.get(pageUrls.ROOT, renderTemplate("index"));

router.get(pageUrls.ORDER_DETAILS, renderTemplate("order-details"));
router.post(pageUrls.ORDER_DETAILS, orderDetailsController);

router.get(pageUrls.GOOD_STANDING, renderTemplate("good-standing"));
router.post(pageUrls.GOOD_STANDING, goodStandingController);

export default router;
