import './../page.css';

import { Button, HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useNavigate } from 'react-router';
import { Modal } from '../../component/modal';
import { useState } from 'react';
import { Loading } from '../../component/loading';
import { NavIntent, logger, BotAPI } from '../../common';
import { ApiError } from '../../service/bot/api/core/ApiResponse';

export function EvalInletPage() {
	const nav = useNavigate();

	enum Failure {
		Network,
		Hardware,
		StorageRoom,
	}

	const [loading, setLoading] = useState(false);
	const [failure, setFailure] = useState<Failure | undefined>(undefined);

	const openInlet = () => {
		setLoading(true);

		logger.info(`Beginning new eval`);

		// new eval
		BotAPI().eval.evalNew().then(res => res.promise()).then(evl => {
			logger.info(`New eval began. Target cell ${evl.storage_cell}, ID ${evl.eval_id}`);

			// open inlet
			logger.info(`Opening inlet window`);
			BotAPI().window.inletOpen({}).then(res => {
				logger.info(`Inlet window opened`);
				nav('/eval/confirm');
			}).catch(err => {
				logger.error('Failed to open inlet window', err);

				setLoading(false);
				setFailure(Failure.Hardware);
			});
		}).catch(err => {
			logger.error('Failed to begin a new eval', err);

			// default
			setLoading(false);
			setFailure(Failure.Hardware);

			switch ((err as ApiError).code) {
				case 503: // Hardware is not ready yet. Do nothing
					setFailure(Failure.Hardware);
					return;
				case 504: // Network is unavailable. Try again
					setFailure(Failure.Network);
					return;
				case 507: // Storage is out of space. Do nothing
					setFailure(Failure.StorageRoom);
					return;
			}
		});
	}

	return (
		<div className='page' onClick={(e) => { }}>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-info-circle' />

					<h1>Before you begin</h1>
					<p>
						The machine evaluates items:
					</p>
					<ul className='text-start'>
						<li>weighing 2 to 35 grams</li>
						<li>of gold or silver</li>
					</ul>

					<Button className='mt-5' onClick={() => { openInlet() }}>
						Begin
					</Button>
				</div>
			</article>

			<footer>
				<Button onClick={() => { nav('/', { state: new NavIntent().withBackwardAnimation() }) }}>
					Back
				</Button>
				<HelpButton />
			</footer>

			<Modal shown={failure !== undefined}>
				<header>
					<h1>Oops!</h1>
				</header>
				<article>
					<p>
						{failure == Failure.Network && <>Networking problems.</>}
						{failure == Failure.Hardware && <>The machine is not ready.</>}
						{failure == Failure.StorageRoom && <>No storage space.</>}
					</p>
					<p>Please come back later!</p>
				</article>
				<footer>
					<Button onClick={() => { setFailure(undefined); }}>
						Close
					</Button>
				</footer>
			</Modal>

			<Loading show={loading} />
		</div>
	);
}