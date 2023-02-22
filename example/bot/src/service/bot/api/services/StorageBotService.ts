/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StorageAllocatedCell } from '../models/StorageAllocatedCell';
import type { StorageExtractRequest } from '../models/StorageExtractRequest';
import type { StorageExtractResult } from '../models/StorageExtractResult';
import type { StorageStateResult } from '../models/StorageStateResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class StorageBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Extract item from storage
     * Requires hardware to extract an item from the specified storage cell address and bring it to the outlet window.
 *
 * On completion, the outlet window will be opened with the item inside, and the requested storage cell address will be returned.
 *
 * The customer should have enough time to take the item out of the window.
 *
 * Then `outlet.close` should be called to close the outlet window (we propose customer explicit action or a timeout).
     * @param requestBody Params
     * @returns StorageExtractResult Result
     * @throws ApiError
     */
    public storageExtract(
requestBody?: StorageExtractRequest,
):Promise<ApiResponse<StorageExtractResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/storage.extract',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Storage state
     * Reports machine storage state: allocated and free cell addresses
     * @param requestBody Empty params
     * @returns StorageStateResult Result
     * @throws ApiError
     */
    public storageState(
requestBody?: any,
):Promise<ApiResponse<StorageStateResult>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/storage.state',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Set user tag for an allocated slot
     * @param requestBody Params
     * @returns any Empty result
     * @throws ApiError
     */
    public storageTag(
requestBody?: StorageAllocatedCell,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/storage.tag',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
