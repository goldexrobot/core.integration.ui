import './modal.css';

import React from 'react';
import { animated, Transition } from 'react-spring';
import ReactDOM from 'react-dom';

type ModalProps = {
	children: React.ReactNode[]
	shown: boolean;
}

interface ModalState {
	wrapper: HTMLElement;
}

export class Modal extends React.Component<ModalProps, ModalState> {

	constructor(props: ModalProps) {
		super(props);

		this.state = {
			wrapper: document.createElement('div'),
		}
	}

	componentDidMount = () => {
		document.getElementById('modal-root')?.appendChild(this.state.wrapper);
	}

	componentWillUnmount = () => {
		document.getElementById('modal-root')?.removeChild(this.state.wrapper);
	}

	render() {
		return ReactDOM.createPortal(
			<Transition
				items={this.props.shown}
				from={{ opacity: 0, trans: -300 }}
				enter={{ opacity: 1, trans: 0 }}
				leave={{ opacity: 0, trans: 300 }}
			>
				{
					({ opacity, trans }, shown) => {
						return (
							shown && <animated.div
								className='modal-overlay'
								style={{
									opacity: opacity,
								}}
							>
								<animated.div
									className="modal-content"
									style={{
										translateY: trans,
									}}
								>
									{this.props.children}
								</animated.div>
							</animated.div>
						)
					}
				}
			</Transition>,
			this.state.wrapper
		);
	}
}
