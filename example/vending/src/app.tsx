import 'bootstrap';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';

import './app.css';

import { Route, Routes } from 'react-router-dom'
import { animated, useTransition } from 'react-spring';
import { useLocation } from 'react-router';
import { NavIntent, setupBotAPI } from './common';
import { NotFoundPage } from './page/not_found';
import { HomePage } from './page/home';
import { ExtractionPage } from './page/extraction';
import { Loading } from './component/loading';
import { useState, useEffect } from 'react';
import { WebsocketClient } from './service/bot/websocket/client';

const apiURL = process.env.UI_WEBSOCKET || 'ws://localhost/ws';

// known routes/pages
const routes = new Map<string, JSX.Element>([
	['/', <HomePage />],
	['/extraction', <ExtractionPage />],
]);

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

