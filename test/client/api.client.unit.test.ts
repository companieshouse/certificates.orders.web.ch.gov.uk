import sinon from "sinon";
import chai from "chai";
import Resource, {
    ApiErrorResponse,
    ApiResponse,
    ApiResult
} from "@companieshouse/api-sdk-node/dist/services/resource";
import CertificateItemService from "@companieshouse/api-sdk-node/dist/services/order/certificates/service";
import BasketService from "@companieshouse/api-sdk-node/dist/services/order/basket/service";
import CertifiedCopyItemService from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/service";
import {
    CertificateItem,
    CertificateItemInitialRequest,
    CertificateItemPostRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { Basket, BasketPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

import {
    getBasket,
    getCertifiedCopyItem,
    getCompanyProfile,
    getMissingImageDeliveryItem,
    patchBasket,
    postCertificateItem,
    postInitialCertificateItem,
    postMissingImageDeliveryItem
} from "../../src/client/api.client";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { MidService } from "@companieshouse/api-sdk-node/dist/services/order";
import { MidItem, MidItemPostRequest } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";
import { failure, success, Success } from "../../../api-sdk-node/dist/services/result";

const dummyBasketSDKResponse: Resource<Basket> = {
    httpStatusCode: 200,
    resource: {
        deliveryDetails: {
            addressLine1: "117 kings road",
            addressLine2: "canton",
            country: "wales",
            forename: "John",
            locality: "Cardiff",
            poBox: "po box",
            postalCode: "CF5 3NB",
            region: "Glamorgan",
            surname: "Smith"
        }
    }
};

const basketPatchRequest: BasketPatchRequest = {
    deliveryDetails: {
        addressLine1: "117 kings road",
        addressLine2: "canton",
        country: "wales",
        forename: "John",
        locality: "Cardiff",
        poBox: "po box",
        postalCode: "CF5 3NB",
        region: "Glamorgan",
        surname: "Smith"
    }
};

const dummyCertificateItemSDKResponse: Resource<CertificateItem> = {
    httpStatusCode: 201,
    resource: {
        companyName: "Company Name",
        companyNumber: "00000000",
        customerReference: "1133XR",
        description: "certificate",
        descriptionIdentifier: "certificate",
        descriptionValues: {
            item: "certificate"
        },
        etag: "33a64df551425fcc55e4d42a148795d9f25f89d4",
        id: "CHS00000000000000004",
        itemCosts: [],
        itemOptions: {
            certificateType: "incorporation",
            collectionLocation: "cardiff",
            companyStatus: "active",
            contactNumber: "07596820642",
            deliveryMethod: "collection",
            deliveryTimescale: "standard",
            directorDetails: {
                includeAddress: true,
                includeAppointmentDate: false,
                includeBasicInformation: false,
                includeCountryOfResidence: false,
                includeDobType: "yes",
                includeNationality: true,
                includeOccupation: true
            },
            forename: "John",
            includeCompanyObjectsInformation: true,
            includeEmailCopy: true,
            includeGoodStandingInformation: true,
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: "yes",
                includeDates: true
            },
            secretaryDetails: {
                includeAddress: true,
                includeAppointmentDate: false,
                includeBasicInformation: false,
                includeCountryOfResidence: false,
                includeDobType: "yes",
                includeNationality: true,
                includeOccupation: true
            },
            surname: "Smith",
            companyType: "ltd",
            designatedMemberDetails: {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: false,
                includeCountryOfResidence: false,
                includeDobType: "no"
            },
            memberDetails: {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: false,
                includeCountryOfResidence: false,
                includeDobType: "no"
            },
            generalPartnerDetails: {
                includeBasicInformation: false
            },
            limitedPartnerDetails: {
                includeBasicInformation: false
            },
            principalPlaceOfBusinessDetails: {
                includeDates: false,
                includeAddressRecordsType: "no"
            },
            includeGeneralNatureOfBusinessInformation: false,
            liquidatorsDetails: {
                includeBasicInformation: false
            }
        },
        kind: "item#certificate",
        links: {
            self: "/cert"
        },
        postageCost: "0",
        postalDelivery: false,
        quantity: 1,
        totalItemCost: "50"
    }
};

const certificateItemRequest: CertificateItemPostRequest = {
    companyNumber: "00000000",
    itemOptions: {
        forename: "John",
        surname: "Smith"
    },
    quantity: 1
};

const certificateItemInitialRequest: CertificateItemInitialRequest = {
    companyNumber: "12345678"
};

const dummyCompanyProfileSDKResponse: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "active",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "ltd",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false,
            nextMadeUpTo: "2020-05-31"
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};

const dummyCertifiedCopyItemSDKResponse: Resource<CertifiedCopyItem> = {
    httpStatusCode: 200,
    resource: {
        companyName: "test company",
        companyNumber: "00000000",
        totalItemCost: "15",
        itemOptions: {
            deliveryMethod: "postal",
            deliveryTimescale: "same-day",
            filingHistoryDocuments: [{
                filingHistoryDate: "2010-02-12",
                filingHistoryDescription: "change-person-director-company-with-change-date",
                filingHistoryDescriptionValues: {
                    change_date: "2010-02-12",
                    officer_name: "Thomas David Wheare"
                },
                filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                filingHistoryType: "CH01",
                filingHistoryCost: "15"
            }]
        }
    }
};

