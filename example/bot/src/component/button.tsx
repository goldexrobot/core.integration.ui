import React, { useState } from 'react';
import { animated, config, useSpring } from 'react-spring';

import './button.css';
import { Modal } from './modal';

export enum ButtonSize {
	Default = "default",
	Big = "big",
	Small = "small",
	SmallSquare = "small-square",
}

type ButtonProps = {
	children?:React.ReactNode;
	text?: string;
	size?: ButtonSize;
	secondary?: boolean;
	className?: string;
	onClick: () => void;
	disabled?: boolean;
}

export function Button(props: ButtonProps) {

	const [pressed, setPressed] = useState(false);

	const { scale } = useSpring({
		to: {
			scale: pressed ? 0.95 : (props.disabled? 0.9: 1),
		},
		config: config.wobbly,
	})

	const onPress = () => {
		if (props.disabled) return;
		setPressed(true);
	}

	return (
		<animated.button
			className={`
				button 
				button-${props.size || ButtonSize.Default}
				${props.secondary ? 'button-secondary' : ''}
				${pressed ? 'button-pressed' : ''}
				${props.className}
				${props.disabled ? 'button-disabled' : ''}
			`}

			disabled={props.disabled}

			onTouchStart={onPress}
			onTouchEnd={() => setPressed(false)}
			onTouchCancel={() => setPressed(false)}

			onMouseDown={onPress}
			onMouseUp={() => setPressed(false)}
			onMouseOut={() => setPressed(false)}

			onClick={props.onClick}

			style={{
				scale: scale,
			}}
		>{ props.children || props.text }</animated.button>
	);
}

//
// help
//

type HelpButtonProps = {
	className?: string;
}

export function HelpButton(props: HelpButtonProps) {
	const [shown, setShown] = useState(false);

	return <>
		<Button text='Help' secondary={true} size={ButtonSize.Small} className={props.className} onClick={() => { setShown(true) }} />
		<Modal shown={shown}>
			<header>
				<h1>Help</h1>
			</header>
			<article>
				<div>
					<div>
						Support phone
					</div>
					<h2 className='mt-2 fw-bolder'>
						123 456 789
					</h2>
				</div>
			</article>
			<footer>
				<Button text='Close' onClick={() => { setShown(false) }} />
			</footer>
		</Modal>
	</>
}

//
// confirm
//

type ConfirmButtonProps = {
	children?:React.ReactNode;
	size?: ButtonSize;
	secondary?: boolean;
	className?: string;
	disabled?: boolean;

	modalTitle:string;
	modalText:string;
	confirmText:string;
	cancelText:string;
	onConfirm:() => void;
}

export function ConfirmButton(props: ConfirmButtonProps) {
	const [shown, setShown] = useState(false);

	return <>
		<Button size={props.size} disabled={props.disabled} secondary={props.secondary} children={props.children} className={props.className} onClick={() => { setShown(true) }}/>
		<Modal shown={shown}>
			<header>
				<h1>{ props.modalTitle || 'Are you sure?'}</h1>
			</header>
			<article>
				<p>
					{ props.modalText }
				</p>
			</article>
			<footer>
				<Button text={props.confirmText} size={ButtonSize.Small} secondary={true} onClick={() => { setShown(false); props.onConfirm(); }} />
				<Button text={props.cancelText} size={ButtonSize.Small} secondary={false} onClick={() => { setShown(false); }} />
			</footer>
		</Modal>
	</>
}

type CommonConfirmButtonProps = {
	onConfirm:() => void;
}

//
// confirm item return
//

export function ConfirmItemReturnButton(props: CommonConfirmButtonProps) {
	return <ConfirmButton
		modalTitle='Return your item?'
		modalText='Sure you want to return your item?'
		confirmText='Yes'
		cancelText='Continue'
		onConfirm={ () => { props.onConfirm() }}
		size={ButtonSize.Small}
	>Return item</ConfirmButton>
}
