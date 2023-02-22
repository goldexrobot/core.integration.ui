/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ItemRejectionReason } from './ItemRejectionReason';

export type EvalHydroRejected = {
    acceptance: 'rejected';
    reason: ItemRejectionReason;
};
