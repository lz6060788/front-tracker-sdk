import { Tracker } from "src/tracker";
import { ReporterConfig, ReporterDataType } from "./types";
export declare const defaultReporterConfig: ReporterConfig;
export declare class reporter {
    private config;
    private queue;
    private timer;
    private retryCount;
    private tracker;
    private isSending;
    private currentBatch;
    constructor(config: Partial<ReporterConfig>, tracker: Tracker);
    private _mergeConfig;
    add(data: ReporterDataType): void;
    flush(): void;
    private _send;
    start(): void;
    stop(): void;
}
