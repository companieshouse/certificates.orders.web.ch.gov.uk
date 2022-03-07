import { DirectorOrSecretaryDetails } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { DefaultCertificateMappable } from "./DefaultCertificateMappable";

export interface DefaultCompanyMappable extends DefaultCertificateMappable {
    mapDirectorOptions (directorOptions?: DirectorOrSecretaryDetails): string
    mapSecretaryOptions (secretaryOptions?: DirectorOrSecretaryDetails): string
}
