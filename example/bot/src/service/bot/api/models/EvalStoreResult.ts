/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StorageCell } from './StorageCell';

export type EvalStoreResult = {
    cell: StorageCell;
    /**
     * In case of hardware failure this flag is set. You should complete current customer session and call `service.kill` method.
 *
 * At this point any calls to the API methods are forbidden (except `hardware.*`).
 *
 * The purpose of this workaround is to protect the hardware from a damage, while still allowing the business logic to remain intact.
 *
 * On a failure, there is no guarantee that the item has been moved, but the business flow must complete for sake of data consistency.
 *
 * One way or another, the item will be moved by technical support team.
     */
    hardware_failed: boolean;
};
