const chai = require("chai")
import CertificateItemRequestFactory from "../../../../src/controllers/certificates/model/CertificateItemFactory";
import {CertificateType} from "../../../../src/controllers/certificates/model/CertificateType";
import {CompanyStatus} from "../../../../src/controllers/certificates/model/CompanyStatus";

describe("Certificate item factory tests", () => {
    it("Certificate type is set correctly based on active company status", () => {
        // Given
        const factory = new CertificateItemRequestFactory({
            companyNumber: "12345678",
            companyStatus: CompanyStatus.ACTIVE
        });

        // When
        const requestItem = factory.createInitialRequest();

        // Then
        chai.expect(requestItem).to.deep.equal({
            companyNumber: "12345678",
            itemOptions: {
                certificateType: CertificateType.INCORPORATION,
                deliveryMethod: "postal",
                deliveryTimescale: "standard"
            },
            quantity: 1
        });
    })

    it("Certificate type is set correctly based on dissolved company status", () => {
        // Given
        const certificateItemFactory = new CertificateItemRequestFactory({
            companyNumber: "12345678",
            companyStatus: CompanyStatus.DISSOLVED
        });

        // When
        const certificateItem = certificateItemFactory.createInitialRequest();

        // Then
        chai.expect(certificateItem).to.deep.equal({
            companyNumber: "12345678",
            itemOptions: {
                certificateType: CertificateType.DISSOLUTION,
                deliveryMethod: "postal",
                deliveryTimescale: "standard"
            },
            quantity: 1
        });
    })
})
