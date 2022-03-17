import { ResourceState } from "./OptionsService";
import { RedirectStateMachine } from "./RedirectStateMachine";
import {
    LPRedirectState,
    NoOptionsPresentState,
    PrincipalPlaceOfBusinessPresentState
} from "./LPRedirectState";

export class LPRedirectStateMachine implements RedirectStateMachine {
    readonly addressPresentState = new PrincipalPlaceOfBusinessPresentState(this);
    readonly noOptionsPresentState = new NoOptionsPresentState(this);

    private _currentState: LPRedirectState;
    private readonly _resourceState: ResourceState;

    constructor (resourceState: ResourceState) {
        this._currentState = this.noOptionsPresentState;
        this._resourceState = resourceState;
    }

    redirectAddressDetails (): void {
        this._currentState.redirectAddressDetails();
    }

    getRedirect (): string {
        return this._currentState.redirect;
    }

    set currentState (currentState: LPRedirectState) {
        this._currentState = currentState;
    }

    get resourceState (): ResourceState {
        return this._resourceState;
    }
}
