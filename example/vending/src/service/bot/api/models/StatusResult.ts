/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type StatusResult = {
    bot_id: number;
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
