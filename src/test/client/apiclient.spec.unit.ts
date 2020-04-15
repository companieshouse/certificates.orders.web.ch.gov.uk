import { postCertificateItem } from "../../client/api.client";
import Resource from "ch-sdk-node/dist/services/resource";
import CertificateItemService from "ch-sdk-node/dist/services/order/item/certificate/service";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

jest.mock("ch-sdk-node/dist/services/order/item/certificate/service");

const dummySDKResponse: Resource<CertificateItem> = {
  httpStatusCode: 200,
  resource: {
    companyName: "Girls Trust",
    companyNumber: "00006400",
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
  companyNumber: "00006400",
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
    mockPostCertificateItem.mockResolvedValueOnce(dummySDKResponse);
    const certificateItem = await postCertificateItem("oauth", certificateItemRequest);
    expect(certificateItem).toEqual(dummySDKResponse.resource);
  });
});
