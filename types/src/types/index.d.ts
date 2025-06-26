import { TrackerPlugin } from "src/plugins";
export interface TrackerConfig {
    appId: string;
    apiUrl: string;
    sdkVersion: string;
    debug?: boolean;
    loggerLevel?: LoggerLevelType;
    userId?: string;
    reporterConfig?: Partial<ReporterConfig>;
    plugins?: Array<TrackerPlugin>;
}
export type ReportType = 'jsError' | 'unhandledRejection' | 'resourceError' | 'xhrError' | 'whiteScreen' | 'performance' | 'logger' | 'action';
export declare const enum LoggerLevelType {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface ReporterConfig {
    maxQueueLength: number;
    timeinterval: number;
    maxRetry: number;
    retryInterval: number;
    abatchLength: number;
}
export interface ReporterDataType {
    type: ReportType;
    appId: string;
    sdkVersion: string;
    userId: string;
    data: Record<string, unknown>;
}