const dummyMissingImageDeliveryItemSDKResponse: Resource<MidItem> = {
    httpStatusCode: 200,
    resource: {
        companyName: "Company Name",
        companyNumber: "00000000",
        customerReference: "1133XR",
        description: "missing-image-delivery",
        descriptionIdentifier: "missing-image-delivery",
        descriptionValues: {
            item: "missing-image-delivery"
        },
        etag: "33a64df551425fcc55e4d42a148795d9f25f89d4",
        id: "MID00000000000000004",
        itemCosts: [],
        itemOptions: {
            filingHistoryDate: "2010-02-12",
            filingHistoryDescription: "change-person-director-company-with-change-date",
            filingHistoryDescriptionValues: {
                changeDate: "2010-02-12",
                officerName: "Thomas David Wheare"
            },
            filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
            filingHistoryType: "CH01"
        },
        kind: "item#missing-image-delivery",
        links: {
            self: "/missing-image-delivery"
        },
        postageCost: "0",
        postalDelivery: false,
        quantity: 1,
        totalItemCost: "50"
    }
};

const missingImageDeliveryItemRequest: MidItemPostRequest = {
    companyNumber: "1471",
    customerReference: "reference",
    itemOptions: {
        filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4"
    },
    quantity: 1
};

const sandbox = sinon.createSandbox();

describe("api.client", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("getCompanyProfile", () => {
        it("returns a company profile object", async () => {
            sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
                .returns(Promise.resolve(dummyCompanyProfileSDKResponse));

            const companyProfile = await getCompanyProfile("api key", "00000000");
            chai.expect(companyProfile).to.equal(dummyCompanyProfileSDKResponse.resource);
        });
    });

    describe("postInitialCertificateItem", () => {
        it("returns a Certificate Item object", async () => {
            const result: ApiResult<ApiResponse<CertificateItem>> = success({
                resource: dummyCertificateItemSDKResponse.resource,
                httpStatusCode: 201
            } as ApiResponse<CertificateItem>);
            sandbox.stub(CertificateItemService.prototype, "postInitialCertificate")
                .returns(Promise.resolve(result));

            const certificateItem = await postInitialCertificateItem("oauth", certificateItemInitialRequest);
            chai.expect(certificateItem.isSuccess()).to.equal(true);
            chai.expect(certificateItem.isFailure()).to.equal(false);
            chai.expect((certificateItem as Success<ApiResponse<CertificateItem>, ApiErrorResponse>).value.httpStatusCode).to.equal(201);
            chai.expect((certificateItem as Success<ApiResponse<CertificateItem>, ApiErrorResponse>).value.resource).to.equal(dummyCertificateItemSDKResponse.resource);
        });
        it("postInitialCertificateItem_error", async () => {
            const result: ApiResult<ApiErrorResponse> = failure({
                httpStatusCode: 500
            } as ApiErrorResponse);
            sandbox.stub(CertificateItemService.prototype, "postInitialCertificate")
                .returns(Promise.resolve(result));
            const certificateItem = await postInitialCertificateItem("oauth", certificateItemInitialRequest);
            chai.expect(certificateItem.isSuccess()).to.equal(false);
            chai.expect(certificateItem.isFailure()).to.equal(true);
            chai.expect(certificateItem.value.httpStatusCode).to.equal(500);
        });
    });

    describe("postCertificateItem", () => {
        it("returns a Certificate Item object", async () => {
            sandbox.stub(CertificateItemService.prototype, "postCertificate")
                .returns(Promise.resolve(dummyCertificateItemSDKResponse));

            const certificateItem = await postCertificateItem("oauth", certificateItemRequest);
            chai.expect(certificateItem).to.equal(dummyCertificateItemSDKResponse.resource);
        });
    });

    describe("getBasket", () => {
        it("returns the Basket details following GET basket", async () => {
            sandbox.stub(BasketService.prototype, "getBasket").returns(Promise.resolve(dummyBasketSDKResponse));
            const basketDetails = await getBasket("oauth");
            chai.expect(basketDetails).to.equal(dummyBasketSDKResponse.resource);
        });
    });

    describe("patchBasket", () => {
        it("returns the Basket details following PATCH basket", async () => {
            sandbox.stub(BasketService.prototype, "patchBasket").returns(Promise.resolve(dummyBasketSDKResponse));
            const patchBasketDetails = await patchBasket("oauth", basketPatchRequest);
            chai.expect(patchBasketDetails).to.equal(dummyBasketSDKResponse.resource);
        });
    });

    describe("getCertifiedCopyItem", () => {
        it("returns a certified copy item object", async () => {
            sandbox.stub(CertifiedCopyItemService.prototype, "getCertifiedCopy").returns(Promise.resolve(dummyCertifiedCopyItemSDKResponse));
            const certifiedCopyItem = await getCertifiedCopyItem("oauth", "CRT-360615-955167");
            chai.expect(certifiedCopyItem).to.equal(dummyCertifiedCopyItemSDKResponse.resource);
        });
    });

    describe("postMissingImageDeliveryItem", () => {
        it("returns a Missing Image Delivery Item object", async () => {
            sandbox.stub(MidService.prototype, "postMid")
                .returns(Promise.resolve(dummyMissingImageDeliveryItemSDKResponse));
            const missingImageDeliveryItem = await postMissingImageDeliveryItem("oauth", missingImageDeliveryItemRequest);
            chai.expect(missingImageDeliveryItem).to.equal(dummyMissingImageDeliveryItemSDKResponse.resource);
        });
    });

    describe("getMissingImageDeliveryItem", () => {
        it("returns a missing image delivery item", async () => {
            sandbox.stub(MidService.prototype, "getMid")
                .returns(Promise.resolve(dummyMissingImageDeliveryItemSDKResponse));
            const missingImageDeliveryItem = await getMissingImageDeliveryItem("oauth", "MID-360615-955167");
            chai.expect(missingImageDeliveryItem).to.equal(dummyMissingImageDeliveryItemSDKResponse.resource);
        });
    });
});
