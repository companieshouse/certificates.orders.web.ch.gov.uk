export const enum BasketLimitState {
    BELOW_LIMIT = "below-limit",
    DISPLAY_LIMIT_WARNING = "display-limit-warning",
    DISPLAY_LIMIT_ERROR = "display-limit-error"
}

export interface BasketLimit {
    basketLimit: number,
    basketLimitState: BasketLimitState
}
