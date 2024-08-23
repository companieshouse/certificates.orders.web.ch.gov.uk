import { Request, Response } from "express";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setServiceUrl } from "../utils/service.url.utils";
import { getBasketLink } from "../utils/basket.utils";
import { mapPageHeader } from "../utils/page.header.utils";
import { BasketLink } from "../model/BasketLink";

export const renderPage = async (
    req: Request,
    res: Response,
    templateName: string,
    pageTitle: string,
    certificateItem: CertificateItem,
    backLink: string
): Promise<void> => {
    const basketLink: BasketLink = await getBasketLink(req);
    const pageHeader = mapPageHeader(req);

    return res.render(templateName, {
        templateName,
        pageTitleText: pageTitle,
        SERVICE_URL: setServiceUrl(certificateItem),
        backLink,
        ...basketLink,
        ...pageHeader
    });
};
