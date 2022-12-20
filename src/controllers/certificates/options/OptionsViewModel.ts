import { ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

export type OptionsViewModelData = {
    companyNumber: string
    itemOptions: ItemOptions
    templateName: string
    SERVICE_URL: string
    filterMappings?: {[key: string]: boolean}
    optionFilter?: (options: { value: string }[], filter: { [key: string]: boolean }) => { value: string }[]
    showBasketLink?: boolean
    basketWebUrl?: string
    basketItems?: number
    isSignedIn?: boolean
    userEmailAddress?: string,
    serviceName?: string
};

export class OptionsViewModel {
    private readonly _template: string;
    private readonly _data: OptionsViewModelData;

    constructor (template: string, data: OptionsViewModelData) {
        this._template = template;
        this._data = data;
    }

    get template (): string {
        return this._template;
    }

    get data (): OptionsViewModelData {
        return this._data;
    }
}
