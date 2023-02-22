/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class WindowBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Close inlet window
     * Requires hardware to close the inlet window.
 *
 * On completion, the `eval.spectrum` should be called to start prepared evaluation.
     * @param requestBody Empty params
     * @returns any Empty result
     * @throws ApiError
     */
    public inletClose(
requestBody?: any,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/inlet.close',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                503: `Window is obstructed. Try one more time.`,
            },
        });
    }

    /**
     * Open inlet window
     * Requires hardware to open the inlet window.
 *
 * When ready, the customer should initiate the window closure with `inlet.close`.
     * @param requestBody Empty params
     * @returns any Empty result
     * @throws ApiError
     */
    public inletOpen(
requestBody?: any,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/inlet.open',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Close outlet window
     * Requires hardware to close the outlet window.
 *
 * A call to the `eval.return` or `storage.extract` automatically opens outlet window with the item inside.
 *
 * The customer should have enough time to take the item out of the window.
 *
 * Then this method should be called to close the outlet window (we propose customer explicit action or a timeout).
     * @param requestBody Empty params
     * @returns any Empty result
     * @throws ApiError
     */
    public outletClose(
requestBody?: any,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/outlet.close',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                503: `Window is obstructed. Try one more time.`,
            },
        });
    }

}
