/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StorageAllocatedCell } from './StorageAllocatedCell';

export type StorageStateResult = {
    /**
     * Allocated storage cells
     */
    allocated: Array<StorageAllocatedCell>;
    /**
     * Number of free storage cells
     */
    free: number;
};
