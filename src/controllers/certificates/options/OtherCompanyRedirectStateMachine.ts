import {
    NoOptionsPresentState,
    DirectorDetailsPresentState,
    OtherCompanyRedirectState,
    RegisteredOfficePresentState, SecretaryDetailsPresentState
} from "./OtherCompanyRedirectState";
import { ResourceState } from "./OptionsService";
import { RedirectStateMachine } from "./RedirectStateMachine";

export class OtherCompanyRedirectStateMachine implements RedirectStateMachine {
    readonly addressPresentState = new RegisteredOfficePresentState(this);
    readonly directorDetailsPresentState = new DirectorDetailsPresentState(this);
    readonly secretaryDetailsPresentState = new SecretaryDetailsPresentState(this);
    readonly noOptionsPresentState = new NoOptionsPresentState(this);

    private _currentState: OtherCompanyRedirectState;
    private readonly _resourceState: ResourceState;

    constructor (resourceState: ResourceState) {
        this._currentState = this.noOptionsPresentState;
        this._resourceState = resourceState;
    }

    redirectAddressDetails (): void {
        this._currentState.redirectAddressDetails();
    }

    redirectDirectorDetails (): void {
        this._currentState.redirectDirectorDetails();
    }

    redirectSecretaryDetails (): void {
        this._currentState.redirectSecretaryDetails();
    }

    getRedirect (): string {
        return this._currentState.redirect;
    }

    set currentState (currentState: OtherCompanyRedirectState) {
        this._currentState = currentState;
    }

    get resourceState (): ResourceState {
        return this._resourceState;
    }
}
