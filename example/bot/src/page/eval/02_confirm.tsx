import './../page.css';

import { Button, HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Loading } from '../../component/loading';
import { NavIntent, logger, BotAPI } from '../../common';
import { Modal } from '../../component/modal';
import { ApiError } from '../../service/bot/api/core/ApiResponse';

export function EvalConfirmPage() {
	const nav = useNavigate();

	const [loading, setLoading] = useState(false);
	const [windowObstructed, setWindowObstructed] = useState(false);

	const closeInlet = () => {
		return new Promise<boolean>((resolve, reject) => {
			logger.info(`Closing inlet window`);
			BotAPI().window.inletClose({}).then(res => {
				return res.promise();
			}).then(_ => {
				logger.info(`Inlet window is closed`);
				resolve(true);
			}).catch(err => {
				if (err as ApiError) {
					switch ((err as ApiError).code) {
						case 503: // Window is obstructed. Try one more time
							logger.info(`Inlet window is obstructed`);
							resolve(false);
							return;
					}
				}
				reject(err);
			});
		});
	}

	const startEval = () => {
		setLoading(true);

		logger.info(`Starting eval`);
		closeInlet().then(ok => {
			if (ok) {
				nav('/eval/progress');
			} else {
				setWindowObstructed(true);
			}
		}).catch(err => {
			logger.fatal(`Failed to close inlet window`, err);
		}).finally(() => {
			setLoading(false);
		})
	}

	const cancelEval = () => {
		setLoading(true);

		logger.info(`Cancelling eval`);
		closeInlet().then(ok => {
			if (ok) {
				nav('/', { state: new NavIntent().withBackwardAnimation() });
			} else {
				setWindowObstructed(true);
			}
		}).catch(err => {
			logger.fatal(`Failed to close inlet window`, err);
		}).finally(() => {
			setLoading(false);
		})
	}

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-inbox' />

					<h1>Place the item</h1>
					<p>
						Place the item into the inlet window and confirm please
					</p>
					<p className='accent'>
						Attention!
						<br />
						The item should fit freely in the window.
					</p>
					<Button className='mt-5' onClick={() => { startEval() }}>
						Yes, done
					</Button>
				</div>
			</article>

			<footer>
				<Button onClick={() => { cancelEval() }}>
					Cancel
				</Button>
				<HelpButton />
			</footer>

			<Loading show={loading} />

			<Modal shown={windowObstructed}>
				<header>
					<h1>Oops!</h1>
				</header>
				<article>
					<p>Inlet window is obstructed!</p>
					<p>Please try one more time.</p>
				</article>
				<footer>
					<Button onClick={() => { setWindowObstructed(false); }}>
						Close
					</Button>
				</footer>
			</Modal>
		</div>
	);
}