const certRoot = "certificates";
const lpCertRoot = "certificates/lp-certificates";
const llpCertRoot = "certificates/llp-certificates";
const certifiedCopyRoot = "certified-copies";
const missingImageDeliveryRoot = "missing-image-deliveries";
const errorRoot = "error-pages";

export const GOOD_STANDING: string = "good-standing";
export const COLLECTION: string = "collection";
export const DELIVERY_DETAILS: string = "delivery-details";

export const YOU_CANNOT_USE_THIS_SERVICE: string = `${errorRoot}/you-cannot-use-this-service`;

export const CERTIFICATE_INDEX: string = `${certRoot}/index`;
export const CERTIFICATE_OPTIONS: string = `${certRoot}/options`;
export const CERTIFICATE_CHECK_DETAILS: string = `${certRoot}/check-details`;
export const CERTIFICATE_ORDER_DETAILS: string = `${certRoot}/order-details`;
export const CERTIFICATE_REGISTERED_OFFICE_OPTIONS: string = `${certRoot}/registered-office-options`;
export const CERTIFICATE_DIRECTOR_OPTIONS: string = `${certRoot}/director-options`;
export const CERTIFICATE_SECRETARY_OPTIONS: string = `${certRoot}/secretary-options`;

export const LP_CERTIFICATE_INDEX: string = `${lpCertRoot}/index`;
export const LP_CERTIFICATE_OPTIONS: string = `${lpCertRoot}/options`;
export const LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS: string = `${certRoot}/principle-place-of-business-options`;

export const LLP_CERTIFICATE_INDEX: string = `${llpCertRoot}/index`;
export const LLP_CERTIFICATE_OPTIONS: string = `${llpCertRoot}/options`;

export const CERTIFIED_COPY_INDEX: string = `${certifiedCopyRoot}/index`;
export const CERTIFIED_COPY_CHECK_DETAILS: string = `${certifiedCopyRoot}/check-details`;
export const CERTIFIED_COPY_ORDER_DETAILS: string = `${certifiedCopyRoot}/order-details`;

export const MISSING_IMAGE_DELIVERY_INDEX: string = `${missingImageDeliveryRoot}/index`;
export const MISSING_IMAGE_DELIVERY_CHECK_DETAILS: string = `${missingImageDeliveryRoot}/check-details`;
