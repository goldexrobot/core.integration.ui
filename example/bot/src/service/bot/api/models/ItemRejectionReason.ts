/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Reason why the item is rejected by the Goldex
 */
export enum ItemRejectionReason {
    UNDESCRIBED = 'undescribed',
    LOW_SPECTRUM = 'low_spectrum',
    LOW_WEIGHT = 'low_weight',
    HIGH_WEIGHT = 'high_weight',
    UNCONFIRMED = 'unconfirmed',
}
