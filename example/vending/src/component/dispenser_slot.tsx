import { useState } from "react";
import { Button, ButtonSize } from "./button";

type Props = {
	slotNum: number;
	maxPushes: number;
	onChange: (pushes: number) => void;
}

export function DispenserSlot(props: Props) {

	const [pushes, setPushes] = useState<number>(0);

	const change = (delta: number) => {
		let v = pushes + delta;
		if (v < 0) v = 0;
		if (v > props.maxPushes) v = props.maxPushes;
		setPushes(v);
		props.onChange(v)
	}

	return (
		<div>
			<div>
				<h2>
					Slot {props.slotNum}
				</h2>
			</div>
			<div className='mt-4'>
				<h3 className={!pushes ? 'text-muted' : ''}>
					{!pushes ? <>&mdash;</> : pushes + ' pcs.'}
				</h3>
			</div>
			<div className='d-flex flex-row mt-4 gap-2 align-items-center'>
				<Button size={ButtonSize.SmallSquare} disabled={pushes <= 0} onClick={() => { change(-1) }} >
					<i className="las la-minus"></i>
				</Button>
				<Button size={ButtonSize.SmallSquare} disabled={pushes >= props.maxPushes} onClick={() => { change(1) }} >
					<i className="las la-plus"></i>
				</Button>
			</div>
		</div>
	);
}

