import { OptionsService } from "../../../../src/controllers/certificates/options/OptionsService";
import { AbstractOptionsMapper } from "../../../../src/controllers/certificates/options/AbstractOptionsMapper";
import {
    OptionsViewModel,
    OptionsViewModelData
} from "../../../../src/controllers/certificates/options/OptionsViewModel";
import * as apiClient from "../../../../src/client/api.client";
import {
    CertificateItem,
    CertificateItemPatchRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OtherCompanyOptionsMapper } from "../../../../src/controllers/certificates/options/OtherCompanyOptionsMapper";
import { SinonStubbedInstance } from "sinon";
import { OptionsPageRedirect } from "../../../../src/controllers/certificates/options/OptionsPageRedirect";
import sessionHandler from "@companieshouse/node-session-handler"; // needed for side-effects

const chai = require("chai");
const sinon = require("sinon");
const sandbox = sinon.createSandbox();

describe("OptionsService", () => {
    let service: OptionsService;
    let mapperHandled: SinonStubbedInstance<OtherCompanyOptionsMapper>;
    let mapperUnhandled: SinonStubbedInstance<OtherCompanyOptionsMapper>;

    beforeEach(() => {
        mapperHandled = sandbox.createStubInstance(OtherCompanyOptionsMapper);
        mapperUnhandled = sandbox.createStubInstance(OtherCompanyOptionsMapper);
        service = new OptionsService(new Map<string, AbstractOptionsMapper>([["handled", mapperHandled as any]]), mapperUnhandled as any);
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("Fetches and maps a certificate for a handled company type to a view model", async () => {
        // given
        sandbox.stub(apiClient, "getCertificateItem").returns(Promise.resolve({
            itemOptions: {
                companyType: "handled"
            }
        } as CertificateItem));
        mapperHandled.mapItemToOptions.returns(new OptionsViewModel("handledTemplate", {} as OptionsViewModelData));

        // when
        const actual = await service.readCertificate("F00DFACE", "CAFE");

        // then
        chai.expect(actual).to.deep.equal(new OptionsViewModel("handledTemplate", {} as OptionsViewModelData));
    });

    it("Fetches and maps a certificate for an unhandled company type to a view model", async () => {
        // given
        mapperUnhandled.mapItemToOptions.returns(new OptionsViewModel("unhandledTemplate", {} as OptionsViewModelData));
        sandbox.stub(apiClient, "getCertificateItem").returns(Promise.resolve({
            itemOptions: {
                companyType: "unhandled"
            }
        } as CertificateItem));

        // when
        const actual = await service.readCertificate("F00DFACE", "CAFE");

        // then
        chai.expect(actual).to.deep.equal(new OptionsViewModel("unhandledTemplate", {} as OptionsViewModelData));
    });

    it("Updates a certificate item for a handled company type using provided options", async () => {
        // given
        mapperHandled.mapOptionsToUpdate.returns({} as CertificateItemPatchRequest);
        mapperHandled.mapOptionsToRedirect.returns(new OptionsPageRedirect("redirect", 1));
        sandbox.stub(apiClient, "getCertificateItem").returns(Promise.resolve({
            itemOptions: {
                companyType: "handled"
            }
        } as CertificateItem));
        sandbox.stub(apiClient, "patchCertificateItem");

        // when
        const actual = await service.updateCertificate("F00DFACE", "CAFE", ["option"]);

        // then
        chai.expect(actual).to.deep.equal(new OptionsPageRedirect("redirect", 1));
    });

    it("Updates a certificate item for an unhandled company type using provided options", async () => {
        // given
        mapperUnhandled.mapOptionsToUpdate.returns({} as CertificateItemPatchRequest);
        mapperUnhandled.mapOptionsToRedirect.returns(new OptionsPageRedirect("redirect", 1));
        sandbox.stub(apiClient, "getCertificateItem").returns(Promise.resolve({
            itemOptions: {
                companyType: "unhandled"
            }
        } as CertificateItem));
        sandbox.stub(apiClient, "patchCertificateItem");

        // when
        const actual = await service.updateCertificate("F00DFACE", "CAFE", ["option"]);

        // then
        chai.expect(actual).to.deep.equal(new OptionsPageRedirect("redirect", 1));
    });
});
