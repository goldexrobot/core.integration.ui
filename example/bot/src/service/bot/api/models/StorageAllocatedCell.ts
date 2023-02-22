/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StorageCell } from './StorageCell';
import type { StorageTag } from './StorageTag';

/**
 * Describes allocated storage cell
 */
export type StorageAllocatedCell = {
    cell: StorageCell;
    user_tag: StorageTag;
};
