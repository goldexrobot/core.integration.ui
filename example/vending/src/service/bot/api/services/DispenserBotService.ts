/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DispenserExtractRequest } from '../models/DispenserExtractRequest';
import type { DispenserSlotsResult } from '../models/DispenserSlotsResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DispenserBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Dispense items
     * @param requestBody Params
     * @returns any Empty result
     * @throws ApiError
     */
    public dispenserExtract(
requestBody?: DispenserExtractRequest,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/dispenser.extract',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get dispenser slots state
     * @param requestBody Empty params
     * @returns DispenserSlotsResult Result
     * @throws ApiError
     */
    public dispenserSlots(
requestBody?: any,
):Promise<ApiResponse<DispenserSlotsResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/dispenser.slots',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
