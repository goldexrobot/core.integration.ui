import './page.css';

import { HelpButton } from '../component/button';
import { Header, HeaderSize, HeadIcon } from '../component/header';
import { BotAPI, logger, NavIntent } from '../common';
import { useLocation, useNavigate } from 'react-router';
import { DispenserStep } from '../service/bot/api';
import { useEffect } from 'react';

export function ExtractionPage() {
	const nav = useNavigate();

	const steps = NavIntent.fromLocation(useLocation()).args as DispenserStep[];

	useEffect(() => {
		BotAPI().dispenser.dispenserExtract({ steps: steps }).then(res => {
			return res.promise();
		}).then(res => {
			nav('/', { state: new NavIntent().withBackwardAnimation() });
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

