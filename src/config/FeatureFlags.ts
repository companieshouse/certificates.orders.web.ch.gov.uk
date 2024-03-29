import {
    ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED,
    DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED,
    DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED,
    LIQUIDATED_COMPANY_CERTIFICATES_ENABLED
} from "./config";

export class FeatureFlags {
    constructor (private _lpCertificateOrdersEnabled: boolean, private _llpCertificateOrdersEnabled: boolean,
        private _liquidatedCompanyCertificateEnabled: boolean, private _administrationCompanyCertificateEnabled: boolean) {
    }

    get lpCertificateOrdersEnabled (): boolean {
        return this._lpCertificateOrdersEnabled;
    }

    set lpCertificateOrdersEnabled (value: boolean) {
        this._lpCertificateOrdersEnabled = value;
    }

    get llpCertificateOrdersEnabled (): boolean {
        return this._llpCertificateOrdersEnabled;
    }

    set llpCertificateOrdersEnabled (value: boolean) {
        this._llpCertificateOrdersEnabled = value;
    }

    get liquidatedCompanyCertificateEnabled (): boolean {
        return this._liquidatedCompanyCertificateEnabled;
    }

    set liquidatedCompanyCertificateEnabled (value: boolean) {
        this._liquidatedCompanyCertificateEnabled = value;
    }

    get administrationCompanyCertificateEnabled (): boolean {
        return this._administrationCompanyCertificateEnabled;
    }

    set administrationCompanyCertificateEnabled (value: boolean) {
        this._administrationCompanyCertificateEnabled = value;
    }
}

export const FEATURE_FLAGS = new FeatureFlags(DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED, DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED, LIQUIDATED_COMPANY_CERTIFICATES_ENABLED, ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED);
