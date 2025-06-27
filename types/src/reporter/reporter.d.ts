import { ReporterDataType, TrackerReporter } from "../types";
export interface ReporterConfig {
    apiUrl: string;
    maxQueueLength: number;
    timeinterval: number;
    maxRetry: number;
    retryInterval: number;
    abatchLength: number;
}
export type ReporterConfigParams = Partial<Omit<ReporterConfig, 'apiUrl'>> & Required<Pick<ReporterConfig, 'apiUrl'>>;
export declare const defaultReporterConfig: Omit<ReporterConfig, 'apiUrl'>;
export declare class DefaultRporter implements TrackerReporter {
    private config;
    private queue;
    private timer;
    private retryCount;
    private isSending;
    private currentBatch;
    constructor(config: ReporterConfigParams);
    private _mergeConfig;
    install(): void;
    add(data: ReporterDataType): void;
    flush(): void;
    private _send;
    start(): void;
    stop(): void;
}
