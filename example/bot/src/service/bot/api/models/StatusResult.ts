/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { StatusResultFeatures } from './StatusResultFeatures';

export type StatusResult = {
    bot_id: number;
    features: StatusResultFeatures;
    /**
     * Online status
     */
    online: boolean;
    /**
     * Power line status
     */
    power: boolean;
    project_id: number;
    /**
     * Machine serial number
     */
    serial: string;
};
