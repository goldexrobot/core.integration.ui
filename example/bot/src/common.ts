import { Location } from "react-router";
import { Client } from "./service/bot/api";
import { WebsocketClient } from "./service/bot/websocket/client";

let botAPIProvider: WebsocketClient | string;

export function setupBotAPI(provider: WebsocketClient | string) {
	botAPIProvider = provider;
}

export function BotAPI(): Client {
	if (typeof botAPIProvider === 'string') {
		return new Client({
			BASE: botAPIProvider,
			HEADERS: {
				Prefer: "statusCode=default",
			}
		});
	}
	return new Client({}, botAPIProvider.fetchRequestClass());
}

export const logger = new class {
	debug(msg: string) {
		console.debug(msg);
	}
	info(msg: string) {
		console.info(msg);
	}
	error(msg: string, err?: any) {
		if (err) {
			if (!(err instanceof Error)) {
				err = JSON.stringify(err);
			}
			console.error(`${msg}: ` + err);
		} else {
			console.error(msg);
		}
	}
	fatal(msg: string, err: any) {
		this.error(msg, err);
		BotAPI().service.serviceKill({});
	}
}

export class NavIntent {
	animation: 'forward' | 'backward';
	args: any;

	constructor() {
		this.animation = 'forward';
		this.args = null;
	}

	static fromLocation(loc: Location): NavIntent {
		return loc.state as NavIntent;
	}

	withPageArgs(args: any): NavIntent {
		this.args = args;
		return this;
	}

	withBackwardAnimation(): NavIntent {
		this.animation = 'backward';
		return this;
	}
}

export type Domain = 'buyout' | 'shop' | 'pawnshop';

export type UserTag = {
	domain?: Domain;
}

export function makeUserTag(domain: Domain): string {
	return JSON.stringify({
		domain: domain,
	} as UserTag)
}

export function parseUserTag(str: string): UserTag {
	try {
		return JSON.parse(str) as UserTag;
	} catch (err) {
		return {} as UserTag;
	}
}

