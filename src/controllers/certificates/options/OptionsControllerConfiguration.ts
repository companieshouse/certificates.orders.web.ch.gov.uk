import { OptionsController } from "./OptionsController";
import { OptionsService } from "./OptionsService";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { CompanyType } from "../../../model/CompanyType";
import { LLPOptionsMapper } from "./LLPOptionsMapper";
import { LPOptionsMapper } from "./LPOptionsMapper";
import { OtherCompanyOptionsMapper } from "./OtherCompanyOptionsMapper";

export class OptionsControllerConfiguration {
    private static INSTANCE: OptionsController;

    public static optionsControllerInstance () {
        if (OptionsControllerConfiguration.INSTANCE == null) {
            OptionsControllerConfiguration.INSTANCE = new OptionsController(
                new OptionsService(new Map<string, AbstractOptionsMapper<any>>([
                    [CompanyType.LIMITED_LIABILITY_PARTNERSHIP, new LLPOptionsMapper()],
                    [CompanyType.LIMITED_PARTNERSHIP, new LPOptionsMapper()]
                ]), new OtherCompanyOptionsMapper())
            );
        }
        return OptionsControllerConfiguration.INSTANCE;
    }
}
