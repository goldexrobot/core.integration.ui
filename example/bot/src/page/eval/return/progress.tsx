import './../../page.css';

import { HelpButton } from '../../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../../component/header';
import { ItemRejectionReason } from '../../../service/bot/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Spinner } from '../../../component/spinner';
import { BotAPI, logger, NavIntent } from '../../../common';

export function ReturnProgressPage() {
	const location = useLocation();
	const nav = useNavigate();

	const [reason, setReason] = useState<ReturnReason>(ReturnReason.UNDEFINED);
	const [rejection, setRejection] = useState<ItemRejectionReason>(ItemRejectionReason.UNDESCRIBED);

	useEffect(() => {
		const intent = NavIntent.fromLocation(location);
		if (intent) {
			const rd = intent.args as ReturnIntentData;
			rd.reason && setReason(rd.reason);
			rd.rejection && setRejection(rd.rejection);
		}

		console.info(`Returning item`);
		BotAPI().eval.evalReturn({}).then(res => res.promise()).then(() => {
			console.info(`Item is in outlet window`);
			nav('/eval/return/outlet');
		}).catch(err => {
			logger.fatal(`Failed to return item`, err);
		});
	}, []);

	let reasonJSX = mapReason(reason);
	let rejectionJSX = mapGoldexRejection(rejection);

	return (

		<div className='page' onClick={(e) => { }}>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-people-carry' />
					<h1>Moving item back</h1>
					<p>{reasonJSX}</p>
					<p>{rejectionJSX}</p>
					<div className='mt-5'>
						<Spinner>&nbsp;</Spinner>
					</div>
				</div>
			</article>

			<footer>
				<HelpButton />
			</footer>
		</div>
	);
}

export function ReturnIntent(reason: ReturnReason, rejection?: ItemRejectionReason): ReturnIntentData {
	return {
		reason: reason,
		rejection: rejection,
	}
}

export interface ReturnIntentData {
	reason: ReturnReason | undefined;
	rejection: ItemRejectionReason | undefined;
}

export enum ReturnReason {
	UNDEFINED = 'undefined',
	CUSTOMER_CHOICE = 'customer_choice',
	NETWORK_UNAVAILABLE = 'network_unavailable',
	UNSTABLE_SCALE = 'unstable_scale',
	ITEM_REJECTED = 'item_rejected',
}

const mapReason = function (v: ReturnReason): JSX.Element {
	switch (v) {
		case ReturnReason.CUSTOMER_CHOICE:
			return <>Hope see you soon!</>
		case ReturnReason.NETWORK_UNAVAILABLE:
			return <>Unfortunately there are networking problems.</>
		case ReturnReason.UNSTABLE_SCALE:
			return <>Unfortunately vibration affects weighing.</>
		case ReturnReason.ITEM_REJECTED:
			return <>Unfortunately we can't accept the item.</>
	}
	return <>Unfortunately we can't accept the item</>
}

const mapGoldexRejection = function (v: ItemRejectionReason): JSX.Element {
	switch (v) {
		case ItemRejectionReason.UNDESCRIBED:
			return <></>
		case ItemRejectionReason.LOW_SPECTRUM:
			return <>Low content of precious metal in the item.</>
		case ItemRejectionReason.LOW_WEIGHT:
			return <>Item is too light.</>
		case ItemRejectionReason.HIGH_WEIGHT:
			return <>Item is too heavy.</>
		case ItemRejectionReason.UNCONFIRMED:
			return <>Failed to detect item sample.</>
	}
	return <></>
}