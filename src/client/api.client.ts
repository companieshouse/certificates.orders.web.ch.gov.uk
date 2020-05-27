import { createApiClient } from "ch-sdk-node";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import { BasketItem, ItemUriPostRequest, Basket, BasketPatchRequest } from "ch-sdk-node/dist/services/order/basket/types";
import { CertificateItemPostRequest, CertificateItemPatchRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { API_URL, APPLICATION_NAME } from "../config/config";
import { createLogger } from "ch-structured-logging";
import Resource from "ch-sdk-node/dist/services/resource";
import createError from "http-errors";

const logger = createLogger(APPLICATION_NAME);

export const getCompanyProfile = async (companyNumber: string, oAuth: string) => {
    const api = createApiClient(undefined, oAuth, API_URL);

    const companyProfileResource =
        await api.companyProfile.getCompanyProfile(companyNumber.toUpperCase());
    if (companyProfileResource.httpStatusCode !== 200 && companyProfileResource.httpStatusCode !== 201) {
        throw createError(companyProfileResource.httpStatusCode, companyProfileResource.httpStatusCode.toString());
    }
    const companyProfile = companyProfileResource.resource as CompanyProfile;
    return {
        companyName: companyProfile.companyName,
    };
};

export const postCertificateItem =
    async (oAuth: string, certificateItem: CertificateItemPostRequest): Promise<CertificateItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certificateItemResource: Resource<CertificateItem> = await api.certificate.postCertificate(certificateItem);
    if (certificateItemResource.httpStatusCode !== 200 && certificateItemResource.httpStatusCode !== 201) {
        throw createError(certificateItemResource.httpStatusCode, certificateItemResource.httpStatusCode.toString());
    }
    return certificateItemResource.resource as CertificateItem;
};

export const patchCertificateItem = async (
    oAuth: string, certificateId: string, certificateItem: CertificateItemPatchRequest): Promise<CertificateItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certificateItemResource: Resource<CertificateItem> =
        await api.certificate.patchCertificate(certificateItem, certificateId);
    if (certificateItemResource.httpStatusCode !== 200) {
        throw createError(certificateItemResource.httpStatusCode, certificateItemResource.httpStatusCode.toString());
    }
    return certificateItemResource.resource as CertificateItem;
};

export const getCertificateItem = async (oAuth: string, certificateId: string): Promise<CertificateItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certificateItemResource: Resource<CertificateItem> = await api.certificate.getCertificate(certificateId);
    if (certificateItemResource.httpStatusCode !== 200) {
        throw createError(certificateItemResource.httpStatusCode, certificateItemResource.httpStatusCode.toString() || "Unable to retrieve certificate");
    }
    return certificateItemResource.resource as CertificateItem;
};

export const addItemToBasket = async (oAuth: string, itemUri: ItemUriPostRequest): Promise<BasketItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const itemUriResource: Resource<BasketItem> = await api.basket.postItemToBasket(itemUri);
    if (itemUriResource.httpStatusCode !== 200 && itemUriResource.httpStatusCode !== 201) {
        throw createError(itemUriResource.httpStatusCode, itemUriResource.httpStatusCode.toString());
    }
    return itemUriResource.resource as BasketItem;
};

export const getBasket = async (oAuth: string): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.getBasket();
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    return basketResource.resource as Basket;
};

export const patchBasket = async (oAuth: string, basketPatchRequest: BasketPatchRequest): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.patchBasket(basketPatchRequest);
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    return basketResource.resource as Basket;
};
