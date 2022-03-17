import {
    CertificateItem,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { LP_CERTIFICATE_OPTIONS } from "../../../../src/model/template.paths";
import { OptionsPageRedirect } from "../../../../src/controllers/certificates/options/OptionsPageRedirect";
import { OptionSelection } from "../../../../src/controllers/certificates/options/OptionSelection";
import { LPOptionsMapper } from "../../../../src/controllers/certificates/options/LPOptionsMapper";
import sessionHandler from "@companieshouse/node-session-handler";
import { CompanyStatus } from "../../../../src/controllers/certificates/model/CompanyStatus"; // needed for side-effects

const chai = require("chai");

describe("LPOptionMapper", () => {
    const mapper = new LPOptionsMapper();
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
            chai.expect(result.template).to.equal(LP_CERTIFICATE_OPTIONS);
            chai.expect(result.data).to.deep.equal({
                companyNumber: "12345678",
                itemOptions: {
                    companyStatus: "active"
                },
                templateName: LP_CERTIFICATE_OPTIONS,
                SERVICE_URL: "/company/12345678/orderable/lp-certificates"
            });
        });
    });

    describe("Create a template ItemOptionsRequest object", () => {
        it("Returns an ItemOptionsRequest object with limited partnership fields present", () => {
            // when
            const result = mapper.createInitialItemOptions(CompanyStatus.ACTIVE);

            // then
            chai.expect(result).to.deep.equal({
                generalPartnerDetails: {
                    includeBasicInformation: null
                },
                includeCompanyObjectsInformation: null,
                includeGoodStandingInformation: null,
                limitedPartnerDetails: {
                    includeBasicInformation: null
                },
                principalPlaceOfBusinessDetails: {
                    includeAddressRecordsType: null
                },
                includeGeneralNatureOfBusinessInformation: null
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

        it("Maps principal place of business", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.PRINCIPAL_PLACE_OF_BUSINESS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.principalPlaceOfBusinessDetails?.includeAddressRecordsType).to.equal("current");
            chai.expect(actual.principalPlaceOfBusinessDetails?.includeDates).to.be.undefined;
        });

        it("Maps general partners", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.GENERAL_PARTNERS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.generalPartnerDetails?.includeBasicInformation).to.be.true;
        });

        it("Maps limited partners", () => {
            // given
            const itemOptions = {} as ItemOptionsRequest;
            const option = OptionSelection.LIMITED_PARTNERS;

            // when
            const actual = mapper.filterItemOptions(itemOptions, option);

            // then
            chai.expect(actual.limitedPartnerDetails?.includeBasicInformation).to.be.true;
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
        it("Returns principal place of business details redirect if selected", () => {
            // given
            const options = [
                OptionSelection.PRINCIPAL_PLACE_OF_BUSINESS,
                OptionSelection.LIQUIDATORS_DETAILS,
                OptionSelection.GENERAL_PARTNERS,
                OptionSelection.LIMITED_PARTNERS,
                OptionSelection.GENERAL_NATURE_OF_BUSINESS
            ];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("principal-place-of-business-options"));
        });

        it("Returns delivery details redirect if no options selected", () => {
            // given
            const options = [];

            // when
            const actual = mapper.getRedirect(options, { certificateItem: {} as CertificateItem });

            // then
            chai.expect(actual).to.deep.equal(new OptionsPageRedirect("delivery-details"));
        });
    });
});
