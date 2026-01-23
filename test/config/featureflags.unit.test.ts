import chai from "chai";
import { FEATURE_FLAGS } from "../../src/config/FeatureFlags";

describe("FeatureFlags", () => {
    let originalValue: boolean;

    beforeEach(() => {
        // snapshot the current value so tests are isolated and we can restore afterwards
        originalValue = FEATURE_FLAGS.configurableBannerEnabled;
    });

    afterEach(() => {
        // restore original value to avoid leaking state between tests
        FEATURE_FLAGS.configurableBannerEnabled = originalValue;
    });

    it("getter returns the current configurableBannerEnabled value", () => {
        FEATURE_FLAGS.configurableBannerEnabled = true;
        chai.expect(FEATURE_FLAGS.configurableBannerEnabled).to.equal(true);

        FEATURE_FLAGS.configurableBannerEnabled = false;
        chai.expect(FEATURE_FLAGS.configurableBannerEnabled).to.equal(false);
    });

    it("setter updates configurableBannerEnabled without affecting other flags", () => {
        const originalLp = FEATURE_FLAGS.lpCertificateOrdersEnabled;
        const originalLlp = FEATURE_FLAGS.llpCertificateOrdersEnabled;

        // toggle the configurable banner flag
        FEATURE_FLAGS.configurableBannerEnabled = !FEATURE_FLAGS.configurableBannerEnabled;

        // ensure only the configurable banner flag changed
        chai.expect(FEATURE_FLAGS.lpCertificateOrdersEnabled).to.equal(originalLp);
        chai.expect(FEATURE_FLAGS.llpCertificateOrdersEnabled).to.equal(originalLlp);
    });
});

