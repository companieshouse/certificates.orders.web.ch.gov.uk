import {
    CertificateItem, CertificateItemPatchRequest,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { CERTIFICATE_OPTIONS } from "../../../../src/model/template.paths";
import { OptionsPageRedirect } from "../../../../src/controllers/certificates/options/OptionsPageRedirect";
import { OptionSelection } from "../../../../src/controllers/certificates/options/OptionSelection";
import { OtherCompanyOptionsMapper } from "../../../../src/controllers/certificates/options/OtherCompanyOptionsMapper";
import sessionHandler from "@companieshouse/node-session-handler"; // needed for side-effects

const chai = require("chai");

describe("OtherCompanyOptionMapper", () => {
    let mapper: OtherCompanyOptionsMapper;

    beforeEach(() => {
        mapper = new OtherCompanyOptionsMapper(new OptionsPageRedirect("default"));
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
                    liquidators: false
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
                    liquidators: true
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
                OptionSelection.LIQUIDATORS_DETAILS
            ];

            // when
            const result = mapper.mapOptionsToUpdate("status", options);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    includeGoodStandingInformation: true,
                    registeredOfficeAddressDetails: {},
                    directorDetails: {
                        includeBasicInformation: true
                    },
                    secretaryDetails: {
                        includeBasicInformation: true
                    },
                    includeCompanyObjectsInformation: true,
                    liquidatorsDetails: {
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
            const result = mapper.mapOptionsToUpdate("status", option);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    ...mapper.createInitialItemOptions(),
                    includeGoodStandingInformation: true
                },
                quantity: 1
            } as CertificateItemPatchRequest);
        });

        it("Maps undefined to an initial item", () => {
            // when
            const result = mapper.mapOptionsToUpdate("status", undefined);

            // then
            chai.expect(result).to.deep.equal({
                itemOptions: {
                    ...mapper.createInitialItemOptions()
                },
                quantity: 1
            } as CertificateItemPatchRequest);
        });
    });

    describe("Create a template ItemOptionsRequest object", () => {
        it("Returns an ItemOptionsRequest object with appointment fields present", () => {
            // when
            const result = mapper.createInitialItemOptions();

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
            chai.expect(actual.registeredOfficeAddressDetails?.includeAddressRecordsType).to.be.undefined;
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
        it("Returns the highest priority redirect if associated option selected", () => {
            // given
            const options = [
                OptionSelection.DIRECTORS,
                OptionSelection.STATEMENT_OF_GOOD_STANDING,
                OptionSelection.REGISTERED_OFFICE_ADDRESS,
                OptionSelection.SECRETARIES,
                OptionSelection.COMPANY_OBJECTS,
                OptionSelection.LIQUIDATORS_DETAILS
            ];
            mapper.addRedirectForOption(OptionSelection.REGISTERED_OFFICE_ADDRESS, new OptionsPageRedirect("reg", 1));
            mapper.addRedirectForOption(OptionSelection.DIRECTORS, new OptionsPageRedirect("dir", 2));
            mapper.addRedirectForOption(OptionSelection.SECRETARIES, new OptionsPageRedirect("sec", 3));

            // when
            const actual = mapper.mapOptionsToRedirect(options);

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("reg", 1));
        });

        it("Returns the default redirect if no associated options selected", () => {
            // given
            const options = [];

            // when
            const actual = mapper.mapOptionsToRedirect(options);

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("default"));
        });
    });
});
