import './../../page.css';

import { Button, HelpButton } from '../../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../../component/header';
import { Loading } from '../../../component/loading';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BotAPI, logger } from '../../../common';
import { ApiError } from '../../../service/bot/api/core/ApiResponse';
import { Modal } from '../../../component/modal';

export function ReturnOutletPage() {
	const nav = useNavigate();

	const [loading, setLoading] = useState(false);
	const [windowObstructed, setWindowObstructed] = useState(false);

	const closeOutlet = () => {
		return new Promise<boolean>((resolve, reject) => {
			logger.info(`Closing outlet window`);
			BotAPI().window.outletClose({}).then(res => res.promise()).then(_ => {
				logger.info(`Outlet window is closed`);
				resolve(true);
			}).catch(err => {
				switch ((err as ApiError).code) {
					case 503: // Window is obstructed. Try one more time
						logger.info(`Outlet window is obstructed`);
						resolve(false);
						return;
				}

				reject(err);
			});
		});
	}

	const confirmTakeOut = () => {
		setLoading(true);

		closeOutlet().then(ok => {
			if (ok) {
				nav('/');
			} else {
				setWindowObstructed(true);
			}
		}).catch(err => {
			logger.fatal(`Failed to close outlet window`, err);
		}).finally(() => {
			setLoading(false);
		})
	}

	return (
		<div className='page' onClick={(e) => { }}>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-window-minimize' />
					<h1>Take you item</h1>
					<p>
						Take your item and tap Done
					</p>
					<Button className='mt-5' onClick={() => { confirmTakeOut() }}>
						Done
					</Button>
				</div>
			</article>

			<footer>
				<HelpButton />
			</footer>

			<Loading show={loading} />

			<Modal shown={windowObstructed}>
				<header>
					<h1>Oops!</h1>
				</header>
				<article>
					<p>Outlet window is obstructed!</p>
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