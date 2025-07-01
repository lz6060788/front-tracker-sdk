import { TrackerPlugin } from "../types";
import { Tracker } from "../tracker";
export declare enum LOGGER_LEVEL {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4
}
declare module '../tracker' {
    interface Tracker {
        logger: Console;
    }
}
export interface consolePluginConfig {
    loggerLevel: LOGGER_LEVEL;
}
export declare class loggerPlugin implements TrackerPlugin {
    tracker: Tracker | null;
    private loggerLevel;
    constructor(config?: Partial<consolePluginConfig>);
    get isDebug(): boolean | undefined;
    install(tracker: Tracker): void;
    createLogger(originalConsole: Console): Console;
}
