import { Request, Response, NextFunction } from "express";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../../config/config";
import { getAccessToken, getUserId } from "../../../session/helper";
import { OptionsService } from "./OptionsService";
import { BasketLink } from "model/BasketLink";
import { getBasketLink } from "../../../utils/basket.utils";
import { mapPageHeader } from "../../../utils/page.header.utils";
import { PageHeader } from "model/PageHeader";

const MORE_INFO_FIELD: string = "moreInfo";

export class OptionsController {
    private readonly logger = createLogger(APPLICATION_NAME);
    private readonly service: OptionsService;

    constructor (service: OptionsService) {
        this.service = service;
    }

    public async handleGet (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserId(req.session);
            const accessToken: string = getAccessToken(req.session);
            const result = await this.service.readCertificate(accessToken, req.params.certificateId);
            this.logger.debug(`Fetched certificate item: id=${req.params.certificateId}, user_id=${userId}`);
            const basketLink: BasketLink = await getBasketLink(req);
            const pageHeader: PageHeader = mapPageHeader(req);
            result.data.showBasketLink = basketLink.showBasketLink;
            result.data.basketItems = basketLink.basketItems;
            result.data.basketWebUrl = basketLink.basketWebUrl;
            result.data.isSignedIn = pageHeader.isSignedIn;
            result.data.userEmailAddress = pageHeader.userEmailAddress;
            result.data.serviceName = pageHeader.serviceName;
            res.render(result.template, result.data);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }

    public async handlePost (req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = getUserId(req.session);
            const accessToken: string = getAccessToken(req.session);
            const result = await this.service.updateCertificate(accessToken, req.params.certificateId, req.body[MORE_INFO_FIELD]);
            this.logger.debug(`Updated certificate item: id=${req.params.certificateId}, user_id=${userId}`);
            res.redirect(result.redirect);
        } catch (error) {
            this.logger.error(error);
            next(error);
        }
    }
}
