import { RedirectState } from "./RedirectState";
import { LLPRedirectStateMachine } from "./LLPRedirectStateMachine";

export interface LLPRedirectState extends RedirectState {
    redirectDesignatedMemberDetails(): void;
    redirectMemberDetails(): void;
}

export class NoOptionsPresentState implements LLPRedirectState {
    private stateMachine: LLPRedirectStateMachine;
    readonly redirect = "delivery-details";

    constructor (stateMachine: LLPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDesignatedMemberDetails (): void {
        this.stateMachine.currentState = this.stateMachine.designatedMemberDetailsPresentState;
    }

    redirectMemberDetails (): void {
        this.stateMachine.currentState = this.stateMachine.memberDetailsPresentState;
    }
}

export class RegisteredOfficePresentState implements LLPRedirectState {
    private stateMachine: LLPRedirectStateMachine;
    readonly redirect = "registered-office-options";

    constructor (stateMachine: LLPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        // do nothing
    }

    redirectDesignatedMemberDetails (): void {
        // do nothing
    }

    redirectMemberDetails (): void {
        // do nothing
    }
}

export class DesignatedMemberDetailsPresentState implements LLPRedirectState {
    private stateMachine: LLPRedirectStateMachine;
    readonly redirect = "designated-members-options";

    constructor (stateMachine: LLPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDesignatedMemberDetails (): void {
        // do nothing
    }

    redirectMemberDetails (): void {
        // do nothing
    }
}

export class MemberDetailsPresentState implements LLPRedirectState {
    private stateMachine: LLPRedirectStateMachine;
    readonly redirect = "members-options";

    constructor (stateMachine: LLPRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDesignatedMemberDetails (): void {
        this.stateMachine.currentState = this.stateMachine.designatedMemberDetailsPresentState;
    }

    redirectMemberDetails (): void {
        // do nothing
    }
}
