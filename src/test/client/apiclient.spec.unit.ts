import { postCertificateItem } from "../../client/api.client";
import Resource from "ch-sdk-node/dist/services/resource";
import CertificateItemService from "ch-sdk-node/dist/services/order/item/certificate/service";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

jest.mock("ch-sdk-node/dist/services/order/item/certificate/service");

const dummySDKResponse: Resource<CertificateItem> = {
  httpStatusCode: 200,
  resource: {
    companyNumber: "00006400",
    companyName: "Company Name",
    description: "description",
    descriptionIdentifier: "description identifier",
    descriptionValues: {
      "test": "test"
    },
    etag: "etag",
    id: "CHS001",
    itemCosts: [],
    customerReference: "reference",
    itemOptions: {
      certificateType: "incorporation",
      collectionLocation: "loc",
      contactNumber: "number",
      deliveryMethod: "del",
      deliveryTimescale: "time",
      directorDetails: {
        includeAddress: true,
        includeAppointmentDate: false,
        includeBasicInformation: false,
        includeCountryOfResidence: false,
        includeDobType: "yes",
        includeNationality: true,
        includeOccupation: true
      },
      forename: "first name",
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
        includeOccupation: true
      },
      surname: "last name",
    },
    kind: "cert",
    links: {
      self: "/cert"
    },
    postageCost: "21",
    postalDelivery: false,
    quantity: 1,
    totalItemCost: "23"
  },
};

const certificateItemRequest: CertificateItemPostRequest = {
  companyNumber: "00006400",
  itemOptions: {
    forename: "first name",
    surname: "last name",
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