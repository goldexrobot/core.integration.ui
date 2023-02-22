import './loading.css';

import _ from "./../asset/image/noise.svg";

import { HelpButton } from './button';
import { Spinner } from './spinner';
import { animated, useChain, useSpring, useSpringRef } from 'react-spring';
import { useEffect, useState } from 'react';

interface Props {
	show: boolean;
	text?: string;
	instant?: boolean;
}

export function Loading(props: Props) {
	const [showing, setShowing] = useState(false);
	const [instant, setInstant] = useState(false);

	useEffect(() => {
		setShowing(props.show);
	}, [props.show]);
	
	useEffect(() => {
		setInstant(props.instant || false);
	}, [props.instant]);
	
	const a1 = useSpringRef();
	const a2 = useSpringRef();

	// splash opacity
	const { opacity } = useSpring({
		ref: a1,
		from: { opacity: 0 },
		to: { opacity: 1 },
		config: {
			duration: showing? (instant? 0: 200): 200,
		},
		delay: instant? 0: 300,
		reverse: !showing,
		onStart: () => {
			if (!showing) {
				a2.stop(true);
			} else {
				a2.set({
					opacity: 0,
				})
				a2.start();
			}
		},
	});

	// help button opacity
	const { opacity:helpOpacity } = useSpring({
		ref: a2,
		from: { opacity: 0 },
		to: { opacity: 1 },
		config: {
			duration: 500,
		},
		reverse: !showing,
	});

	useChain([a1, a2], [0, 3], 1000);

	return (
		<animated.div className='loading-splash' style={{
			opacity: opacity,
			display: opacity.to(v => v > 0 ? 'flex' : 'none'),
		}}>
			<div>
			</div>

			<div>
				<Spinner>
					{props.text || 'Uno momento'}
				</Spinner>
			</div>

			<animated.div style={{
				opacity: helpOpacity,
				visibility: helpOpacity.to(v => v > 0 ? 'visible' : 'hidden'),
			}}>
				<HelpButton />
			</animated.div>
		</animated.div >
	);
}

