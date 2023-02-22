/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HardwareListResult } from '../models/HardwareListResult';
import type { HardwareRequest } from '../models/HardwareRequest';
import type { HardwareResult } from '../models/HardwareResult';
import type { ProxyRequest } from '../models/ProxyRequest';
import type { ProxyResult } from '../models/ProxyResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class BusinessBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Call optional hardware method
     * @param requestBody Params
     * @returns HardwareResult Result
     * @throws ApiError
     */
    public optHardwareCall(
requestBody?: HardwareRequest,
):Promise<ApiResponse<HardwareResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/hardware.call',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                504: `Hardware is unavailable. Try again`,
            },
        });
    }

    /**
     * Get available optional hardware
     * @param requestBody Empty params
     * @returns HardwareListResult Result
     * @throws ApiError
     */
    public optHardwareList(
requestBody?: any,
):Promise<ApiResponse<HardwareListResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/hardware.list',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Call business backend
     * Requires Goldex backend to sign and send an HTTP POST request to the business backend.
 *
 * Endpoint name and address should be known at the Goldex side before the call made (see Goldex backend API).
     * @param requestBody Params
     * @returns ProxyResult Result
     * @throws ApiError
     */
    public proxyCall(
requestBody?: ProxyRequest,
):Promise<ApiResponse<ProxyResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/proxy',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                504: `Network is unavailable. Try again`,
            },
        });
    }

}
