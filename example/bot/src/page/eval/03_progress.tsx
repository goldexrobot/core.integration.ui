import './../page.css';

import { HelpButton } from '../../component/button';
import { Header, HeaderSize } from '../../component/header';
import { Spinner } from '../../component/spinner';
import { useEffect, useState } from 'react';
import Countdown from 'react-countdown';
import { useNavigate } from 'react-router';
import { ReturnIntent, ReturnIntentData, ReturnReason } from './return/progress';
import { ApiError } from '../../service/bot/api/core/ApiResponse';
import { BotAPI, logger, NavIntent } from '../../common';
import { EvalHydroAccepted, EvalSpectrumAccepted } from '../../service/bot/api';
import { EvaluationData } from './04_estimation';

const overallSeconds = 275;

export function EvalProgressPage() {
	const nav = useNavigate();

	const [expiredCountdown, setExpiredCoutdown] = useState(false);

	interface EvaluatedSpectrum {
		accepted?: EvalSpectrumAccepted;
		returnItem?: ReturnIntentData;
	}
	const evalSpectrum = () => {
		return new Promise<EvaluatedSpectrum>((resolve, reject) => {
			BotAPI().eval.evalSpectrum({}).then(res => res.promise()).then(evl => {
				switch (evl.acceptance) {
					case 'accepted':
						resolve({
							accepted: evl,
						});
						return;
					case 'rejected':
						resolve({
							returnItem: ReturnIntent(ReturnReason.ITEM_REJECTED, evl.reason),
						});
						return;
					default:
						resolve({
							returnItem: ReturnIntent(ReturnReason.UNDEFINED),
						});
				}
			}).catch(err => {
				switch ((err as ApiError).code) {
					case 504: // Network is unavailable. Call `eval.return`
						resolve({
							returnItem: ReturnIntent(ReturnReason.NETWORK_UNAVAILABLE),
						});
						return;
				}
				reject(err);
			});
		});
	}

	interface EvaluatedHydro {
		accepted?: EvalHydroAccepted;
		returnItem?: ReturnIntentData;
	}
	const evalHydro = () => {
		return new Promise<EvaluatedHydro>((resolve, reject) => {
			BotAPI().eval.evalHydro({}).then(res => res.promise()).then(evl => {
				switch (evl.acceptance) {
					case 'accepted':
						resolve({
							accepted: evl,
						});
						return;
					case 'rejected':
						resolve({
							returnItem: ReturnIntent(ReturnReason.ITEM_REJECTED, evl.reason),
						});
						return;
					default:
						resolve({
							returnItem: ReturnIntent(ReturnReason.UNDEFINED),
						});
				}
			}).catch(err => {
				switch ((err as ApiError).code) {
					case 503: // Vibration affects the weighing process. Call `eval.return`
						resolve({
							returnItem: ReturnIntent(ReturnReason.UNSTABLE_SCALE),
						});
						return;
					case 504: // Network is unavailable. Call `eval.return`
						resolve({
							returnItem: ReturnIntent(ReturnReason.NETWORK_UNAVAILABLE),
						});
						return;
				}
				reject(err);
			});
		});
	}

	const returnItem = (intent: ReturnIntentData) => {
		nav('/eval/return/progress', {
			state: new NavIntent().withPageArgs(intent),
		});
	}

	useEffect(() => {
		logger.info(`Evaluating spectrum`);
		evalSpectrum().then(spectrum => {
			if (spectrum.returnItem) {
				logger.info(`Returning item after spectrum evaluation`);
				returnItem(spectrum.returnItem as ReturnIntentData);
				return;
			}

			logger.info(`Evaluated spectrum: ${JSON.stringify(spectrum.accepted)}`);

			logger.info(`Evaluating hydro`);
			evalHydro().then(hydro => {
				if (hydro.returnItem) {
					logger.info(`Returning item after hydro evaluation`);
					returnItem(hydro.returnItem as ReturnIntentData);
					return;
				}

				logger.info(`Evaluated hydro: ${JSON.stringify(hydro.accepted)}`);

				nav('/eval/estimation', {
					state: new NavIntent().withPageArgs({
						spectrum: spectrum.accepted,
						hydro: hydro.accepted,
					} as EvaluationData),
				});
			});
		}).catch(err => {
			logger.fatal(`Failed to evaluate item`, err);
		})
	}, []);

	return (
		<div className='page'>
			<header>
				<Header size={HeaderSize.Compact}></Header>
			</header>

			<article>
				<div>
					<h1>Evaluation</h1>
					<Spinner>&nbsp;</Spinner>
					<h2>
						{
							expiredCountdown ? <>Almost there...</> :
								<Countdown daysInHours={true} date={Date.now() + overallSeconds * 1000} onComplete={() => { setExpiredCoutdown(true) }} renderer={(props) => {
									return <>{
										props.formatted.minutes + ":" + props.formatted.seconds
									}</>
								}}></Countdown>
						}
					</h2>
				</div>
			</article>

			<footer>
				<HelpButton />
			</footer>
		</div>
	);
}