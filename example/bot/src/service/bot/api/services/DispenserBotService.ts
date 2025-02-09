/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DispenserExtractRequest } from '../models/DispenserExtractRequest';
import type { DispenserExtractResult } from '../models/DispenserExtractResult';
import type { DispenserSlotsResult } from '../models/DispenserSlotsResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class DispenserBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Dispense items
     * Requires hardware to extract items from the dispenser and bring them to the outlet window.
 *
 * On completion, the outlet window will be opened with items inside.
 *
 * The customer should have enough time to take items out of the window.
 *
 * Then `outlet.close` should be called to close the outlet window (we propose customer explicit action or a timeout).
     * @param requestBody Params
     * @returns DispenserExtractResult Result
     * @throws ApiError
     */
    public dispenserExtract(
requestBody?: DispenserExtractRequest,
):Promise<ApiResponse<DispenserExtractResult>>{
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
