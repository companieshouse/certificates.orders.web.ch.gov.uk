import { ResourceState } from "./OptionsService";
import { RedirectStateMachine } from "./RedirectStateMachine";
import {
    DesignatedMemberDetailsPresentState,
    LLPRedirectState, MemberDetailsPresentState, NoOptionsPresentState,
    RegisteredOfficePresentState
} from "./LLPRedirectState";

export class LLPRedirectStateMachine implements RedirectStateMachine {
    readonly addressPresentState = new RegisteredOfficePresentState(this);
    readonly designatedMemberDetailsPresentState = new DesignatedMemberDetailsPresentState(this);
    readonly memberDetailsPresentState = new MemberDetailsPresentState(this);
    readonly noOptionsPresentState = new NoOptionsPresentState(this);

    private _currentState: LLPRedirectState;
    private readonly _resourceState: ResourceState;

    constructor (resourceState: ResourceState) {
        this._currentState = this.noOptionsPresentState;
        this._resourceState = resourceState;
    }

    redirectAddressDetails (): void {
        this._currentState.redirectAddressDetails();
    }

    redirectDesignatedMemberDetails (): void {
        this._currentState.redirectDesignatedMemberDetails();
    }

    redirectMemberDetails (): void {
        this._currentState.redirectMemberDetails();
    }

    getRedirect (): string {
        return this._currentState.redirect;
    }

    set currentState (currentState: LLPRedirectState) {
        this._currentState = currentState;
    }

    get resourceState (): ResourceState {
        return this._resourceState;
    }
}
