import './../page.css';

import { HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BotAPI, logger, NavIntent } from '../../common';
import { DispenserExtractionStep } from '../../service/bot/api/models/DispenserExtractionStep';


export function DispenserExtractPage() {
	const nav = useNavigate();

	const steps = NavIntent.fromLocation(useLocation()).args as DispenserExtractionStep[];

	useEffect(() => {
		BotAPI().dispenser.dispenserExtract({ steps: steps }).then(res => {
			return res.promise();
		}).then(res => {
			logger.info(`Outlet window opened`);
			nav('/dispenser/outlet');
		}).catch(err => {
			logger.fatal(`Failed dispensing items`, err);
		});
	}, []);

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Full}></Header>
			</header>

			<article>
				<HeadIcon name='la-coins' />
				<h1>Extracting items</h1>
			</article>

			<footer>
				<HelpButton />
			</footer>
		</div >
	);

}