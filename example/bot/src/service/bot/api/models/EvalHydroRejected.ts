/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ItemRejectionReason } from './ItemRejectionReason';

export type EvalHydroRejected = {
    acceptance: 'rejected';
    /**
     * Optional reason code as defined in evaluation rule
     */
    code: string;
    reason: ItemRejectionReason;
};
