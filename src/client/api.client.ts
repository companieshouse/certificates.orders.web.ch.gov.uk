import { createApiClient } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import {
    Basket,
    BasketPatchRequest,
    ItemUriRequest
} from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    CertificateItem,
    CertificateItemInitialRequest,
    CertificateItemPatchRequest,
    CertificateItemPostRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { API_URL, APPLICATION_NAME } from "../config/config";
import { createLogger } from "ch-structured-logging";
import Resource, { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import createError from "http-errors";
import { MidItem, MidItemPostRequest } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";

const logger = createLogger(APPLICATION_NAME);

export const getCompanyProfile = async (apiKey: string, companyNumber: string): Promise<CompanyProfile> => {
    const api = createApiClient(apiKey, undefined, API_URL);
    const companyProfileResource: Resource<CompanyProfile> = await api.companyProfile.getCompanyProfile(companyNumber.toUpperCase());
    if (companyProfileResource.httpStatusCode !== 200 && companyProfileResource.httpStatusCode !== 201) {
        throw createError(companyProfileResource.httpStatusCode, companyProfileResource.httpStatusCode.toString());
    }
    logger.info(`Get company profile, company_number=${companyNumber}, status_code=${companyProfileResource.httpStatusCode}`);
    return companyProfileResource.resource as CompanyProfile;
};

export const postCertificateItem =
    async (oAuth: string, certificateItem: CertificateItemPostRequest): Promise<ApiResult<ApiResponse<CertificateItem>>> => {
        const api = createApiClient(undefined, oAuth, API_URL);
        const certificateItemResource = await api.certificate.postCertificate(certificateItem);
        logger.info(`Create certificate, status_code=${certificateItemResource.value.httpStatusCode}, company_number=${certificateItem.companyNumber}`);
        return certificateItemResource;
    };

export const postInitialCertificateItem =
    async (oAuth: string, certificateItem: CertificateItemInitialRequest): Promise<ApiResult<ApiResponse<CertificateItem>>> => {
        const api = createApiClient(undefined, oAuth, API_URL);
        const certificateItemResource = await api.certificate.postInitialCertificate(certificateItem);
        logger.info(`Create initial certificate, status_code=${certificateItemResource.value.httpStatusCode}, company_number=${certificateItem.companyNumber}`);
        return certificateItemResource;
    };

export const patchCertificateItem = async (
    oAuth: string, certificateId: string, certificateItem: CertificateItemPatchRequest): Promise<CertificateItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certificateItemResource = await api.certificate.patchCertificate(certificateItem, certificateId);
    if (certificateItemResource.isFailure()) {
        const status = certificateItemResource.value.httpStatusCode || 500;
        throw createError(status, status.toString());
    }
    logger.info(`Patch certificate, id=${certificateId}, status_code=${certificateItemResource.value.httpStatusCode}, company_number=${certificateItemResource.value.resource?.companyNumber}`);
    return certificateItemResource.value.resource as CertificateItem;
};

export const getCertificateItem = async (oAuth: string, certificateId: string): Promise<CertificateItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certificateItemResource = await api.certificate.getCertificate(certificateId);
    if (certificateItemResource.isFailure()) {
        const status = certificateItemResource.value.httpStatusCode || 500;
        throw createError(status, status.toString());
    }
    return certificateItemResource.value.resource as CertificateItem;
};

export const addItemToBasket = async (oAuth: string, itemUri: ItemUriRequest): Promise<BasketItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const itemUriResource: Resource<BasketItem> = await api.basket.postItemToBasket(itemUri);
    if (itemUriResource.httpStatusCode !== 200 && itemUriResource.httpStatusCode !== 201) {
        throw createError(itemUriResource.httpStatusCode, itemUriResource.httpStatusCode.toString());
    }
    logger.info(`Add item to basket, status_code=${itemUriResource.httpStatusCode}, company_number=${itemUriResource.resource?.companyNumber}`);
    return itemUriResource.resource as BasketItem;
};

