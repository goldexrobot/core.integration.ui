/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubEvalPhotoUploadEvent } from '../models/SubEvalPhotoUploadEvent';
import type { SubEvalPhotoUploadRequest } from '../models/SubEvalPhotoUploadRequest';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class SubscriptionBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Photo upload event
     * @returns SubEvalPhotoUploadEvent Event
     * @throws ApiError
     */
    public subEvalPhotoUploadEvent():Promise<ApiResponse<SubEvalPhotoUploadEvent>>{
        return this.httpRequest.request({
            method: 'GET',
            url: '/sub.eval_photo_upload',
        });
    }

    /**
     * Subscribe/unsubscribe to eval photo events
     * The API will send a notification when a photo is uploaded to the Goldex backend.
     * @param requestBody Params
     * @returns any Empty result
     * @throws ApiError
     */
    public subEvalPhotoUpload(
requestBody?: SubEvalPhotoUploadRequest,
):Promise<ApiResponse<any>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/sub.eval_photo_upload',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
