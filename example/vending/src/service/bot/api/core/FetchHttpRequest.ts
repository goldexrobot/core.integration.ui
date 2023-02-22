import type { ApiRequestOptions } from './ApiRequestOptions';
import { ApiResponse } from './ApiResponse';
import { BaseHttpRequest } from './BaseHttpRequest';
import type { OpenAPIConfig } from './OpenAPI';
import { request as __request } from './request';

export class FetchHttpRequest extends BaseHttpRequest {

    constructor(config: OpenAPIConfig) {
        super(config);
    }

    /**
     * Request method
     * @param options The request options from the service
     * @returns CancelablePromise<T>
     * @throws ApiError
     */
    public override request<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
        return __request<T>(this.config, options);
    }
}
