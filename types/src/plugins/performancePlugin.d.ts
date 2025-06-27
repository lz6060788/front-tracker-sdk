import { TrackerPlugin } from "src/types";
import { Tracker } from "../tracker";
export declare class performancePlugin implements TrackerPlugin {
    tracker: Tracker;
    constructor(tracker: Tracker);
    install(): void;
}
