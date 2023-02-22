/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EvalHydroResult } from '../models/EvalHydroResult';
import type { EvalNewResult } from '../models/EvalNewResult';
import type { EvalSpectrumResult } from '../models/EvalSpectrumResult';
import type { EvalStoreRequest } from '../models/EvalStoreRequest';
import type { EvalStoreResult } from '../models/EvalStoreResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class EvalBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * (3) Hydrostatic evaluation
     * Continues the item evaluation (hydrostatic phase).
 *
 * If the item is **accepted**, it could be returned back to the customer with `eval.return`, or stored with `eval.store`.
 *
 * If the item is **rejected**, then `eval.return` should be called.
     * @param requestBody Empty params
     * @returns EvalHydroResult Result
     * @throws ApiError
     */
    public evalHydro(
requestBody?: any,
):Promise<ApiResponse<EvalHydroResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/eval.hydro',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                503: `Vibration affects the weighing process. Call \`eval.return\``,
                504: `Network is unavailable. Call \`eval.return\``,
            },
        });
    }

    /**
     * (1) Prepare evaluation
     * Prepares a new item evaluation.
 *
 * On success, returns evaluation ID and preliminary storage cell address. Then `inlet.open` should be called.
 *
 * On failure, the evaluation should be cancelled.
     * @param requestBody Empty params
     * @returns EvalNewResult Result
     * @throws ApiError
     */
    public evalNew(
requestBody?: any,
):Promise<ApiResponse<EvalNewResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/eval.new',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                503: `Hardware is not ready yet. Do nothing`,
                504: `Network is unavailable. Try again`,
                507: `Storage is out of space. Do nothing`,
            },
        });
    }

    /**
     * (4a) Return item
     * Starts a returning process of the item.
 *
 * On completion, the outlet window will be opened with the item inside.
 *
 * The customer should have enough time to take the item out of the window.
 *
 * Then `outlet.close` should be called to close the outlet window (we propose customer explicit action or a timeout).
     * @param requestBody Empty params
     * @returns any Empty result
     * @throws ApiError
     */
    public evalReturn(
requestBody?: any,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/eval.return',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * (2) Spectral evaluation
     * Starts the item evaluation (spectral phase).
 *
 * If the item is **accepted**, it could be returned back to the customer with `eval.return`, otherwise the evaluation should be continued with `eval.hydro`.
 *
 * If the item is **rejected**, then `eval.return` should be called.
     * @param requestBody Empty params
     * @returns EvalSpectrumResult Result
     * @throws ApiError
     */
    public evalSpectrum(
requestBody?: any,
):Promise<ApiResponse<EvalSpectrumResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/eval.spectrum',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                504: `Network is unavailable. Call \`eval.return\``,
            },
        });
    }

    /**
     * (4b) Store item
     * Requires hardware to carry the item to the machine storage.
 *
 * On completion, returns the storage cell address where the item is stored.
     * @param requestBody Params
     * @returns EvalStoreResult Result
     * @throws ApiError
     */
    public evalStore(
requestBody?: EvalStoreRequest,
):Promise<ApiResponse<EvalStoreResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/eval.store',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
