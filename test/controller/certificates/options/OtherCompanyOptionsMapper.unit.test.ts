import {
    CertificateItem, CertificateItemPatchRequest,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { CERTIFICATE_OPTIONS } from "../../../../src/model/template.paths";
import { OptionsPageRedirect } from "../../../../src/controllers/certificates/options/OptionsPageRedirect";
import { OptionSelection } from "../../../../src/controllers/certificates/options/OptionSelection";
import { OtherCompanyOptionsMapper } from "../../../../src/controllers/certificates/options/OtherCompanyOptionsMapper";
import sessionHandler from "@companieshouse/node-session-handler";
import { CompanyStatus } from "../../../../src/controllers/certificates/model/CompanyStatus"; // needed for side-effects

const chai = require("chai");

describe("OtherCompanyOptionMapper", () => {
    let mapper: OtherCompanyOptionsMapper;

    beforeEach(() => {
        mapper = new OtherCompanyOptionsMapper();
    });

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
            chai.expect(result.template).to.equal(CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "active"
                },
                templateName: CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/certificates",
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
            chai.expect(result.template).to.equal(CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "liquidation"
                },
                templateName: CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/certificates",
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
            chai.expect(result.template).to.equal(CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "administration"
                },
                templateName: CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/certificates",
                filterMappings: {
                    goodStanding: false,
                    liquidators: false,
                    administrators: true
                }
            });
        });
    });

    describe("Map provided item options to an update request", () => {
        it("Maps an array of provided options", () => {
            // given
            const options = [
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.REGISTERED_OFFICE_ADDRESS,
                OptionSelection.DIRECTORS,
                OptionSelection.SECRETARIES,
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const result = mapper.mapOptionsToUpdate(CompanyStatus.ACTIVE, options);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    includeGoodStandingInformation: true,
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    directorDetails: {
                        includeBasicInformation: true
                    },
                    secretaryDetails: {
                        includeBasicInformation: true
                    },
                    includeCompanyObjectsInformation: true,
                    liquidatorsDetails: {
                        includeBasicInformation: true
                    },
                    administratorsDetails: {
                        includeBasicInformation: true
                    }
                },
                quantity: 1
            } as CertificateItemPatchRequest);
        });

        it("Maps a single option", () => {
            // given
            const option = OptionSelection.STATEMENT_OF_GOOD_STANDING;

            // when
            const result = mapper.mapOptionsToUpdate(CompanyStatus.ACTIVE, option);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    ...mapper.createInitialItemOptions(CompanyStatus.ACTIVE),
                    includeGoodStandingInformation: true
                },
                quantity: 1
            } as CertificateItemPatchRequest);
        });

        it("Maps undefined to an initial item", () => {
            // when
            const result = mapper.mapOptionsToUpdate(CompanyStatus.ACTIVE, undefined);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    ...mapper.createInitialItemOptions(CompanyStatus.ACTIVE)
                },
                quantity: 1
            } as CertificateItemPatchRequest);
        });
    });

    describe("Create a template ItemOptionsRequest object", () => {
        it("Returns an ItemOptionsRequest object for an active company", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.ACTIVE);

            // then
            chai.expect(result).to.deep.equal({
                directorDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeCountryOfResidence: null,
                    includeDobType: null,
                    includeNationality: null,
                    includeOccupation: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                },
                secretaryDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null
                }
            });
        });

        it("Returns an ItemOptionsRequest object for a liquidated company", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.LIQUIDATION);

            // then
            chai.expect(result).to.deep.equal({
                directorDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeCountryOfResidence: null,
                    includeDobType: null,
                    includeNationality: null,
                    includeOccupation: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                },
                secretaryDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null
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
                directorDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null,
                    includeCountryOfResidence: null,
                    includeDobType: null,
                    includeNationality: null,
                    includeOccupation: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                registeredOfficeAddressDetails: {
                    includeAddressRecordsType: null
                },
                secretaryDetails: {
                    includeBasicInformation: null,
                    includeAddress: null,
                    includeAppointmentDate: null
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

        it("Maps directors", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.DIRECTORS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.directorDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps secretaries", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.SECRETARIES;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.secretaryDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps company objects", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.COMPANY_OBJECTS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.includeCompanyObjectsInformation).to.be.true;
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
                OptionSelection.SECRETARIES,
                OptionSelection.DIRECTORS,
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS,
                OptionSelection.REGISTERED_OFFICE_ADDRESS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: { itemOptions: { registeredOfficeAddressDetails: {} } } as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("registered-office-options"));
        });

        it("Returns director options redirect if registered office details unselected", () => {
            // given
            const options = [
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.SECRETARIES,
                OptionSelection.DIRECTORS,
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("director-options"));
        });

        it("Returns secretary options redirect if registered office, director details unselected", () => {
            // given
            const options = [
                OptionSelection.SECRETARIES,
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("secretary-options"));
        });

        it("Returns delivery options redirect if registered office, director, secretary details unselected", () => {
            // given
            const options = [
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.ADMINISTRATORS_DETAILS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("delivery-options"));
        });
    });
});
