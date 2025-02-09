/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DispenserExtractionStep } from './DispenserExtractionStep';

export type DispenserExtractRequest = {
    /**
     * List of the dispenser slots to push
     */
    steps: Array<DispenserExtractionStep>;
};
