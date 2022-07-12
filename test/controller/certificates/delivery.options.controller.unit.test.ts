import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../src/controllers/certificates/delivery.options.controller";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../__mocks__/session.mocks";

describe("delivery.options.controller.unit", () => {
    describe("setBackUrl for no option selected", () => {
        it("the back button link should take the user to the certificate options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("certificate-options");
        });
    });

    describe("setBackUrl for only registered office option selected", () => {
        it("should link to the abbreviated registered office option page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageFalse)).to.equal("registered-office-options");
        });
    });

    describe("setBackUrl for only registered office option selected via full page", () => {
        it("should link to the full registered office option page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "all"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageTrue)).to.equal("registered-office-options?layout=full");
        });
    });

    describe("setBackUrl for only director options selected", () => {
        it("the back button link should take the user to the director options page", () => {
            const certificateItem = {
                itemOptions: {
                    directorDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("director-options");
        });
    });

    describe("setBackUrl for only secretary options selected", () => {
        it("the back button link should take the user to the secretary options page", () => {
            const certificateItem = {
                itemOptions: {
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("secretary-options");
        });
    });

    describe("setBackUrl for both director options and registered office options selected", () => {
        it("the back button link should take the user to the director options page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    directorDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("director-options");
        });
    });

    describe("setBackUrl for director, secretary and registered office options selected", () => {
        it("the back button link should take the user to the secretary options page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    directorDetails: {
                        includeBasicInformation: true
                    },
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("secretary-options");
        });
    });
});
