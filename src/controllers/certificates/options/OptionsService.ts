import { OptionsViewModel } from "./OptionsViewModel";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { OptionsPageRedirect } from "./OptionsPageRedirect";

export type SelectedOptions = string | string[] | undefined;

export class OptionsService {
    private readonly typeMappers: Map<string, AbstractOptionsMapper>;
    private readonly defaultMapper: AbstractOptionsMapper;

    constructor (typeMappers: Map<string, AbstractOptionsMapper>, defaultMapper: AbstractOptionsMapper) {
        this.typeMappers = typeMappers;
        this.defaultMapper = defaultMapper;
    }

    public async readCertificate (token: string, id: string): Promise<OptionsViewModel> {
        const certificate = await getCertificateItem(token, id);
        return (this.typeMappers.get(certificate.itemOptions.companyType) || this.defaultMapper)
            .mapItemToOptions(certificate);
    }

    public async updateCertificate (token: string, id: string, options: SelectedOptions): Promise<OptionsPageRedirect> {
        const certificate = await getCertificateItem(token, id);
        const mapper = (this.typeMappers.get(certificate.itemOptions.companyType) || this.defaultMapper);
        const update = mapper.mapOptionsToUpdate(certificate.itemOptions.companyStatus, options);
        await patchCertificateItem(token, id, update);
        return mapper.mapOptionsToRedirect(options);
    }
}
