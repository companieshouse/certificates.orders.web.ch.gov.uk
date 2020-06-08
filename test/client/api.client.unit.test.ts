import sinon from "sinon";
import chai from "chai";
import Resource from "ch-sdk-node/dist/services/resource";
import CertificateItemService from "ch-sdk-node/dist/services/order/item/certificate/service";
import BasketService from "ch-sdk-node/dist/services/order/basket/service";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { Basket, BasketPatchRequest } from "ch-sdk-node/dist/services/order/basket/types";

import { postCertificateItem, patchBasket, getBasket } from "../../src/client/api.client";

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
      surname: "Smith",
    },
  },
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
    surname: "Smith",
  },
};

const dummyCertificateItemSDKResponse: Resource<CertificateItem> = {
  httpStatusCode: 200,
  resource: {
    companyName: "Company Name",
    companyNumber: "00000000",
    customerReference: "1133XR",
    description: "certificate",
    descriptionIdentifier: "certificate",
    descriptionValues: {
      item: "certificate",
    },
    etag: "33a64df551425fcc55e4d42a148795d9f25f89d4",
    id: "CHS00000000000000004",
    itemCosts: [],
    itemOptions: {
      certificateType: "incorporation",
      collectionLocation: "cardiff",
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
        includeOccupation: true,
      },
      forename: "John",
      includeCompanyObjectsInformation: true,
      includeEmailCopy: true,
      includeGoodStandingInformation: true,
      registeredOfficeAddressDetails: {
        includeAddressRecordsType: "yes",
        includeDates: true,
      },
      secretaryDetails: {
        includeAddress: true,
        includeAppointmentDate: false,
        includeBasicInformation: false,
        includeCountryOfResidence: false,
        includeDobType: "yes",
        includeNationality: true,
        includeOccupation: true,
      },
      surname: "Smith",
    },
    kind: "item#certificate",
    links: {
      self: "/cert",
    },
    postageCost: "0",
    postalDelivery: false,
    quantity: 1,
    totalItemCost: "50",
  },
};

const certificateItemRequest: CertificateItemPostRequest = {
  companyNumber: "00000000",
  itemOptions: {
    forename: "John",
    surname: "Smith",
  },
  quantity: 1,
};

const sandbox = sinon.createSandbox();

describe("api.client", () => {
  afterEach(() => {
    sandbox.reset();
    sandbox.restore();
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

});