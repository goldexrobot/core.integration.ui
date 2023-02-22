/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Describes the machine features
 */
export type StatusResultFeatures = {
    /**
     * Machine has coin/bar dispenser hardware (for shop business flow)
     */
    has_dispenser: boolean;
    /**
     * Machine storage supports items extraction (for shop or pawnshop business flow)
     */
    storage_can_extract: boolean;
};
