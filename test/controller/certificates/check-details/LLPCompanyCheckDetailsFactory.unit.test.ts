import chai from "chai";

import { CertificateItem, ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { LLP_CERTIFICATE_CHECK_DETAILS } from "../../../../src/model/template.paths";
import {
    MAPPED_ADDRESS_OPTION,
    MAPPED_CERTIFICATE_TYPE,
    MAPPED_DELIVERY_DETAILS,
    MAPPED_DELIVERY_METHOD,
    MAPPED_EMAIL_COPY_REQUIRED,
    MAPPED_FEE,
    MAPPED_MEMBER_OPTIONS,
    MAPPED_OPTION_VALUE,
    StubDefaultCompanyMappable
} from "./StubDefaultCompanyMappable";
import { LLPCheckDetailsFactory } from "../../../../src/controllers/certificates/check-details/LLPCheckDetailsFactory";

const CERTIFICATE_MODEL: CertificateItem = {
    id: "F00DFACE",
    companyName: "ACME LTD",
    companyNumber: "12345678",
    quantity: 1,
    itemCosts: [{
        itemCost: "10"
    }],
    itemOptions: {
        companyStatus: "active",
        certificateType: "incorporation-with-all-name-changes"
    } as ItemOptions
} as CertificateItem;

const EXPECTED_RESULT = {
    companyName: "ACME LTD",
    companyNumber: "12345678",
    certificateType: MAPPED_CERTIFICATE_TYPE,
    deliveryMethod: MAPPED_DELIVERY_METHOD,
    emailCopyRequired: MAPPED_EMAIL_COPY_REQUIRED,
    fee: MAPPED_FEE,
    changeIncludedOn: "/orderable/llp-certificates/F00DFACE/certificate-options",
    changeDeliveryDetails: "/orderable/llp-certificates/F00DFACE/delivery-details",
    deliveryDetails: MAPPED_DELIVERY_DETAILS,
    SERVICE_URL: "/company/12345678/orderable/llp-certificates",
    isNotDissolutionCertificateType: true,
    templateName: LLP_CERTIFICATE_CHECK_DETAILS,
    statementOfGoodStanding: MAPPED_OPTION_VALUE,
    currentDesignatedMembersNames: MAPPED_MEMBER_OPTIONS,
    currentMembersNames: MAPPED_MEMBER_OPTIONS,
    registeredOfficeAddress: MAPPED_ADDRESS_OPTION,
    liquidatorsDetails: MAPPED_OPTION_VALUE,
    administratorsDetails: MAPPED_OPTION_VALUE,
    quantity: 1,
    filterMappings: {
        statementOfGoodStanding: true,
        liquidators: false,
        administrators: false
    }
};

describe("LLPCheckDetailsFactory", () => {
    const checkDetailsFactory = new LLPCheckDetailsFactory(new StubDefaultCompanyMappable(), LLP_CERTIFICATE_CHECK_DETAILS);

    describe("Create view model", () => {
        it("Maps certificate item and basket details to view model", () => {
            // when
            const actual = checkDetailsFactory.createViewModel(CERTIFICATE_MODEL, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal(EXPECTED_RESULT);
        });

        it("Maps dissolved certificate item and basket details to view model", () => {
            // when
            const actual = checkDetailsFactory.createViewModel(
                {
                    ...CERTIFICATE_MODEL,
                    itemOptions: {
                        ...CERTIFICATE_MODEL.itemOptions,
                        certificateType: "dissolution"
                    }
                }, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal({
                ...EXPECTED_RESULT,
                isNotDissolutionCertificateType: false,
                SERVICE_URL: "/company/12345678/orderable/dissolved-certificates",
                changeDeliveryDetails: "/orderable/dissolved-certificates/F00DFACE/delivery-details"
            });
        });

        it("Maps certificate item for liquidated company and basket details to view model", () => {
            // given
            const certificateItem = {
                ...CERTIFICATE_MODEL,
                itemOptions: {
                    ...CERTIFICATE_MODEL.itemOptions,
                    companyStatus: "liquidation"
                }
            };

            // when
            const actual = checkDetailsFactory.createViewModel(certificateItem, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal({
                ...EXPECTED_RESULT,
                filterMappings: {
                    statementOfGoodStanding: false,
                    liquidators: true,
                    administrators: false
                }
            });
        });

        it("Maps certificate item for administrated company and basket details to view model", () => {
            // given
            const certificateItem = {
                ...CERTIFICATE_MODEL,
                itemOptions: {
                    ...CERTIFICATE_MODEL.itemOptions,
                    companyStatus: "administration"
                }
            };

            // when
            const actual = checkDetailsFactory.createViewModel(certificateItem, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal({
                ...EXPECTED_RESULT,
                filterMappings: {
                    statementOfGoodStanding: false,
                    liquidators: false,
                    administrators: true
                }
            });
        });
    });

    describe("getTemplate", () => {
        it("Returns the template assigned to the factory", () => {
            // when
            const actual = checkDetailsFactory.getTemplate();

            // then
            chai.expect(actual).to.equal(LLP_CERTIFICATE_CHECK_DETAILS);
        });
    });
});
