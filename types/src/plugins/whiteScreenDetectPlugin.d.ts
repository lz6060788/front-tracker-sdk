import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";
export interface WhiteScreenDetectPluginConfig {
    frameElementIds: string[];
    numSamples: number;
    delay: number;
    autoDetect: boolean;
}
export declare class WhiteScreenDetectPlugin implements TrackerPlugin {
    tracker: Tracker | null;
    private frameElementIds;
    private numSamples;
    private delay;
    private autoDetect;
    constructor(config: Partial<WhiteScreenDetectPluginConfig>);
    get isDebug(): boolean | undefined;
    install(tracker: Tracker): void;
    getSamplePoints(): number[][];
    checkInvalidElement(ele: Element): 0 | 1;
    handleDetectScreen(): void;
}
