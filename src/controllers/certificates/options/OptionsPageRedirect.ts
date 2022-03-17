export class OptionsPageRedirect {
    private readonly _redirect: string;

    constructor (redirect: string) {
        this._redirect = redirect;
    }

    get redirect (): string {
        return this._redirect;
    }
}
