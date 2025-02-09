/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DispenserSlot } from './DispenserSlot';

/**
 * Which slot and how many times to push
 */
export type DispenserExtractionStep = {
    slot: DispenserSlot;
    times: number;
};
