import React from 'react';

import goldex_logo from "./../asset/image/goldex_white.svg";

import 'line-awesome/dist/line-awesome/css/line-awesome.min.css';
import { animated, useSpring } from 'react-spring';

export enum HeaderSize {
	Compact = "compact",
	Full = "full",
}

type HeaderProps = {
	size?: HeaderSize;
}

export class Header extends React.Component<HeaderProps> {

	constructor(props: any) {
		super(props);
	}

	render() {
		return (
			<div className='d-flex flex-column align-items-center mt-3'>
				<img src={goldex_logo} width={this.props.size == HeaderSize.Full ? '500' : '250'} />

				{this.props.size == HeaderSize.Full &&
					<div className='mt-5 d-flex flex-column align-items-center gap-1' style={{fontSize: '2rem'}}>
						Instant money for your gold
					</div>
				}
			</div>
		);
	}
}

type HeadIconProps = {
	name: string;
}

export function HeadIcon(props: HeadIconProps) {
	const { scale } = useSpring({
		from: { scale: 0.8 },
		to: { scale: 1 },
		config: {
			mass: 2,
			tension: 180,
			friction: 15,
			velocity: 0.005
		},
		delay: 300,
	})

	return (
		<div className='mb-4'>
			<animated.i className={`las ${props.name}`} style={{
				fontSize: '170px',
				scale: scale,
			}}></animated.i>
		</div>
	)
}