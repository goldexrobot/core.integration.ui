import type { ApiRequestOptions } from './ApiRequestOptions';
import { ApiResponse } from './ApiResponse';
import type { OpenAPIConfig } from './OpenAPI';

export abstract class BaseHttpRequest {

    constructor(public readonly config: OpenAPIConfig) {}

    public abstract request<T>(options: ApiRequestOptions): Promise<ApiResponse<T>>;
}
