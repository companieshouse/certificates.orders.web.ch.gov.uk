import { postCertificateItem, patchBasket, getBasket } from "../../client/api.client";
import Resource from "ch-sdk-node/dist/services/resource";
import CertificateItemService from "ch-sdk-node/dist/services/order/item/certificate/service";
import BasketService from "ch-sdk-node/dist/services/order/basket/service";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { Basket, BasketPatchRequest } from "ch-sdk-node/dist/services/order/basket/types";

jest.mock("ch-sdk-node/dist/services/order/item/certificate/service");
jest.mock("ch-sdk-node/dist/services/order/basket/service");

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
}

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
}

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

describe("apiclient company profile unit tests", () => {
  const mockPostCertificateItem = (CertificateItemService.prototype.postCertificate as jest.Mock);
  beforeEach(() => {
    mockPostCertificateItem.mockReset();
  });

  it("returns an Certificate Item object", async () => {
    mockPostCertificateItem.mockResolvedValueOnce(dummyCertificateItemSDKResponse);
    const certificateItem = await postCertificateItem("oauth", certificateItemRequest);
    expect(certificateItem).toEqual(dummyCertificateItemSDKResponse.resource);
  });
});

describe("apiclient basket unit tests", () => {
  const mockGetBasket = (BasketService.prototype.getBasket as jest.Mock);
  const mockPatchBasket =(BasketService.prototype.patchBasket as jest.Mock);
  beforeEach(() => {
    mockGetBasket.mockReset();
    mockPatchBasket.mockReset();
  });

  it("returns the Basket details following GET basket", async () => {
    mockGetBasket.mockResolvedValueOnce(dummyBasketSDKResponse);
    const basketDetails = await getBasket("oauth");
    expect(basketDetails).toEqual(dummyBasketSDKResponse.resource);
  });

  it("PATCH basket", async () => {
    mockPatchBasket.mockResolvedValue(dummyBasketSDKResponse);
    const patchBasketDetails = await patchBasket("oauth", basketPatchRequest);
    expect(patchBasketDetails).toEqual(dummyBasketSDKResponse.resource);
  });
})
