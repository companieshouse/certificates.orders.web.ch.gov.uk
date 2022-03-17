import { LLPOptionsMapper } from "../../../../src/controllers/certificates/options/LLPOptionsMapper";
import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { LLP_CERTIFICATE_OPTIONS } from "../../../../src/model/template.paths";
import { OptionsPageRedirect } from "../../../../src/controllers/certificates/options/OptionsPageRedirect";
import { OptionSelection } from "../../../../src/controllers/certificates/options/OptionSelection";
import { CompanyStatus } from "../../../../src/controllers/certificates/model/CompanyStatus"; // needed for side-effects

const chai = require("chai");

describe("LLPOptionMapper", () => {
    const mapper = new LLPOptionsMapper();
    describe("Map item to options", () => {
        it("Creates an OptionsViewModel instance for an active company", () => {
            // given
            const certificate = {
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "active"
                }
            } as CertificateItem;

            // when
            const result = mapper.mapItemToOptions(certificate);
            delete result.data.optionFilter; // functions cannot be compared for equality

            // then
            chai.expect(result.template).to.equal(LLP_CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "active"
                },
                templateName: LLP_CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/llp-certificates",
                filterMappings: {
                    goodStanding: true,
                    liquidators: false,
                    administrators: false
                }
            });
        });

        it("Creates an OptionsViewModel instance for a liquidated company", () => {
            // given
            const certificate = {
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "liquidation"
                }
            } as CertificateItem;

            // when
            const result = mapper.mapItemToOptions(certificate);
            delete result.data.optionFilter; // functions cannot be compared for equality

            // then
            chai.expect(result.template).to.equal(LLP_CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "liquidation"
                },
                templateName: LLP_CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/llp-certificates",
                filterMappings: {
                    goodStanding: false,
                    liquidators: true,
                    administrators: false
                }
            });
        });
        it("Creates an OptionsViewModel instance for an administrated company", () => {
            // given
            const certificate = {
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "administration"
                }
            } as CertificateItem;

            // when
            const result = mapper.mapItemToOptions(certificate);
            delete result.data.optionFilter; // functions cannot be compared for equality

            // then
            chai.expect(result.template).to.equal(LLP_CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "administration"
                },
                templateName: LLP_CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/llp-certificates",
                filterMappings: {
                    goodStanding: false,
                    liquidators: false,
                    administrators: true
                }
            });
        });
    });

    describe("Create a template ItemOptionsRequest object", () => {
        it("Returns an ItemOptionsRequest object for an active company", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.ACTIVE);

            // then
            chai.expect(result).to.deep.equal({
                designatedMemberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                memberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                }
            });
        });

        it("Returns an ItemOptionsRequest object for a liquidated company", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.LIQUIDATION);

            // then
            chai.expect(result).to.deep.equal({
                designatedMemberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                memberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                },
                liquidatorsDetails: {
                    includeBasicInformation: null
                }
            } as ItemOptionsRequest);
        });

        it("Returns an ItemOptionsRequest object for an administrated company", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.ADMINISTRATION);

            // then
            chai.expect(result).to.deep.equal({
                designatedMemberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                memberDetails: {
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeBasicInformation: null,
                    includeCountryOfResidence: null,
                    includeDobType: null
                },
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                },
                administratorsDetails: {
                    includeBasicInformation: null
                }
            } as ItemOptionsRequest);
        });
    });

    describe("Map a selected option to an operation on an ItemOptionsRequest instance", () => {
        it("Maps statement of good standing", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.STATEMENT_OF_GOOD_STANDING;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.includeGoodStandingInformation).to.be.true;
        });

        it("Maps registered office address", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.REGISTERED_OFFICE_ADDRESS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.registeredOfficeAddressDetails?.includeAddressRecordsType).to.equal("current");
            chai.expect(actual.registeredOfficeAddressDetails?.includeDates).to.be.undefined;
        });

        it("Maps designated members", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.DESIGNATED_MEMBERS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.designatedMemberDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps members", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.MEMBERS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.memberDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps liquidators details", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.LIQUIDATORS_DETAILS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.liquidatorsDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps administrators details", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.ADMINISTRATORS_DETAILS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.administratorsDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps nothing if option not recognised", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = "unknown";

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual).to.deep.equal({});
        });
    });
    describe("Map selected options to a redirect model instance", () => {
        it("Returns registered office address if all options selected in any order", () => {
            // given
            const options = [
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.MEMBERS,
                OptionSelection.REGISTERED_OFFICE_ADDRESS,
                OptionSelection.DESIGNATED_MEMBERS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: { itemOptions: {} } as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("registered-office-options"));
        });

        it("Returns designated members options redirect if registered office details unselected", () => {
            // given
            const options = [
                OptionSelection.MEMBERS,
                OptionSelection.DESIGNATED_MEMBERS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("designated-members-options"));
        });

        it("Returns members options redirect if registered office, designated members details unselected", () => {
            // given
            const options = [
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.MEMBERS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("members-options"));
        });

        it("Returns delivery details redirect if registered office, designated members, members details unselected", () => {
            // given
            const options = [
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("delivery-details"));
        });
    });
});
