/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DispenserStep } from './DispenserStep';

export type ExtractRequest = {
    /**
     * List of the dispenser slots to push
     */
    steps: Array<DispenserStep>;
};
