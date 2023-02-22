import './../page.css';

import { HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { Spinner } from '../../component/spinner';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BotAPI, logger, makeUserTag } from '../../common';


export function EvalStorePage() {
	const nav = useNavigate();

	useEffect(() => {
		logger.info(`Moving item to storage`);
		BotAPI().eval.evalStore({user_tag: makeUserTag('buyout')}).then(res => res.promise()).then(res => {
			logger.info(`Item moved to storage slot ${res.cell}`);

			if (res.hardware_failed) {
				logger.fatal(`Hardware has failed. This is a fatal error`, null);
				return
			}

			nav('/');
		}).catch(err => {
			logger.fatal(`Failed to move item to storage`, err);
		});
	}, []);

	return (

		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<HeadIcon name='la-dumpster' />
					<h1>Done!</h1>
					<div>
						<Spinner>
							Storing item
						</Spinner>
					</div>
				</div>
			</article >

			<footer>
				<HelpButton />
			</footer>
		</div >
	);
}