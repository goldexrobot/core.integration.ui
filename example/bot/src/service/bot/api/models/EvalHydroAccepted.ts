/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type EvalHydroAccepted = {
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
     * Evaluation confidence, 1.0 - is confident, 0.0 - is not, 0.8 - is 'pretty' confident
     */
    confidence: number;
    /**
     * Millesimal fineness, 585 stands for 58.5%, 999 for 99.9%, 9999 for 99.99%
     */
    millesimal: number;
    /**
     * Content of the valuable metal in percents
     */
    purity: number;
    /**
     * Automatic decision result
     */
    risky: boolean;
    /**
     * Warnings that should help with decision. For instance, there could be a tungsten covered with gold.
     */
    warnings: Array<string>;
    /**
     * Weight in grams
     */
    weight: number;
};
