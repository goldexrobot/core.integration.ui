import './../page.css';

import { Button, ButtonSize, HelpButton } from './../../component/button';
import { Header, HeaderSize } from '../../component/header';
import { useEffect, useState } from 'react';
import { Modal } from '../../component/modal';
import { Loading } from '../../component/loading';
import { BotAPI, logger } from '../../common';
import { useNavigate } from 'react-router';
import { StatusResult } from '../../service/bot/api';

export function WelcomePage() {
	const nav = useNavigate();

	enum Failure {
		Network,
		Power,
		StatusCheck,
	}

	const [loading, setLoading] = useState(true);
	const [loadingInstant, setLoadingInstant] = useState(true);
	const [cellGridEnabled, setCellGridEnabled] = useState(true);
	const [failure, setFailure] = useState<Failure | undefined>(undefined);

	useEffect(() => {
		// get machine features
		BotAPI().service.serviceStatus().then((res) => res.promise()).then(status => {
			// has cell-grided storage, so is able to handle shop/pawnshop flow
			setCellGridEnabled(status.features.storage_can_extract);

			setLoadingInstant(false);
			setLoading(false);
		}).catch(err => {
			logger.fatal(`Failed checking bot features`, err);
		});
	}, []);

	// check current status every time we need to start an item evaluation
	const checkStatus = () => {
		return new Promise<StatusResult>((resolve, reject) => {
			BotAPI().service.serviceStatus().then(res => res.promise()).then(status => {
				resolve(status);
			}).catch(err => {
				logger.error(`Failed checking bot status`, err);
				throw err;
			});
		})
	}

	const startEval = () => {
		setLoading(true);

		checkStatus().then(status => {
			if (!status.online) {
				setFailure(Failure.Network);
				setLoading(false);
				return;
			}
			if (!status.power) {
				setFailure(Failure.Power);
				setLoading(false);
				return;
			}
			nav('/eval/inlet');
		}).catch(err => {
			logger.error(`Failed to start eval`, err);
			setFailure(Failure.StatusCheck);
			setLoading(false);
		})
	}

	const showStorage = () => {
		nav('/storage');
	}

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Full}></Header>
			</header>

			<article>
				<div>
					<div>
						<Button size={ButtonSize.Big} onClick={() => { startEval() }} >
							Evaluate item
						</Button>
					</div>
					{
						cellGridEnabled && <div className='mt-5'>
							<Button size={ButtonSize.Default} secondary onClick={() => { showStorage() }}>
								Show storage
							</Button>
						</div>
					}
				</div>
			</article>

			<Modal shown={failure !== undefined}>
				<header>
					<h1>Out of service</h1>
				</header>
				<article>
					<p>
						{failure == Failure.Network && <>Networking problems.</>}
						{failure == Failure.Power && <>Power line down.</>}
						{failure == Failure.StatusCheck && <>Couldn't check machine status.</>}
					</p>
					<p>Retry later</p>
				</article>
				<footer>
					<Button onClick={() => { setFailure(undefined); }}>
						Close
					</Button>
				</footer>
			</Modal>

			<footer>
				<HelpButton />
			</footer>

			<Loading show={loading} instant={loadingInstant} />
		</div >
	);
}

