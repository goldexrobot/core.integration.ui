/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StorageCell } from './StorageCell';

export type EvalNewResult = {
    /**
     * Evaluation ID
     */
    eval_id: number;
    storage_cell: StorageCell;
};
