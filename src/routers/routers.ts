import {Router, Response, NextFunction, Request} from "express";
import {CertificateItemPatchRequest, ItemOptionsRequest, CertificateItem} from "ch-sdk-node/dist/services/order/item/certificate/types";

import * as pageUrls from "../model/page.urls";
import * as templatePaths from "../model/template.paths";
import homeController from "../controllers/home.controller";
import {render as renderCertificateType} from "../controllers/certificate.type.controller";
import collectionOptionsController, {render as renderCertificateOptions} from "../controllers/certificate.options.controller";
import deliveryDetailsController from "../controllers/delivery.details.controller";
import checkDetailsController from "../controllers/check.details.controller";
import {getAccessToken } from "../session/helper";
import {getCertificateItem} from "../client/api.client";

const renderTemplate = (template: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
  const accessToken: string = getAccessToken(req.session);
  const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
  return res.render(template, { templateName: template, companyNumber: certificateItem.companyNumber });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
const router: Router = Router();

router.get(pageUrls.ROOT, homeController);

router.get(pageUrls.CERTIFICATE_TYPE, renderCertificateType);

router.get(pageUrls.CERTIFICATE_OPTIONS, renderCertificateOptions);
router.post(pageUrls.CERTIFICATE_OPTIONS, collectionOptionsController);

router.get(pageUrls.DELIVERY_DETAILS, renderTemplate(templatePaths.DELIVERY_DETAILS));
router.post(pageUrls.DELIVERY_DETAILS, deliveryDetailsController);

router.get(pageUrls.CHECK_DETAILS, renderTemplate(templatePaths.CHECK_DETAILS));
router.post(pageUrls.CHECK_DETAILS, checkDetailsController);

export default router;