export const appendItemToBasket = async (oAuth: string, itemUri: ItemUriRequest): Promise<BasketItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const itemUriResource: Resource<BasketItem> = await api.basket.appendItemToBasket(itemUri);
    if (itemUriResource.httpStatusCode !== 200 && itemUriResource.httpStatusCode !== 201) {
        throw createError(itemUriResource.httpStatusCode, itemUriResource.httpStatusCode.toString());
    }
    logger.info(`Append item to basket, status_code=${itemUriResource.httpStatusCode}, company_number=${itemUriResource.resource?.companyNumber}`);
    return itemUriResource.resource as BasketItem;
};

export const getBasket = async (oAuth: string): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.getBasket();
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    logger.info(`Get basket, status_code=${basketResource.httpStatusCode}`);
    return basketResource.resource as Basket;
};

export const patchBasket = async (oAuth: string, basketPatchRequest: BasketPatchRequest): Promise<Basket> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const basketResource: Resource<Basket> = await api.basket.patchBasket(basketPatchRequest);
    if (basketResource.httpStatusCode !== 200 && basketResource.httpStatusCode !== 201) {
        throw createError(basketResource.httpStatusCode, basketResource.httpStatusCode.toString());
    }
    logger.info(`Patch basket, status_code=${basketResource.httpStatusCode}`);
    return basketResource.resource as Basket;
};

export const getCertifiedCopyItem = async (oAuth: string, certifiedCopyId: string): Promise<CertifiedCopyItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const certifiedCopyItemResource: Resource<CertifiedCopyItem> = await api.certifiedCopies.getCertifiedCopy(certifiedCopyId);
    if (certifiedCopyItemResource.httpStatusCode !== 200 && certifiedCopyItemResource.httpStatusCode !== 201) {
        throw createError(certifiedCopyItemResource.httpStatusCode, certifiedCopyItemResource.httpStatusCode.toString());
    }
    logger.info(`Get certified copy item, certified_copy_item_id=${certifiedCopyId}, status_code=${certifiedCopyItemResource.httpStatusCode}, company_number=${certifiedCopyItemResource.resource?.companyNumber}`);
    return certifiedCopyItemResource.resource as CertifiedCopyItem;
};

export const postMissingImageDeliveryItem = async (oAuth: string, missingImageDeliveryItem: MidItemPostRequest): Promise<MidItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const missingImageDeliveryItemResource: Resource<MidItem> = await api.mid.postMid(missingImageDeliveryItem);
    if (missingImageDeliveryItemResource.httpStatusCode !== 200 && missingImageDeliveryItemResource.httpStatusCode !== 201) {
        throw createError(missingImageDeliveryItemResource.httpStatusCode, missingImageDeliveryItemResource.httpStatusCode.toString());
    }
    logger.info(`Create Missing Image Delivery, status_code=${missingImageDeliveryItemResource.httpStatusCode}, company_number=${missingImageDeliveryItemResource.resource?.companyNumber}`);
    return missingImageDeliveryItemResource.resource as MidItem;
};

export const getMissingImageDeliveryItem = async (oAuth: string, missingImageDeliveryId: string): Promise<MidItem> => {
    const api = createApiClient(undefined, oAuth, API_URL);
    const midItemResource: Resource<MidItem> = await api.mid.getMid(missingImageDeliveryId);
    if (midItemResource.httpStatusCode !== 200 && midItemResource.httpStatusCode !== 201) {
        throw createError(midItemResource.httpStatusCode, midItemResource.httpStatusCode.toString());
    }
    logger.info(`Get missing image delivery item, missing_image_delivery_id=${missingImageDeliveryId}, status_code=${midItemResource.httpStatusCode}, , company_number=${midItemResource.resource?.companyNumber}`);
    return midItemResource.resource as MidItem;
};
