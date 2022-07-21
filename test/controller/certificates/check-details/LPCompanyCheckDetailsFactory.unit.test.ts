import chai from "chai";

import { CertificateItem, ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {
    LP_CERTIFICATE_CHECK_DETAILS, LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE
} from "../../../../src/model/template.paths";
import {
    MAPPED_ADDRESS_OPTION,
    MAPPED_CERTIFICATE_TYPE,
    MAPPED_DELIVERY_DETAILS,
    MAPPED_DELIVERY_METHOD,
    MAPPED_EMAIL_COPY_REQUIRED,
    MAPPED_FEE, MAPPED_MEMBER_OPTIONS,
    MAPPED_OPTION_VALUE,
    StubDefaultCompanyMappable
} from "./StubDefaultCompanyMappable";
import { LPCheckDetailsFactory } from "../../../../src/controllers/certificates/check-details/LPCompanyCheckDetailsFactory";
import sessionHandler from "@companieshouse/node-session-handler";
import { ViewModelVisitor } from "../../../../src/controllers/certificates/ViewModelVisitor"; // needed for side-effects

const CERTIFICATE_MODEL: CertificateItem = {
    id: "F00DFACE",
    companyName: "ACME LTD",
    companyNumber: "12345678",
    itemCosts: [{
        itemCost: "10"
    }],
    itemOptions: {
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
    changeIncludedOn: "/orderable/lp-certificates/F00DFACE/certificate-options",
    changeDeliveryDetails: "/orderable/lp-certificates/F00DFACE/delivery-details",
    deliveryDetails: MAPPED_DELIVERY_DETAILS,
    SERVICE_URL: "/company/12345678/orderable/lp-certificates",
    isNotDissolutionCertificateType: true,
    templateName: LP_CERTIFICATE_CHECK_DETAILS,
    statementOfGoodStanding: MAPPED_OPTION_VALUE,
    principalPlaceOfBusiness: MAPPED_ADDRESS_OPTION,
    generalPartners: MAPPED_OPTION_VALUE,
    limitedPartners: MAPPED_OPTION_VALUE,
    generalNatureOfBusiness: MAPPED_OPTION_VALUE
};

describe("LPCheckDetailsFactory", () => {
    const checkDetailsFactory = new LPCheckDetailsFactory(new StubDefaultCompanyMappable());

    describe("Create view model", () => {
        it("Maps certificate item and basket details to view model", () => {
            // when
            const actual = checkDetailsFactory.createViewModel(CERTIFICATE_MODEL, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal(EXPECTED_RESULT);
        });

        it("Maps certificate item and basket details to alternate view model if user enrolled", () => {
            // when
            const actual = checkDetailsFactory.createViewModel(CERTIFICATE_MODEL, { enrolled: true });

            // then
            chai.expect(actual).to.deep.equal({ ...EXPECTED_RESULT, templateName: LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE });
        });

        it("Maps dissolved certificate item and basket details to view model", () => {
            // when
            const actual = checkDetailsFactory.createViewModel(
                { ...CERTIFICATE_MODEL, itemOptions: { ...CERTIFICATE_MODEL.itemOptions, certificateType: "dissolution" } }, { enrolled: false });

            // then
            chai.expect(actual).to.deep.equal({
                ...EXPECTED_RESULT,
                isNotDissolutionCertificateType: false,
                SERVICE_URL: "/company/12345678/orderable/dissolved-certificates",
                changeDeliveryDetails: "/orderable/dissolved-certificates/F00DFACE/delivery-details"
            });
        });
    });

    describe("newViewModelVisitor", () => {
        it("Creates a visitor object used to decorate returned view model", () => {
            // when
            const actual = checkDetailsFactory.newViewModelVisitor();

            // then
            chai.expect(actual).to.deep.equal(new ViewModelVisitor(LP_CERTIFICATE_CHECK_DETAILS, LP_CERTIFICATE_CHECK_DETAILS_ALTERNATE));
        });
    });
});
