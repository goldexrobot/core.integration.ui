/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProxyRequest } from '../models/ProxyRequest';
import type { ProxyResult } from '../models/ProxyResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class BusinessBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

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
