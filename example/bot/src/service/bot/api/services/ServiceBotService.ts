/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatusResult } from '../models/StatusResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ServiceBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Kill the UI
     * Force the machine to show out of service page.
 *
 * Current UI will be unloaded.
     * @param requestBody Empty params
     * @returns any Empty result
     * @throws ApiError
     */
    public serviceKill(
requestBody?: any,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/service.kill',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Machine status
     * Reports current online status and machine features
     * @param requestBody Empty params
     * @returns StatusResult Result
     * @throws ApiError
     */
    public serviceStatus(
requestBody?: any,
):Promise<ApiResponse<StatusResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/service.status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
