export class OptionsPageRedirect {
    private readonly _redirect: string;
    private readonly _priority: number | undefined;

    constructor (redirect: string, priority?: number) {
        this._redirect = redirect;
        this._priority = priority;
    }

    get redirect (): string {
        return this._redirect;
    }

    get priority (): number | undefined {
        return this._priority;
    }
}
