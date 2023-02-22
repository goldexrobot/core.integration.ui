import './../page.css';

import { Button, ButtonSize, HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useNavigate } from 'react-router';
import { Modal } from '../../component/modal';
import { useEffect, useState } from 'react';
import { Loading } from '../../component/loading';
import { BotAPI, logger, NavIntent } from '../../common';
import { StorageStateResult } from '../../service/bot/api';

export function StoragePage() {
	const nav = useNavigate();

	const [loading, setLoading] = useState(true);
	const [storageState, setStorageState] = useState<StorageStateResult | undefined>(undefined);
	const [failure, setFailure] = useState(false);

	useEffect(() => {
		BotAPI().storage.storageState({}).then(res => res.promise()).then(ss => {
			setStorageState(ss);
		}).catch(err => {
			logger.error("Retrieving storage state", err);
			setFailure(true);
		}).finally(() => {
			setLoading(false);
		})
	}, []);

	const extractCell = (cell:string) => {
		nav('/storage/progress', { state: new NavIntent().withPageArgs(cell) });
	}

	return (
		<div className='page' onClick={(e) => { }}>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-boxes' />

					<h1>Allocated slots</h1>

					{
						storageState && storageState.allocated.length ?
						<div style={{ overflowY: 'hidden', maxHeight: '850px'}}>
						{
							storageState.allocated.map((v, i) =>
								<Button size={ButtonSize.SmallSquare} className='m-2' onClick={() => { extractCell(v.cell) }} key={'storage_cell_' + i}>
									{v.cell}
								</Button>
							)
						}
						</div>

						: <div>Nothing here yet</div>
					}

				</div>
			</article>

			<footer>
				<Button onClick={() => { nav('/', { state: new NavIntent().withBackwardAnimation() }) }}>
					Back
				</Button>
				<HelpButton />
			</footer>

			<Modal shown={failure}>
				<header>
					<h1>Oops!</h1>
				</header>
				<article>
					<p>
						Failed to get storage state.
					</p>
					<p>Please come back later!</p>
				</article>
				<footer>
					<Button onClick={() => { nav('/', { state: new NavIntent().withBackwardAnimation() }) }}>
						Close
					</Button>
				</footer>
			</Modal>

			<Loading show={loading} />
		</div>
	);
}