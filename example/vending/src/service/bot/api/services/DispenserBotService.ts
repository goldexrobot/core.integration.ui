/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtractRequest } from '../models/ExtractRequest';
import type { SlotsResult } from '../models/SlotsResult';

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
requestBody?: ExtractRequest,
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
     * @returns SlotsResult Result
     * @throws ApiError
     */
    public dispenserSlots(
requestBody?: any,
):Promise<ApiResponse<SlotsResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/dispenser.slots',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
