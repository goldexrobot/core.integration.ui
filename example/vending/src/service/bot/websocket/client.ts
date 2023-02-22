import { ApiRequestOptions } from "../api/core/ApiRequestOptions";
import { ApiError, ApiResponse } from "../api/core/ApiResponse";
import { BaseHttpRequest } from "../api/core/BaseHttpRequest";
import { OpenAPIConfig } from "../api/core/OpenAPI";
import { JSONRPCResponse, WebsocketJSONRPC } from "./jsonrpc";

export interface Options {
	debug?: boolean;
	onConnected?: () => void;
	onDisconnected?: () => void;
	onNotification?: (method: string, params: any) => void;
}

export class WebsocketClient {

	private requestID: number;

	private opts: Options;
	private ws: WebsocketJSONRPC | undefined;
	private autoReconnectURL: string | undefined;

	constructor(opts: Options) {
		this.requestID = 0;
		this.opts = opts;
		this.ws = undefined;
		this.autoReconnectURL = undefined;
	}

	connect(url: string, autoReconnect?: boolean) {
		if (this.ws) {
			this.ws.disconnect();
		}
		if (autoReconnect) {
			this.autoReconnectURL = url;
		}
		this.doConnect(url);
	}

	private doConnect(url: string) {
		this.ws = new WebsocketJSONRPC(url, {
			debug: this.opts?.debug || false,
			onConnected: () => { this.onConnected() },
			onDisconnected: () => { this.onDisconnected() },
			onNotification: (method, params) => { this.onNotification(method, params) },
		});
		this.ws.connect();
	}

	disconnect() {
		this.autoReconnectURL = undefined;
		if (this.ws) {
			this.ws.disconnect();
		}
	}

	onConnected() {
		if (this.opts.onConnected) this.opts.onConnected();
	}

	onDisconnected() {
		this.ws = undefined;
		if (this.opts.onDisconnected) this.opts.onDisconnected();

		if (this.autoReconnectURL) {
			const url = this.autoReconnectURL;
			setTimeout(() => {
				this.doConnect(url);
			}, 1);
		}
	}

	onNotification(method: string, params: any) {
		if (this.opts.onNotification) this.opts.onNotification(method, params);
	}

	private nextID(): number {
		if (this.requestID < Number.MAX_SAFE_INTEGER) {
			this.requestID++;
		} else {
			this.requestID = 1;
		}
		return this.requestID;
	}

	request(method: string, params: any): Promise<JSONRPCResponse> {
		if (!this.ws) throw new Error('not connected');
		return this.ws.request(this.nextID(), method, params);
	}

	fetchRequestClass(): new (config: OpenAPIConfig) => BaseHttpRequest {
		let wsc = this;
		return class extends FetchWebsocketJSONRPCRequest {
			constructor(config: OpenAPIConfig) {
				super(config, wsc);
			}
		};
	}
}

class FetchWebsocketJSONRPCRequest extends BaseHttpRequest {

	private wsc: WebsocketClient;

	constructor(config: OpenAPIConfig, wsc: WebsocketClient) {
		super(config);
		this.wsc = wsc;
	}

	public override request<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
		return new Promise(async (resolve, reject) => {
			try {
				const method = (options.url || '').replaceAll('/', '');
				const params = options.body || {};

				const resp = await this.wsc.request(method, params);

				if (resp.result) {
					resolve(new ApiResponse<T>({ result: resp.result }));
					return;
				}

				resolve(new ApiResponse<T>({ err: new ApiError(resp.error?.code || -1, resp.error?.message || 'message not defined') }));
			} catch (error) {
				reject(error);
			}
		});
	}
}

