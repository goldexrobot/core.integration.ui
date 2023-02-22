export interface WebsocketOptions {
	debug?: boolean;
	onConnected: () => void;
	onDisconnected: (e: CloseEvent) => void;
	onNotification: (method: string, params: any) => void;
}

type WebsocketRequest = {
	resolve: (result: JSONRPCResponse) => void;
	reject: (error: any) => void;
}

export type JSONRPCResponse = {
	readonly result?: JSONRPCResult;
	readonly error?: JSONRPCError;
}

export type JSONRPCResult = any

export type JSONRPCError = {
	readonly code: number;
	readonly message: string;
}

export class WebsocketJSONRPC {

	private url: string;
	private debug: boolean;

	private onConnectedFn: () => void;
	private onDisconnectedFn: (e: CloseEvent) => void;
	private onNotificationFn: (method: string, params: any) => void;

	private ws: WebSocket | undefined;
	private pending: Map<number, WebsocketRequest>;

	constructor(url: string, opts: WebsocketOptions) {
		this.url = url;

		this.debug = opts?.debug || false;
		this.onConnectedFn = opts?.onConnected || (() => { });
		this.onDisconnectedFn = opts?.onDisconnected || (() => { });
		this.onNotificationFn = opts?.onNotification || (() => { });

		this.ws = undefined;
		this.pending = new Map<number, WebsocketRequest>();
	}

	public connect() {
		if (this.ws) {
			throw new Error('connected already');
		}

		let conn = new WebSocket(this.url);
		conn.onopen = (ws) => {
			this.onOpen(conn);
		};
		conn.onerror = (e) => {
			this.onError(e)
		};
		conn.onmessage = (e) => {
			this.onMessage(e)
		};
		conn.onclose = (e: CloseEvent) => {
			this.onClose(e);
		};
	}

	public disconnect() {
		if (this.ws) this.ws.close();
	}

	private onOpen(ws: WebSocket) {
		console.info(`Websocket connected`);
		this.ws = ws;
		this.onConnectedFn();
	}

	private onError(e: Event) {
		console.error(`Websocket error: ${e.type}`);
	}

	private onClose(e: CloseEvent) {
		console.error(`Websocket closed: code '${e.code}', reason '${e.reason}'`);
		this.ws = undefined;
		this.onDisconnectedFn(e);
	}

	// private cancelAllPending() {
	// 	this.pending.forEach(req => {
	// 		req.reject(new Error('websocket disconnected'));
	// 	});
	// 	this.pending.clear();
	// }

	private onMessage(e: MessageEvent) {
		try {
			var d = JSON.parse(e.data);

			// has no id, but method => server notification
			if (!d['id'] && d['method']) {
				this.debug && console.debug(`Websocket (event) >> ${e.data}`);
				this.onNotificationFn(d.method, d.params);
				return
			}

			// has id, but not method => result for request
			if (!!d['id'] && !d['method']) {
				this.debug && console.debug(`Websocket >> ${e.data}`);

				let request = this.pending.get(d.id);
				if (!request) {
					return;
				}
				this.pending.delete(d.id)

				// it's result
				if (d.hasOwnProperty('result')) {
					request.resolve({
						result: d.result || {},
					});
					return;
				}

				// it's error
				if (d.hasOwnProperty('error')) {
					request.resolve({
						error: {
							code: d.error['code'] || -1,
							message: d.error['message'] || '',
						},
					});
					return;
				}

				// something invalid
				request.reject('Invalid message received from the server');
			}
		} catch (err) {
			console.error(`Websocket failed parsing message: ` + JSON.stringify(err));
		}
	}

	request(id: number, method: string, params: any): Promise<JSONRPCResponse> {
		return new Promise<JSONRPCResponse>((resolve, reject) => {
			if (!this.ws) {
				reject('Websocket disconnected');
				return;
			}

			this.pending.set(id, {
				resolve: resolve,
				reject: reject,
			});

			let req = JSON.stringify({ jsonrpc: "2.0", id: id, method: method, params: params });
			this.debug && console.debug(`Websocket << ${req}`);
			this.ws.send(req);
		});
	}

}
