import 'bootstrap';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';

import './app.css';

import { Route, Routes } from 'react-router-dom'
import { animated, useTransition } from 'react-spring';
import { useLocation } from 'react-router';

import { NotFoundPage } from './page/not_found';
import { WelcomePage } from './page/welcome/welcome';
import { EvalInletPage } from './page/eval/01_inlet';
import { EvalConfirmPage } from './page/eval/02_confirm';
import { EvalProgressPage } from './page/eval/03_progress';
import { EvalEstimationPage } from './page/eval/04_estimation';
import { ReturnProgressPage } from './page/eval/return/progress';
import { ReturnOutletPage } from './page/eval/return/outlet';
import { NavIntent, setupBotAPI } from './common';
import { EvalStorePage } from './page/eval/05_store';
import { StoragePage } from './page/storage/01_storage';
import { StorageExtractPage } from './page/storage/02_extract';
import { StorageOutletPage } from './page/storage/03_outlet';
import { WebsocketClient } from './service/bot/websocket/client';
import { useEffect, useState } from 'react';
import { Loading } from './component/loading';
import { DispenserPage } from './page/dispenser/01_dispenser';
import { DispenserExtractPage } from './page/dispenser/02_extract';
import { DispenserOutletPage } from './page/dispenser/03_outlet';

// known routes/pages
const routes = new Map<string, JSX.Element>([
	['/', <WelcomePage />],

	['/eval/inlet', <EvalInletPage />],
	['/eval/confirm', <EvalConfirmPage />],
	['/eval/progress', <EvalProgressPage />],
	['/eval/estimation', <EvalEstimationPage />],
	['/eval/store', <EvalStorePage />],

	['/eval/return/progress', <ReturnProgressPage />],
	['/eval/return/outlet', <ReturnOutletPage />],

	['/storage', <StoragePage />],
	['/storage/progress', <StorageExtractPage />],
	['/storage/outlet', <StorageOutletPage />],

	['/dispenser', <DispenserPage />],
	['/dispenser/progress', <DispenserExtractPage />],
	['/dispenser/outlet', <DispenserOutletPage />],
]);

const apiURL = process.env.UI_WEBSOCKET || 'ws://localhost/ws';

export function App() {
	const location = useLocation();

	const [connected, setConnected] = useState(false);
	const [ws] = useState(new WebsocketClient({
		debug: process.env.ENV === 'dev',
		onConnected() {
			setConnected(true);
		},
		onDisconnected() {
			setConnected(false);
		}
	}));

	useEffect(() => {
		if (process.env.ENV === 'dev' && apiURL.startsWith('http')) {
			setupBotAPI(apiURL);
			setConnected(true);
		} else {
			setupBotAPI(ws);
			ws.connect(apiURL, true);
		}
	}, []);

	let reverseAnim = false;
	const intent = NavIntent.fromLocation(location);
	if (intent) {
		reverseAnim = intent.animation == 'backward';
	}

	// page switch transition/animation
	const transitions = useTransition(
		location,
		{
			from: { opacity: 0, x: reverseAnim ? -600 : 600 },
			enter: { opacity: 1, x: 0 },
			leave: { opacity: 0, x: reverseAnim ? 600 : -600 },
			config: {
				duration: 300,
			},
			delay: 0,
		}
	);

	let routeList = new Array<JSX.Element>();
	routes.forEach((comp, path) => {
		routeList.push(<Route path={path} key={'route_' + path} element={comp} index={path == '/'} />)
	});

	return (
		<div>
			{
				!connected && <Loading show={true} instant={true} text="Connecting to API" />
			}
			{
				connected && transitions((styles, location) => {
					return (
						location &&
						<animated.div className='page-container' key={location.pathname} data-page-url={location.pathname} style={styles}>
							{
								<Routes location={location}>
									{routeList}
									<Route path="*" element={<NotFoundPage />} key='route_404' />
								</Routes>
							}
						</animated.div>
					)
				})
			}

		</div>
	)
}

