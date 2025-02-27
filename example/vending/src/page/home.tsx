import './page.css';

import { Button, HelpButton } from '../component/button';
import { Header, HeaderSize } from '../component/header';
import { useEffect, useState } from 'react';
import { Modal } from '../component/modal';
import { Loading } from '../component/loading';
import { BotAPI, logger, NavIntent } from '../common';
import { useNavigate } from 'react-router';
import { DispenserSlotState } from '../service/bot/api/models/DispenserSlotState';
import { DispenserSlot } from '../component/dispenser_slot';
import { DispenserExtractionStep } from '../service/bot/api/models/DispenserExtractionStep';
import { StatusResult } from '../service/bot/api';

export function HomePage() {
	const nav = useNavigate();

	enum Failure {
		Network,
		Power,
	}

	const [loading, setLoading] = useState(true);
	const [loadingInstant, setLoadingInstant] = useState(true);
	const [failure, setFailure] = useState<Failure | undefined>(undefined);

	const [slots, setSlots] = useState<DispenserSlotState[] | undefined>(undefined);
	const [pushes, setPushes] = useState<DispenserExtractionStep[]>([]);

	useEffect(() => {
		getDispenserSlots().then(slots => {
			setSlots(slots);
			setLoading(false);
			setLoadingInstant(false);
		}).catch(err => {
			logger.fatal('Home page init failed', err);
		});
	}, []);

	const getStatus = () => {
		return new Promise<StatusResult>((resolve, reject) => {
			BotAPI().service.serviceStatus().then(res => {
				return res.promise();
			}).then(status => {
				resolve(status);
			}).catch(err => {
				logger.error(`Failed checking status`, err);
				throw err;
			});
		})
	}

	const getDispenserSlots = () => {
		return new Promise<DispenserSlotState[]>((resolve, reject) => {
			BotAPI().dispenser.dispenserSlots({}).then(res => res.promise()).then(slots => {
				resolve(slots.state);
			}).catch(err => {
				logger.error(`Failed checking dispenser slots`, err);
				reject(err);
			});
		})
	}

	const dispenseItems = () => {
		setLoading(true);
		getStatus().then(status => {
			if (!status.online) {
				setFailure(Failure.Network);
				return;
			}
			if (!status.power) {
				setFailure(Failure.Power);
				return;
			}
			nav('/extraction', { state: new NavIntent().withPageArgs(pushes) });
		}).catch(err => {
			logger.fatal('Failed preparing dispenser', err);
		}).finally(() => {
			setLoading(false);
		});
	}

	const onPushesChange = (slot: number, times: number) => {
		let p = pushes.concat();

		const update = () => {
			setPushes(p.sort((a, b) => a.slot - b.slot));
		}

		if (times <= 0) {
			p = p.filter(v => { return v.slot != slot });
			update();
			return
		}
		for (let i = 0; i < p.length; i++) {
			if (p[i].slot == slot) {
				p[i].times = times;
				update();
				return;
			}
		}
		p = p.concat({ slot: slot, times: times });
		update();
	}

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div className='d-flex flex-row gap-5'>
					{
						slots && slots.map((v) => {
							if (v.enabled) {
								return <DispenserSlot slotNum={v.slot} maxPushes={42} onChange={(pushes) => onPushesChange(v.slot, pushes)} key={'dispenser_slot_' + v.slot}></DispenserSlot>
							}
						})
					}
				</div>
				<div>
					<Button disabled={pushes.length == 0} onClick={() => { dispenseItems() }}>Dispense</Button>
				</div>
			</article>

			<footer>
				<HelpButton />
			</footer>

			<Modal shown={failure !== undefined}>
				<header>
					<h1>Out of service</h1>
				</header>
				<article>
					<p>
						{failure == Failure.Network && <>Networking problems.</>}
						{failure == Failure.Power && <>Power line down.</>}
					</p>
					<p>Retry later</p>
				</article>
				<footer>
					<Button onClick={() => { setFailure(undefined); }}>
						Close
					</Button>
				</footer>
			</Modal>

			<Loading show={loading} instant={loadingInstant} />
		</div >
	);
}

