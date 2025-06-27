import { Tracker } from "src/tracker";
export interface TrackerConfig {
    appId: string;
    sdkVersion: string;
    debug?: boolean;
    userId?: string;
    plugins?: Array<TrackerPlugin>;
    reporter: TrackerReporter;
}
export type ReportType = 'jsError' | 'unhandledRejection' | 'resourceError' | 'xhrError' | 'whiteScreen' | 'performance' | 'logger' | 'action';
export declare const enum LoggerLevelType {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface ReporterDataType {
    type: ReportType;
    appId: string;
    sdkVersion: string;
    userId: string;
    data: Record<string, unknown>;
}
export interface TrackerPlugin {
    tracker: Tracker;
    install: () => void;
}
export interface TrackerReporter {
    install(): void;
    add(data: ReporterDataType): void;
}
