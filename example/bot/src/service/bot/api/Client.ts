/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';

import { BusinessBotService } from './services/BusinessBotService';
import { EvalBotService } from './services/EvalBotService';
import { ServiceBotService } from './services/ServiceBotService';
import { StorageBotService } from './services/StorageBotService';
import { WindowBotService } from './services/WindowBotService';

type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;

export class Client {

    public readonly business: BusinessBotService;
    public readonly eval: EvalBotService;
    public readonly service: ServiceBotService;
    public readonly storage: StorageBotService;
    public readonly window: WindowBotService;

    public readonly request: BaseHttpRequest;

    constructor(config?: Partial<OpenAPIConfig>, HttpRequest: HttpRequestConstructor = FetchHttpRequest) {
        this.request = new HttpRequest({
            BASE: config?.BASE ?? '',
            VERSION: config?.VERSION ?? '1.0.0',
            WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
            CREDENTIALS: config?.CREDENTIALS ?? 'include',
            TOKEN: config?.TOKEN,
            USERNAME: config?.USERNAME,
            PASSWORD: config?.PASSWORD,
            HEADERS: config?.HEADERS,
            ENCODE_PATH: config?.ENCODE_PATH,
        });

        this.business = new BusinessBotService(this.request);
        this.eval = new EvalBotService(this.request);
        this.service = new ServiceBotService(this.request);
        this.storage = new StorageBotService(this.request);
        this.window = new WindowBotService(this.request);
    }
}
