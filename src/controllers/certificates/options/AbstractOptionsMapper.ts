import {
    CertificateItem,
    CertificateItemPatchRequest,
    ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { ResourceState, SelectedOptions } from "./OptionsService";
import { OptionsPageRedirect } from "./OptionsPageRedirect";
import { RedirectStateMachine } from "./RedirectStateMachine";

export abstract class AbstractOptionsMapper<T extends RedirectStateMachine> {
    abstract mapItemToOptions (item: CertificateItem): OptionsViewModel;

    mapOptionsToUpdate (companyStatus: string, selectedOptions: SelectedOptions): CertificateItemPatchRequest {
        const initialItemOptions: ItemOptionsRequest = this.createInitialItemOptions(companyStatus);
        const result: CertificateItemPatchRequest = {
            itemOptions: initialItemOptions,
            quantity: 1
        };
        const options = this.mapSelectedOptionsToArray(selectedOptions);
        options.reduce((itemOptionsAccum: ItemOptionsRequest, option: string) =>
            this.filterItemOptions(itemOptionsAccum, option), initialItemOptions);
        return result;
    }

    abstract createInitialItemOptions (companyStatus: string): ItemOptionsRequest;

    abstract filterItemOptions (itemOptionsAccum: ItemOptionsRequest, option: string): ItemOptionsRequest;

    getRedirect (selectedOptions: SelectedOptions, resourceState: ResourceState): OptionsPageRedirect {
        const options = this.mapSelectedOptionsToArray(selectedOptions);
        const stateMachine = this.getStateMachine(resourceState);
        for (const option of options) {
            this.handleOption(option, stateMachine);
        }
        return new OptionsPageRedirect(stateMachine.getRedirect());
    }

    abstract getStateMachine (resourceState: ResourceState): T;

    abstract handleOption (option: string, redirectStateMachine: T): void;

    mapSelectedOptionsToArray (selectedOptions: SelectedOptions): string[] {
        if (selectedOptions === undefined) {
            return [];
        } else if (typeof selectedOptions === "string") {
            return [selectedOptions];
        } else {
            return selectedOptions;
        }
    }
}
