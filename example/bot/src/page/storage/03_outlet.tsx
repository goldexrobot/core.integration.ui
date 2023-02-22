import './../page.css';

import { Button, HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Loading } from '../../component/loading';
import { BotAPI, logger } from '../../common';
import { Modal } from '../../component/modal';
import { ApiError } from '../../service/bot/api/core/ApiResponse';

export function StorageOutletPage() {
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

	const complete = () => {
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
		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-inbox' />

					<h1>Take the item</h1>
					<p>
						Take the item from the outlet window and confirm please
					</p>
					<Button className='mt-5' onClick={() => { complete() }}>
						Yes, done
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