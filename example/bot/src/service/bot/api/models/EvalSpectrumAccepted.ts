/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Item is accepted
 */
export type EvalSpectrumAccepted = {
    acceptance: 'accepted';
    /**
     * Valuable metal
     */
    alloy: string;
    /**
     * Fineness in carats
     */
    carat: string;
    /**
     * Millesimal fineness. 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
     */
    millesimal: number;
    /**
     * Content of the valuable metal in percents
     */
    purity: number;
    /**
     * Spectrum data
     */
    spectrum: Record<string, number>;
};
