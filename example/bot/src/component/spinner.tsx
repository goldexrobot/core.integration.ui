import './spinner.css';

import { animated, useSpring } from 'react-spring';
import { useState } from 'react';

type SpinnerProps = {
	children?: React.ReactNode;
}

export function Spinner(props: SpinnerProps) {

	const [reverse, setReverse] = useState(false);

	const { x } = useSpring({
		from: { x: 0 },
		to: { x: 1 },
		loop: {
			reset: true,
		},
		config: {
			duration: 2000,
		},
		onRest: () => {
			setReverse(!reverse);
		}
	});

	return (
		<div className='text-center'>
			<animated.div className="spinner" style={{
				scale: x.to({
					range: [0, 0.25, 0.5, 0.75, 1],
					output: [1, 1.2, 1, 1.2, 1],
				}),
				transform: x.to(x => `rotate(${x * 360}deg`),
			}}></animated.div>

			{
				props.children && <animated.div className='mt-4' style={{
					opacity: x.to({ 
						range: [0, 0.5, 1], 
						output: [0.2, 1, 0.2] 
					})
				}}>{props.children || ''}</animated.div>
			}
		</div>
	);
}

