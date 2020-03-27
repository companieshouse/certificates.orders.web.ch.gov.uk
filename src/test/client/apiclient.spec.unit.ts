import {postCertificateItem} from "../../client/api.client";
import Resource from "ch-sdk-node/dist/services/resource";
import CertificateItemService from "ch-sdk-node/dist/services/order/item/certificate/service";
import { CertificateItemPostRequest, CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

//////////////////
//Set up mocks

jest.mock("ch-sdk-node/dist/services/order/item/certificate/service");

// end of set up mocks
///////////////////////

describe("apiclient company profile unit tests", () => {
  const mockPostCertificateItem = (CertificateItemService.prototype.postCertificate as jest.Mock);
  beforeEach(() => {
    mockPostCertificateItem.mockReset();
  });

  it("returns an Certificate Item object", async () => {
    mockPostCertificateItem.mockResolvedValueOnce(dummySDKResponse);
    const certificateItem = await postCertificateItem("oauth", certificateItemRequest);
    expect(certificateItem).toEqual();
  });
});

const dummySDKResponse: Resource<CertificateItem> = {
  httpStatusCode: 200,
  resource: {
    companyNumber: "00006400",
        customerReference: undefined,
        itemOptions: {
            certificateType: undefined,
            collectionLocation: undefined,
            contactNumber: undefined,
            deliveryMethod: undefined,
            deliveryTimescale: undefined,
            directorDetails: undefined,
            forename: "first name",
            includeCompanyObjectsInformation: undefined,
            includeEmailCopy: undefined,
            includeGoodStandingInformation: undefined,
            registeredOfficeAddressDetails: undefined,
            secretaryDetails: undefined,
            surname: "last name",
        },
        quantity: 1,
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
