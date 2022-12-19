import sinon from "sinon";
import { signedInSessionData, SIGNED_IN_COOKIE } from "../__mocks__/redis.mocks";
import chai from "chai";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import { mapPageHeader } from "../../src/utils/page.header.utils"
import { PageHeader } from "../../src/model/PageHeader";
import {
    SERVICE_NAME_CERTIFICATES,
    SERVICE_NAME_CERTIFIED_COPIES,
    SERVICE_NAME_MISSING_IMAGE_DELIVERY,
} from "../../src/config/config";

const certificatesPath: string = "/certificates";
const dissolvedCertificatesPath: string = "/dissolved-certificates";
const lpCertificatesPath: string = "/lp-certificates";
const llpCertificatesPath: string = "/llp-certificates";
const certifiedCopiesPath: string = "/certified-copies";
const midPath: string = "/missing-image-deliveriess";
const testEmailAddress: string = "test@testemail.com";

describe("mapPageHeader", () => {
    it("tests the header for a certificates journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(certificatesPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_CERTIFICATES);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a dissolved certificates journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(dissolvedCertificatesPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_CERTIFICATES);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a lp certificates journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(lpCertificatesPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_CERTIFICATES);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a llp certificates journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(llpCertificatesPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_CERTIFICATES);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a certified copies journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(certifiedCopiesPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_CERTIFIED_COPIES);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a mid journey is mapped correctly", async () => {
        const mockRequest = generateMockRequest(midPath, 1);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_MISSING_IMAGE_DELIVERY);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(true);
        chai.expect(returnedPageHeader.userEmailAddress).to.equal(testEmailAddress);
    });

    it("tests the header for a mid journey is mapped correctly with a user not signed in", async () => {
        const mockRequest = generateMockRequest(midPath, 0);

        const returnedPageHeader: PageHeader = mapPageHeader(mockRequest);
        chai.expect(returnedPageHeader.serviceName).to.equal(SERVICE_NAME_MISSING_IMAGE_DELIVERY);
        chai.expect(returnedPageHeader.isSignedIn).to.equal(false);
    });
});

const generateMockRequest = (path: string, isSignedIn: number):Request => {
    const mockRequest = {
        path: path
    } as Request
    mockRequest.session = new Session(
        {
            signin_info: {
                user_profile: {
                    email: testEmailAddress
                },
                signed_in: isSignedIn
            }
        }
    );
    return mockRequest;
};