import { OptionsController } from "./OptionsController";
import { OptionsService } from "./OptionsService";
import { AbstractOptionsMapper } from "./AbstractOptionsMapper";
import { CompanyType } from "../../../model/CompanyType";
import { LLPOptionsMapper } from "./LLPOptionsMapper";
import { OptionsPageRedirect } from "./OptionsPageRedirect";
import { OptionSelection } from "./OptionSelection";
import { LPOptionsMapper } from "./LPOptionsMapper";
import { OtherCompanyOptionsMapper } from "./OtherCompanyOptionsMapper";

const DELIVERY_DETAILS_REDIRECT = new OptionsPageRedirect("delivery-details");
const REGISTERED_OFFICE_REDIRECT = new OptionsPageRedirect("registered-office-options", 1);
const PRINCIPAL_PLACE_OF_BUSINESS_REDIRECT = new OptionsPageRedirect("principal-place-of-business-options", 1);
const DIRECTORS_REDIRECT = new OptionsPageRedirect("director-options", 2);
const DESIGNATED_MEMBER_REDIRECT = new OptionsPageRedirect("designated-members-options", 2);
const SECRETARY_REDIRECT = new OptionsPageRedirect("secretary-options", 3);
const MEMBER_REDIRECT = new OptionsPageRedirect("members-options", 3);

export class OptionsControllerConfiguration {
    private static INSTANCE: OptionsController;

    public static optionsControllerInstance () {
        if (OptionsControllerConfiguration.INSTANCE == null) {
            OptionsControllerConfiguration.INSTANCE = new OptionsController(
                new OptionsService(new Map<string, AbstractOptionsMapper>([
                    [CompanyType.LIMITED_LIABILITY_PARTNERSHIP, OptionsControllerConfiguration.llpMapper()],
                    [CompanyType.LIMITED_PARTNERSHIP, OptionsControllerConfiguration.lpMapper()]
                ]), OptionsControllerConfiguration.otherCompanyTypeMapper())
            );
        }
        return OptionsControllerConfiguration.INSTANCE;
    }

    private static otherCompanyTypeMapper (): AbstractOptionsMapper {
        const defaultMapper = new OtherCompanyOptionsMapper(DELIVERY_DETAILS_REDIRECT);
        defaultMapper.addRedirectForOption(OptionSelection.REGISTERED_OFFICE_ADDRESS, REGISTERED_OFFICE_REDIRECT);
        defaultMapper.addRedirectForOption(OptionSelection.DIRECTORS, DIRECTORS_REDIRECT);
        defaultMapper.addRedirectForOption(OptionSelection.SECRETARIES, SECRETARY_REDIRECT);
        return defaultMapper;
    }

    private static llpMapper (): AbstractOptionsMapper {
        const llpMapper = new LLPOptionsMapper(DELIVERY_DETAILS_REDIRECT);
        llpMapper.addRedirectForOption(OptionSelection.REGISTERED_OFFICE_ADDRESS, REGISTERED_OFFICE_REDIRECT);
        llpMapper.addRedirectForOption(OptionSelection.DESIGNATED_MEMBERS, DESIGNATED_MEMBER_REDIRECT);
        llpMapper.addRedirectForOption(OptionSelection.MEMBERS, MEMBER_REDIRECT);
        return llpMapper;
    }

    private static lpMapper (): AbstractOptionsMapper {
        const lpMapper = new LPOptionsMapper(DELIVERY_DETAILS_REDIRECT);
        lpMapper.addRedirectForOption(OptionSelection.PRINCIPAL_PLACE_OF_BUSINESS, PRINCIPAL_PLACE_OF_BUSINESS_REDIRECT);
        return lpMapper;
    }
}
