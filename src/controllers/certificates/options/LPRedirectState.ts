import { RedirectState } from "./RedirectState";
import { LPRedirectStateMachine } from "./LPRedirectStateMachine";

export interface LPRedirectState extends RedirectState {
}

export class NoOptionsPresentState implements LPRedirectState {
    private stateMachine: LPRedirectStateMachine;
    readonly redirect = "delivery-options";

    constructor (stateMachine: LPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }
}

export class PrincipalPlaceOfBusinessPresentState implements LPRedirectState {
    private stateMachine: LPRedirectStateMachine;
    readonly redirect = "principal-place-of-business-options";

    constructor (stateMachine: LPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        // do nothing
    }
}
