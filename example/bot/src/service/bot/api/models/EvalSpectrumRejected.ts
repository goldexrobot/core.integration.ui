/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ItemRejectionReason } from './ItemRejectionReason';

/**
 * Item is rejected
 */
export type EvalSpectrumRejected = {
    acceptance: 'rejected';
    /**
     * Optional reason code as defined in evaluation rule
     */
    code: string;
    reason: ItemRejectionReason;
};
