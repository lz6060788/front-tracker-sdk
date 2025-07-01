import { Tracker } from "../tracker";
import { ReporterDataType, TrackerReporter } from "../types";
export type ReportorType = 'fetch' | 'image' | 'sendbeacon';
export interface ReporterConfig {
    reportType: ReportorType;
    apiUrl: string;
    apiMethod: 'POST' | 'GET';
    maxQueueLength: number;
    timeinterval: number;
    maxRetry: number;
    retryInterval: number;
    abatchLength: number;
}
export type ReporterConfigParams = Partial<Omit<ReporterConfig, 'apiUrl'>> & Required<Pick<ReporterConfig, 'apiUrl'>>;
export declare const defaultReporterConfig: Omit<ReporterConfig, 'apiUrl'>;
export declare class Rporter implements TrackerReporter {
    private tracker;
    private config;
    private queue;
    private timer;
    private retryCount;
    private isSending;
    private currentBatch;
    private _imgDom;
    constructor(config: ReporterConfigParams);
    private _mergeConfig;
    private get isDebug();
    install(tracker: Tracker): void;
    add(data: ReporterDataType): void;
    flush(): void;
    private _send;
    start(): void;
    stop(): void;
    private _sendByFetch;
    private _sendByImage;
    private _sendByBeacon;
    private _getLocalStorageKey;
    private saveQueue;
    private loadQueue;
}
