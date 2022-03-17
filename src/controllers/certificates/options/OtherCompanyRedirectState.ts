import { RedirectState } from "./RedirectState";
import { OtherCompanyRedirectStateMachine } from "./OtherCompanyRedirectStateMachine";

export interface OtherCompanyRedirectState extends RedirectState {
    redirectDirectorDetails(): void;
    redirectSecretaryDetails(): void;
}

export class NoOptionsPresentState implements OtherCompanyRedirectState {
    private stateMachine: OtherCompanyRedirectStateMachine;
    readonly redirect = "delivery-details";

    constructor (stateMachine: OtherCompanyRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDirectorDetails (): void {
        this.stateMachine.currentState = this.stateMachine.directorDetailsPresentState;
    }

    redirectSecretaryDetails (): void {
        this.stateMachine.currentState = this.stateMachine.secretaryDetailsPresentState;
    }
}

export class RegisteredOfficePresentState implements OtherCompanyRedirectState {
    private stateMachine: OtherCompanyRedirectStateMachine;
    readonly redirect = "registered-office-options";

    constructor (stateMachine: OtherCompanyRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        // do nothing
    }

    redirectDirectorDetails (): void {
        // do nothing
    }

    redirectSecretaryDetails (): void {
        // do nothing
    }
}

export class DirectorDetailsPresentState implements OtherCompanyRedirectState {
    private stateMachine: OtherCompanyRedirectStateMachine;
    readonly redirect = "director-options";

    constructor (stateMachine: OtherCompanyRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDirectorDetails (): void {
        // do nothing
    }

    redirectSecretaryDetails (): void {
        // do nothing
    }
}

export class SecretaryDetailsPresentState implements OtherCompanyRedirectState {
    private stateMachine: OtherCompanyRedirectStateMachine;
    readonly redirect = "secretary-options";

    constructor (stateMachine: OtherCompanyRedirectStateMachine) {
        this.stateMachine = stateMachine;
    }

    redirectAddressDetails (): void {
        this.stateMachine.currentState = this.stateMachine.addressPresentState;
    }

    redirectDirectorDetails (): void {
        this.stateMachine.currentState = this.stateMachine.directorDetailsPresentState;
    }

    redirectSecretaryDetails (): void {
        // do nothing
    }
}
