import chai from "chai";

import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../../src/controllers/certificates/llp-certificates/delivery.details.controller";
import { mockDissolvedCertificateItem } from "../../../__mocks__/certificates.mocks";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../../__mocks__/session.mocks";

describe("llp.delivery.details.controller.unit", () => {
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

    describe("setBackUrl for only designated members options selected", () => {
        it("the back button link should take the user to the designated member options page", () => {
            const certificateItem = {
                itemOptions: {
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("designated-members-options");
        });
    });

    describe("setBackUrl for only members options selected", () => {
        it("the back button link should take the user to the members options page", () => {
            const certificateItem = {
                itemOptions: {
                    memberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("members-options");
        });
    });

    describe("setBackUrl for both designated member options and registered office options selected", () => {
        it("the back button link should take the user to the designated member options page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("designated-members-options");
        });
    });

    describe("setBackUrl for designated members, members and registered office options selected", () => {
        it("the back button link should take the user to the members options page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    },
                    memberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("members-options");
        });
    });

    describe("setBackUrl for dissolved certificate", () => {
        it("the back button link should take the user to the start page for dissolved certificate", () => {
            const certificateItem = mockDissolvedCertificateItem as CertificateItem;

            chai.expect(setBackLink(mockDissolvedCertificateItem, dataEmpty)).to.include("/orderable/dissolved-certificates");
        });
    });
});
