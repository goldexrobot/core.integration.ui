/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EvalSpectrumAccepted } from './EvalSpectrumAccepted';
import type { EvalSpectrumRejected } from './EvalSpectrumRejected';

/**
 * Item acceptance decision
 */
export type EvalSpectrumResult = (EvalSpectrumAccepted | EvalSpectrumRejected);
