import './../page.css';

import { HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { Spinner } from '../../component/spinner';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BotAPI, logger, NavIntent } from '../../common';


export function StorageExtractPage() {
	const location = useLocation();
	const nav = useNavigate();

	const cell = NavIntent.fromLocation(location).args as string;

	useEffect(() => {
		logger.info(`Extracting storage cell ${cell}`);
		BotAPI().storage.storageExtract({ cell }).then(res => res.promise()).then(res => {
			logger.info(`Extracted storage cell ${res.cell}`);
			if (res.hardware_failed) {
				logger.fatal(`Hardware failed after the cell extraction`, null);
				return;
			}
		}).then(_ => {
			logger.info(`Outlet window opened`);
			nav('/storage/outlet');
		}).catch(err => {
			logger.fatal('Failed to extract from storage', err);
		});
	}, []);

	return (

		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-boxes' />
					<h1>Extracting from {cell}</h1>
					<div>
						<Spinner />
					</div>
				</div>
			</article >

			<footer>
				<HelpButton />
			</footer>
		</div >
	);
}