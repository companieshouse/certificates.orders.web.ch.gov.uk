import { StaticRedirectCallback } from "../../../src/controllers/certificates/StaticRedirectCallback";
import { expect } from "chai";
import { createSandbox } from "sinon";
import { mockDeliveryDetails as deliveryDetails } from "../../__mocks__/certificates.mocks";

describe("StaticRedirectCallback", () => {

    const sandbox = createSandbox();

    describe("redirectEnrolled", () => {
        it("Redirects user agent to the basket page if predicate evaluates to true", () => {
            // given
            const callback = new StaticRedirectCallback(() => true);
            const mockResponse = sandbox.spy({
                redirect: (path: string) => {}
            });
            // when
            callback.redirectEnrolled({
                response: mockResponse,
                items: [{}],
                deliveryDetails: deliveryDetails
            } as any);

            // then
            expect(mockResponse.redirect).to.be.calledOnceWith("/basket");
        });

        it("Redirects user agent to the delivery details page if predicate evaluates to false", () => {
            // given
            const callback = new StaticRedirectCallback(() => false);
            const mockResponse = sandbox.spy({
                redirect: (path: string) => {}
            });
            // when
            callback.redirectEnrolled({
                response: mockResponse,
                items: [{}]
            } as any);

            // then
            expect(mockResponse.redirect).to.be.calledOnceWith("/delivery-details");
        });
    });
});
