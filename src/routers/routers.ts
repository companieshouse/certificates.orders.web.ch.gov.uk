import {Router, Response, NextFunction, Request} from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import goodStandingController from "../controllers/good.standing.controller";
import orderDetailsController from "../controllers/order.details.controller";
import collectionController from "../controllers/collection.controller";
import homeController from "../controllers/home.controller";
import collectionOptionsController from "../controllers/certificate.options.controller";

// a router is a collection of routes that can have their own middleware chain. It is helpful to create routers for
// a collection of related routes for better organisation and specific logic.

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
  return res.render(template, { templateName: template, companyNumber: req.params.companyNumber });
};
const router: Router = Router();

router.get(pageUrls.ROOT, homeController);

router.get(pageUrls.CERTIFICATE_OPTIONS, renderTemplate(templatePaths.CERTIFICATE_OPTIONS));
router.post(pageUrls.CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(pageUrls.ORDER_DETAILS, renderTemplate(templatePaths.ORDER_DETAILS));
router.post(pageUrls.ORDER_DETAILS, orderDetailsController);

router.get(pageUrls.GOOD_STANDING, renderTemplate(templatePaths.GOOD_STANDING));
router.post(pageUrls.GOOD_STANDING, goodStandingController);

router.get(pageUrls.COLLECTION, renderTemplate(templatePaths.COLLECTION));
router.post(pageUrls.COLLECTION, collectionController);

router.get(pageUrls.CHECK_DETAILS, renderTemplate(templatePaths.CHECK_DETAILS));

export default router;
