import {
    CertificateItem,
    CertificateItemPatchRequest, ItemOptionsRequest
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { OptionsViewModel } from "./OptionsViewModel";
import { SelectedOptions } from "./OptionsService";
import { OptionsPageRedirect } from "./OptionsPageRedirect";

export abstract class AbstractOptionsMapper {
    private optionRedirects: Map<string, OptionsPageRedirect>
    private defaultRedirect: OptionsPageRedirect;

    constructor (defaultRedirect: OptionsPageRedirect) {
        this.optionRedirects = new Map<string, OptionsPageRedirect>();
        this.defaultRedirect = defaultRedirect;
    }

    addRedirectForOption (option: string, redirect: OptionsPageRedirect) {
        this.optionRedirects.set(option, redirect);
    }

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

    createInitialItemOptions (companyStatus: string): ItemOptionsRequest {
        return {};
    }

    filterItemOptions (itemOptionsAccum: ItemOptionsRequest, option: string): ItemOptionsRequest {
        return {};
    }

    mapOptionsToRedirect (selectedOptions: SelectedOptions): OptionsPageRedirect {
        const options = this.mapSelectedOptionsToArray(selectedOptions);
        if (options.length > 0) {
            options.sort(this.optionPriorityComparator.bind(this));
            return this.optionRedirects.get(options[0]) || this.defaultRedirect;
        } else {
            return this.defaultRedirect;
        }
    }

    private mapSelectedOptionsToArray (selectedOptions: SelectedOptions): string[] {
        if (selectedOptions === undefined) {
            return [];
        } else if (typeof selectedOptions === "string") {
            return [selectedOptions];
        } else {
            return selectedOptions;
        }
    }

    private optionPriorityComparator (a: string, b: string): number {
        if (this.optionRedirects.has(a) && this.optionRedirects.has(b)) {
            return ((this.optionRedirects.get(a) || {}).priority || 0) -
                ((this.optionRedirects.get(b) || {}).priority || 0);
        } else if (this.optionRedirects.has(a)) {
            return -1;
        } else if (this.optionRedirects.has(b)) {
            return 1;
        } else {
            return 0;
        }
    }
}
