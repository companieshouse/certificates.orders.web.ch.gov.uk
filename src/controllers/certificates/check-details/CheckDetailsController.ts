import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { addItemToBasket, getBasket, getCertificateItem } from "../../../client/api.client";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME, CHS_URL } from "../../../config/config";
import { ViewModelCreatable } from "../ViewModelCreatable";
import { BasketLink } from "model/BasketLink";
import { getBasketLink } from "../../../utils/basket.utils";
import { mapPageHeader } from "../../../utils/page.header.utils";

export class CheckDetailsController {
    private logger = createLogger(APPLICATION_NAME);
    private viewModelCreatable: ViewModelCreatable;

    constructor (viewModelCreatable: ViewModelCreatable) {
        this.viewModelCreatable = viewModelCreatable;
    }

    public async handleGet (req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken: string = getAccessToken(req.session);
            const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
            const basket: Basket = await getBasket(accessToken);
            const basketLink: BasketLink = await getBasketLink(req);
            const pageHeader = mapPageHeader(req);
            const viewModel = this.viewModelCreatable.createViewModel(certificateItem, basket);
            res.render(this.viewModelCreatable.getTemplate(),
                {
                    ...viewModel,
                    optionFilter: (options: { id: string }[], filter: { [key: string]: boolean }): { id: string }[] => {
                        return options.filter(option => !(option.id in filter) || filter[option.id]);
                    },
                    ...basketLink,
                    ...pageHeader
                });
        } catch (err) {
            this.logger.error(`${err}`);
            next(err);
        }
    }

    public async handlePost (req: Request, res: Response, next: NextFunction) {
        try {
            const accessToken: string = getAccessToken(req.session);
            const certificateId: string = req.params.certificateId;
            const userId = getUserId(req.session);
            const resp = await addItemToBasket(
                accessToken,
                { itemUri: `/orderable/certificates/${certificateId}` });
            this.logger.info(`item added to basket certificate_id=${certificateId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
            res.redirect(`${CHS_URL}/basket`);
        } catch (error) {
            this.logger.error(`error=${error}`);
            return next(error);
        }
    };
}
