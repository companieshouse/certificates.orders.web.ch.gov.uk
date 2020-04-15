import {setItemOptions} from "../../controllers/certificate.options.controller";

describe("setItemOptions", () => {

  it("should set includeBasicInformation on DirectorDetails to true, when the option is directors", () => {
    const options = ["directors"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.directorDetails?.includeBasicInformation).toBeTruthy();
  });

  it("should set includeCompanyObjectsInformation to true, when the option is company-objects", () => {
    const options = ["company-objects"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.includeCompanyObjectsInformation).toBeTruthy();
  });

  it("should set includeGoodStandingInformation to true, when the option is good-standing", () => {
    const options = ["good-standing"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.includeGoodStandingInformation).toBeTruthy();
  });

  it("should set includeAddressRecordsType on registeredOfficeAddressDetails to current, when the option is registered-office", () => {
    const options = ["registered-office"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).toBe("current");
  });

  it("should set includeBasicInformation on secretaryDetails to true, when the option is secretaries", () => {
    const options = ["secretaries"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).toBeTruthy();
  });

  it("should set multiple itemOptions, when multiple options are set", () => {
    const options = ["secretaries", "good-standing", "company-objects"];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).toBeTruthy();
    expect(returnedItemOptions?.includeGoodStandingInformation).toBeTruthy();
    expect(returnedItemOptions?.includeCompanyObjectsInformation).toBeTruthy();
    expect(returnedItemOptions?.directorDetails?.includeBasicInformation).toBeNull();
    expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).toBeNull();
  });

  it("should leave multiple itemOptions to null, when there are no options", () => {
    const options = [];
    const returnedItemOptions = setItemOptions(options);

    expect(returnedItemOptions?.secretaryDetails?.includeBasicInformation).toBeNull();
    expect(returnedItemOptions?.includeGoodStandingInformation).toBeNull();
    expect(returnedItemOptions?.includeCompanyObjectsInformation).toBeNull();
    expect(returnedItemOptions?.directorDetails?.includeBasicInformation).toBeNull();
    expect(returnedItemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType).toBeNull();
  });

});