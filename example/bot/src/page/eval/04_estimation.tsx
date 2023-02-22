import './../page.css';
import './estimation.css';

import { Button, ButtonSize, ConfirmItemReturnButton, HelpButton } from '../../component/button';
import { Header, HeaderSize, HeadIcon } from '../../component/header';
import { useLocation, useNavigate } from 'react-router';
import { ReturnIntent, ReturnReason } from './return/progress';
import { NavIntent } from '../../common';
import { EvalHydroAccepted, EvalSpectrumAccepted } from '../../service/bot/api';

export type EvaluationData = {
	spectrum: EvalSpectrumAccepted;
	hydro: EvalHydroAccepted;
}

export function EvalEstimationPage() {
	const location = useLocation();
	const nav = useNavigate();

	const evaluation = NavIntent.fromLocation(location)?.args as EvaluationData;

	type spectrumElement = {
		element:string;
		content:number;
	};
	const els = new Array<spectrumElement>();
	for (const k in evaluation.spectrum.spectrum) {
		els.push({
			element: k,
			content: evaluation.spectrum.spectrum[k],
		});
	}
	els.sort((a,b) => b.content - a.content);

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<HeadIcon name='la-check-circle' />
				<h1>Result</h1>

				<div className='estimation'>
				<div className="estimation-row">
						<div className='estimation-key'>Weight</div>
						<div className='estimation-val'>{evaluation?.hydro.weight} gr</div>
					</div>
					<div className="estimation-row">
						<div className='estimation-key'>Spectrum</div>
						<div className='estimation-val'>
							{ 
								els.slice(0,3).map(v => 
									<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}} key={'eval_spectrum_' + v.element}>
										<div className='monospace' style={{ fontSize: '36px' }}>{v.element.toUpperCase()}</div>
										<div className='monospace' style={{ fontSize: '36px', textAlign: 'end', paddingLeft: '0.5em' }}>{v.content.toFixed(2)}%</div>
									</div>
								)
							}
						</div>
					</div>
					<div className="estimation-divider"></div>
					<div className="estimation-row">
						<div className='estimation-val estimation-total'>
							{evaluation?.hydro.alloy.toUpperCase()}&nbsp;
							{evaluation?.hydro.millesimal}&nbsp;({evaluation?.hydro.carat})
						</div>
					</div>
				</div>

				<div className='mt-5'>
					<Button size={ButtonSize.Big} onClick={() => { nav('/eval/store'); }}>
						Move to storage
					</Button>
				</div>
			</article>

			<footer>
				<ConfirmItemReturnButton onConfirm={() => {
					nav('/eval/return/progress', {
						state: new NavIntent().withPageArgs(ReturnIntent(ReturnReason.CUSTOMER_CHOICE)),
					});
				}} />
				<HelpButton />
			</footer>
		</div >
	);
}