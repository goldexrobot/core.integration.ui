/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CameraPhoto } from '../models/CameraPhoto';
import type { StatusResult } from '../models/StatusResult';

import { ApiResponse } from '../core/ApiResponse';import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ServiceBotService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Frontal camera photo
     * Takes a photo from a frontal camera and returns Base64-encoded JPEG bytes
     * @param requestBody Empty params
     * @returns CameraPhoto Result
     * @throws ApiError
     */
    public serviceFrontalPhoto(
requestBody?: any,
):Promise<ApiResponse<CameraPhoto>>{
        return this.httpRequest.request({
            method: 'POST',
            url: '/service.frontal_photo',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                504: `Camera is unavailable. Try again`,
            },
        });
    }

    /**
     * Out of service
     * Сall this method in case of emergency to switch the machine to the out of service mode.
 *
 * The machine will display a service page and the UI will be unloaded.
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
