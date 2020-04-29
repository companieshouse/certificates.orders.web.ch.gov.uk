import {Router, Response, NextFunction, Request} from "express";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import homeController from "../controllers/home.controller";
import collectionOptionsController, {render as renderCertificateOptions} from "../controllers/certificate.options.controller";
import deliveryDetailsController from "../controllers/delivery.details.controller";
import checkDetailsController from "../controllers/check.details.controller";

// a router is a collection of routes that can have their own middleware chain. It is helpful to create routers for
// a collection of related routes for better organisation and specific logic.

const renderTemplate = (template: string) => (req: Request, res: Response, next: NextFunction) => {
  return res.render(template, { templateName: template, companyNumber: req.params.companyNumber });
};
const router: Router = Router();

router.get(pageUrls.ROOT, homeController);

router.get(pageUrls.CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(pageUrls.CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(pageUrls.DELIVERY_DETAILS, renderTemplate(templatePaths.DELIVERY_DETAILS));
router.post(pageUrls.DELIVERY_DETAILS, deliveryDetailsController);

router.get(pageUrls.CHECK_DETAILS, renderTemplate(templatePaths.CHECK_DETAILS));
router.post(pageUrls.CHECK_DETAILS, checkDetailsController);

export default router;
